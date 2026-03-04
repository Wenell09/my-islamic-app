"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Compass, Target, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function QiblaPage() {
  const [heading, setHeading] = useState(0)
  const [qiblaDir, setQiblaDir] = useState(0)
  const [locationName, setLocationName] = useState("Mencari lokasi...")
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [locked, setLocked] = useState(false)

  const headingRef = useRef(0)
  const lastUpdateRef = useRef(0)

  /* =========================
     HITUNG ARAH KIBLAT
  ========================= */
  const calculateQibla = (lat: number, lng: number) => {
    const phiK = (21.4225 * Math.PI) / 180
    const lambdaK = (39.8262 * Math.PI) / 180
    const phi = (lat * Math.PI) / 180
    const lambda = (lng * Math.PI) / 180
    const deltaL = lambdaK - lambda

    const y = Math.sin(deltaL)
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaL)
    let qibla = (Math.atan2(y, x) * 180) / Math.PI

    return (qibla + 360) % 360
  }

  /* =========================
     HANDLE ORIENTATION
  ========================= */
  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      let compassHeading: number | null = null

      // iOS Safari
      const anyEvent = event as any
      if (anyEvent.webkitCompassHeading != null) {
        compassHeading = anyEvent.webkitCompassHeading
      }
      // Android absolute
      else if (event.absolute === true && event.alpha != null) {
        compassHeading = 360 - event.alpha
      }

      if (compassHeading == null) return

      const now = Date.now()
      if (now - lastUpdateRef.current < 33) return
      lastUpdateRef.current = now

      const prev = headingRef.current
      let diff = compassHeading - prev

      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360

      if (Math.abs(diff) < 0.4) return

      const smoothFactor = 0.12
      const smoothed = prev + diff * smoothFactor

      headingRef.current = smoothed
      setHeading(smoothed)

      const deltaToQibla =
        Math.abs(((smoothed - qiblaDir + 540) % 360) - 180)

      if (deltaToQibla < 2) {
        if (!locked) {
          setLocked(true)
          if ("vibrate" in navigator) navigator.vibrate(100)
        }
      } else {
        if (locked) setLocked(false)
      }

      if (Math.abs(diff) > 60) {
        setError("Kompas perlu kalibrasi. Gerakkan ponsel membentuk angka 8.")
      }
    },
    [qiblaDir, locked]
  )

  /* =========================
     START SENSOR
  ========================= */
  const startSensors = async () => {
    setError(null)

    // Ambil lokasi
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setQiblaDir(calculateQibla(latitude, longitude))

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await res.json()
            setLocationName(
              data.address?.city ||
              data.address?.town ||
              data.address?.state ||
              "Lokasi Anda"
            )
          } catch {
            setLocationName(
              `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
            )
          }
        },
        () => setError("Izin lokasi ditolak.")
      )
    }

    // Permission iOS
    const DeviceOrientationAny =
      window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">
      }

    if (
      typeof DeviceOrientationAny !== "undefined" &&
      typeof DeviceOrientationAny.requestPermission === "function"
    ) {
      try {
        const response =
          await DeviceOrientationAny.requestPermission()

        if (response === "granted") {
          window.addEventListener(
            "deviceorientation",
            handleOrientation
          )
          setPermissionGranted(true)
        } else {
          setError("Izin kompas ditolak.")
        }
      } catch {
        setError("Gagal meminta izin kompas.")
      }
    } else {
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation as any
      )
      window.addEventListener(
        "deviceorientation",
        handleOrientation
      )
      setPermissionGranted(true)
    }
  }

  /* =========================
     INIT
  ========================= */
  useEffect(() => {
    startSensors()

    return () => {
      window.removeEventListener(
        "deviceorientation",
        handleOrientation
      )
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation as any
      )
    }
  }, [handleOrientation])

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Masalah Sensor</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase">
          <MapPin className="w-3 h-3" />
          {locationName}
        </div>

        <h2 className="text-4xl font-black">
          {qiblaDir.toFixed(1)}°
        </h2>

        {locked && (
          <div className="text-green-500 text-sm font-bold animate-pulse">
            ✔ Arah Kiblat Terkunci
          </div>
        )}
      </div>

      <div className="relative w-72 h-72 flex items-center justify-center">
        <div
          className="absolute w-full h-full rounded-full border-8 transition-transform duration-100"
          style={{ transform: `rotate(${-heading}deg)` }}
        />

        <div
          className="absolute w-2 h-full bg-primary rounded-full"
          style={{ transform: `rotate(${qiblaDir}deg)` }}
        />

        <Target className="absolute w-8 h-8 text-primary" />
      </div>

      <Button variant="ghost" onClick={startSensors}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Kalibrasi Ulang
      </Button>
    </div>
  )
}