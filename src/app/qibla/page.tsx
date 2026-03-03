
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Compass, Target, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

export default function QiblaPage() {
  const router = useRouter()
  const [degree, setDegree] = useState(0)

  // Simulation of compass movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDegree(prev => (prev + (Math.random() - 0.5) * 2) % 360)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="pb-12 pt-10 px-5 space-y-12 animate-in fade-in duration-500 flex flex-col min-h-screen">
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

      <div className="flex-1 flex flex-col items-center justify-center space-y-16">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
            <MapPin className="w-3 h-3" />
            Jakarta, Indonesia
          </div>
          <h2 className="text-4xl font-black tracking-tighter">292.4° BL</h2>
        </div>

        {/* Compass Visual */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/5 rounded-full border-2 border-dashed border-primary/20 animate-[spin_20s_linear_infinite]" />
          
          {/* Compass Ring */}
          <div className="w-full h-full rounded-full border-[12px] border-secondary shadow-2xl relative flex items-center justify-center bg-card">
            {/* Degree Markers */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
              <div 
                key={d} 
                className="absolute w-full h-full p-6 text-center" 
                style={{ transform: `rotate(${d}deg)` }}
              >
                <span className="text-[10px] font-black opacity-20">{d % 90 === 0 ? ['U', 'T', 'S', 'B'][d/90] : d}</span>
              </div>
            ))}

            {/* The Needle */}
            <div 
              className="w-full h-full absolute transition-transform duration-150 ease-out flex items-center justify-center"
              style={{ transform: `rotate(${degree}deg)` }}
            >
              <div className="relative h-full w-2 flex flex-col items-center justify-center">
                <div className="h-1/2 w-full bg-primary rounded-full shadow-[0_0_15px_hsl(var(--primary))]" />
                <div className="h-1/2 w-full bg-muted rounded-full" />
                <div className="absolute top-4 bg-primary p-2 rounded-full shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Center Piece */}
            <div className="w-20 h-20 bg-card rounded-full shadow-inner flex items-center justify-center border-4 border-secondary z-20">
              <Compass className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-4 max-w-xs">
          <div className="bg-primary/10 px-4 py-2 rounded-full text-[10px] font-black text-primary uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Berhasil Dikalibrasi
          </div>
          <p className="text-xs text-muted-foreground font-medium italic">
            Letakkan ponsel di permukaan datar dan jauhkan dari medan magnet.
          </p>
        </div>
      </div>
    </div>
  )
}
