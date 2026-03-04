"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Target, MapPin, AlertCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function QiblaPage() {
  const router = useRouter()
  const [heading, setHeading] = useState(0) // Arah hadap perangkat (0 = Utara)
  const [qiblaDir, setQiblaDir] = useState(0) // Sudut kiblat dari Utara
  const [locationName, setLocationName] = useState("Mencari Lokasi...")
  const [error, setError] = useState<string | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  // Rumus hitung sudut kiblat
  const calculateQibla = (lat: number, lng: number) => {
    const phiK = (21.4225 * Math.PI) / 180 // Lat Ka'bah
    const lambdaK = (39.8262 * Math.PI) / 180 // Lng Ka'bah
    const phi = (lat * Math.PI) / 180
    const lambda = (lng * Math.PI) / 180
    const deltaL = lambdaK - lambda

    const y = Math.sin(deltaL)
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaL)
    let qibla = (Math.atan2(y, x) * 180) / Math.PI
    return (qibla + 360) % 360
  }

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // webkitCompassHeading tersedia di iOS Safari
    // @ts-ignore
    const compassHeading = event.webkitCompassHeading || (360 - (event.alpha || 0))
    if (compassHeading !== undefined) {
      setHeading(compassHeading)
    }
  }, [])

  const startSensors = async () => {
    try {
      // 1. Minta Izin Lokasi
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const angle = calculateQibla(latitude, longitude)
            setQiblaDir(angle)
            
            // Coba ambil nama kota (Reverse Geocoding sederhana)
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
              const data = await res.json()
              setLocationName(data.address.city || data.address.town || data.address.state || "Lokasi Anda")
            } catch {
              setLocationName(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
            }
          },
          () => {
            setError("Izin lokasi ditolak. Harap aktifkan GPS untuk hasil akurat.")
          }
        )
      }

      // 2. Minta Izin Orientasi (Khusus iOS)
      // @ts-ignore
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission()
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation)
          setPermissionGranted(true)
        } else {
          setError("Izin kompas ditolak.")
        }
      } else {
        // Android & PC
        window.addEventListener('deviceorientationabsolute', handleOrientation as any)
        window.addEventListener('deviceorientation', handleOrientation)
        setPermissionGranted(true)
      }
    } catch (err) {
      console.error(err)
      setError("Gagal mengakses sensor perangkat.")
    }
  }

  useEffect(() => {
    // Deteksi jika perangkat adalah iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
    
    // Auto start untuk non-iOS jika memungkinkan
    if (!(/iPad|iPhone|iPod/.test(navigator.userAgent))) {
       startSensors();
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      window.removeEventListener('deviceorientationabsolute', handleOrientation as any)
    }
  }, [handleOrientation])

  return (
    <div className="pb-12 pt-10 px-5 space-y-12 animate-in fade-in duration-500 flex flex-col min-h-screen bg-background">
      <header className="flex justify-between items-center">
        <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary" onClick={() => router.push('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">Pencari Kiblat</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Arah Ka'bah</p>
        </div>
        <div className="w-10" />
      </header>

      {error && (
        <Alert variant="destructive" className="rounded-3xl border-none bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Masalah Sensor</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex flex-col items-center justify-center space-y-16">
        {!permissionGranted && isIOS ? (
          <div className="text-center space-y-6">
            <div className="p-8 bg-secondary/50 rounded-full inline-block animate-pulse">
              <Compass className="w-16 h-16 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="font-black text-lg">Kompas Memerlukan Izin</h3>
              <p className="text-xs text-muted-foreground max-w-[250px] mx-auto">Untuk menentukan arah kiblat, kami memerlukan akses ke sensor orientasi perangkat Anda.</p>
            </div>
            <Button onClick={startSensors} className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest bg-primary text-white">
              Aktifkan Kompas
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                <MapPin className="w-3 h-3" />
                {locationName}
              </div>
              <h2 className="text-4xl font-black tracking-tighter tabular-nums">
                {qiblaDir.toFixed(1)}° <span className="text-lg opacity-40">DARI UTARA</span>
              </h2>
            </div>

            {/* Visual Kompas */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Outer Ring Animation */}
              <div className="absolute inset-0 bg-primary/5 rounded-full border-2 border-dashed border-primary/20 animate-[spin_60s_linear_infinite]" />
              
              {/* Main Compass */}
              <div 
                className="w-full h-full rounded-full border-[12px] border-secondary shadow-2xl relative flex items-center justify-center bg-card transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                {/* Degree Markers */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
                  <div 
                    key={d} 
                    className="absolute w-full h-full p-4 text-center" 
                    style={{ transform: `rotate(${d}deg)` }}
                  >
                    <span className={cn(
                      "text-[10px] font-black",
                      d === 0 ? "text-rose-500" : "opacity-20"
                    )}>
                      {d === 0 ? 'U' : d === 90 ? 'T' : d === 180 ? 'S' : d === 270 ? 'B' : ''}
                    </span>
                  </div>
                ))}

                {/* Jarum Kiblat */}
                <div 
                  className="w-full h-full absolute transition-all duration-300 flex items-center justify-center"
                  style={{ transform: `rotate(${qiblaDir}deg)` }}
                >
                  <div className="relative h-full w-2 flex flex-col items-center justify-center">
                    <div className="h-1/2 w-full bg-primary rounded-t-full shadow-[0_0_20px_hsl(var(--primary))]" />
                    <div className="h-1/2 w-full bg-muted/20 rounded-b-full" />
                    <div className="absolute top-8 bg-primary p-2.5 rounded-full shadow-2xl border-4 border-card group animate-bounce">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Center Piece */}
                <div className="w-20 h-20 bg-card rounded-full shadow-inner flex items-center justify-center border-4 border-secondary z-20">
                  <Compass className="w-8 h-8 text-primary opacity-40" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-6 max-w-xs">
              <div className="bg-primary/10 px-5 py-2.5 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Sensor Terkalibrasi
              </div>
              <p className="text-[11px] text-muted-foreground font-medium italic leading-relaxed px-4">
                Letakkan ponsel di permukaan datar. Ikuti ikon <Target className="inline w-3 h-3 text-primary" /> untuk menemukan arah kiblat.
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100"
                onClick={startSensors}
              >
                <RefreshCw className="w-3 h-3 mr-2" /> Kalibrasi Ulang
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
