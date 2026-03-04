"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Target, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function QiblaPage() {
  const router = useRouter()

  const [heading, setHeading] = useState(0)
  const [qiblaDir, setQiblaDir] = useState(0)
  const [locationName, setLocationName] = useState("Mencari Lokasi...")
  const [error, setError] = useState<string | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [locked, setLocked] = useState(false)

  const headingRef = useRef(0)
  const lastUpdateRef = useRef(0)

  /* ==============================
     HITUNG ARAH KIBLAT (AKURAT)
  ============================== */
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

  /* ==============================
     SENSOR HANDLER (ANTI GOYANG)
  ============================== */
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let compassHeading: number | null = null

    // iOS Safari
    // @ts-ignore
    if (event.webkitCompassHeading) {
      // @ts-ignore
      compassHeading = event.webkitCompassHeading
    }

    // Android absolute reference
    else if (event.absolute === true && event.alpha !== null) {
      compassHeading = 360 - event.alpha
    }

    if (compassHeading === null) return

    const now = Date.now()
    if (now - lastUpdateRef.current < 33) return // 30 FPS max
    lastUpdateRef.current = now

    const prev = headingRef.current
    let diff = compassHeading - prev

    // Fix jump dari 359 → 0
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360

    // Ignore jitter kecil
    if (Math.abs(diff) < 0.4) return

    const smoothFactor = 0.12
    const smoothed = prev + diff * smoothFactor

    headingRef.current = smoothed
    setHeading(smoothed)

    /* ==============================
       LOCK DETECTION + VIBRATION
    ============================== */
    const deltaToQibla = Math.abs(((smoothed - qiblaDir + 540) % 360) - 180)

    if (deltaToQibla < 2) {
      if (!locked) {
        setLocked(true)
        if ("vibrate" in navigator) navigator.vibrate(100)
      }
    } else {
      if (locked) setLocked(false)
    }

    // Kalau terlalu liar → minta kalibrasi
    if (Math.abs(diff) > 60) {
      setError("Kompas perlu kalibrasi. Gerakkan ponsel membentuk angka 8.")
    }

  }, [qiblaDir, locked])

  /* ==============================
     START SENSOR
  ============================== */
  const startSensors = async () => {
    setError(null)

    // 1️⃣ Lokasi
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const angle = calculateQibla(latitude, longitude)
          setQiblaDir(angle)

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await res.json()
            setLocationName(
              data.address.city ||
              data.address.town ||
              data.address.state ||
              "Lokasi Anda"
            )
          } catch {
            setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
          }
        },
        () => {
          setError("Izin lokasi ditolak. Aktifkan GPS untuk akurasi.")
        }
      )
    }

    // 2️⃣ Orientation Permission (iOS)
   const DeviceOrientationAny =
  window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<"granted" | "denied">
  }

if (
  typeof DeviceOrientationAny !== "undefined" &&
  typeof DeviceOrientationAny.requestPermission === "function"
) {
  const response = await DeviceOrientationAny.requestPermission()

  if (response === "granted") {
    window.addEventListener("deviceorientation", handleOrientation)
    setPermissionGranted(true)
  } else {
    setError("Izin kompas ditolak.")
  }
} else {
  window.addEventListener("deviceorientationabsolute", handleOrientation as any)
  window.addEventListener("deviceorientation", handleOrientation)
  setPermissionGranted(true)
}

  /* ==============================
     INIT
  ============================== */
  useEffect(() => {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isiOS)

    if (!isiOS) startSensors()

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
      window.removeEventListener("deviceorientationabsolute", handleOrientation as any)
    }
  }, [handleOrientation])

  /* ==============================
     UI
  ============================== */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-10 bg-background">

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Masalah Sensor</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!permissionGranted && isIOS ? (
        <div className="text-center space-y-6">
          <Compass className="w-16 h-16 mx-auto opacity-40 animate-pulse" />
          <Button onClick={startSensors}>
            Aktifkan Kompas
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary text-xs font-bold uppercase">
              <MapPin className="w-3 h-3" />
              {locationName}
            </div>

            <h2 className="text-4xl font-black tabular-nums">
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
              className="absolute w-full h-full rounded-full border-8 border-secondary bg-card shadow-xl transition-transform duration-100"
              style={{ transform: `rotate(${-heading}deg)` }}
            />

            <div
              className="absolute w-2 h-full bg-primary rounded-full transition-transform duration-200"
              style={{ transform: `rotate(${qiblaDir}deg)` }}
            />

            <Target className="absolute w-8 h-8 text-primary" />
          </div>

          <Button variant="ghost" onClick={startSensors}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Kalibrasi Ulang
          </Button>
        </>
      )}
    </div>
  )
}}