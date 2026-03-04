
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MapPin, 
  ChevronDown, 
  LayoutGrid, 
  Book, 
  FileText, 
  Compass, 
  Heart,
  Sun,
  CloudSun,
  CloudMoon,
  Clock,
  MoonStar,
  Sparkles,
  Calendar as CalendarIcon
} from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { useLocation } from "@/hooks/use-location"
import { prayerService } from "@/services/prayer-service"
import { PrayerSchedule } from "@/app/lib/prayer-data"



export default function Home() {
  const { province, city, isLoaded } = useLocation()
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null)
  const [countdown, setCountdown] = useState({ h: "00", m: "00", s: "00" })
  const [hijriDate, setHijriDate] = useState<string>("Memuat...")

  useEffect(() => {
    if (isLoaded) {
      prayerService.getSchedules(province, city).then(data => {
        if (data && data.jadwal) {
          const todayDate = new Date().getDate()
          const found = data.jadwal.find((s: any) => s.tanggal === todayDate)
          setSchedule(found || data.jadwal[0])
        }
      })
    }
  }, [province, city, isLoaded])

  useEffect(() => {
  if (!schedule?.tanggal_lengkap) return
  const fetchHijri = async () => {
    try {
      // format dari equran: 2026-03-04
      const [year, month, day] = schedule.tanggal_lengkap.split("-")
      // format yang dibutuhkan AlAdhan: DD-MM-YYYY
      const formattedDate = `${day}-${month}-${year}`

      const res = await fetch(
        `https://api.aladhan.com/v1/gToH?date=${formattedDate}`
      )
      const json = await res.json()
      if (json?.data?.hijri) {
        const h = json.data.hijri

        // contoh: 24 Sha'ban 1447
        setHijriDate(`${h.day} ${h.month.en} ${h.year}`)
      }
    } catch (error) {
      console.error("Hijri conversion failed:", error)
      setHijriDate("—")
    }
  }

  fetchHijri()
}, [schedule?.tanggal_lengkap])

  const prayers = useMemo(() => {
    if (!schedule) return []
    return [
      { name: "Imsak", time: schedule.imsak, icon: CloudMoon },
      { name: "Subuh", time: schedule.subuh, icon: CloudMoon },
      { name: "Dzuhur", time: schedule.dzuhur, icon: Sun },
      { name: "Ashar", time: schedule.ashar, icon: CloudSun },
      { name: "Maghrib", time: schedule.maghrib, icon: MoonStar },
      { name: "Isya", time: schedule.isya, icon: MoonStar },
    ]
  }, [schedule])

  const nextPrayer = useMemo(() => {
    if (!prayers.length) return { name: "...", time: "--:--" }
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    for (const p of prayers) {
      const [h, m] = p.time.split(':').map(Number)
      if (h * 60 + m > currentMinutes) return p
    }
    return prayers[0]
  }, [prayers])

  useEffect(() => {
    if (!nextPrayer.time || nextPrayer.time === "--:--") return

    const timer = setInterval(() => {
      const now = new Date()
      const [h, m] = nextPrayer.time.split(':').map(Number)
      
      let target = new Date()
      target.setHours(h, m, 0, 0)

      if (target.getTime() < now.getTime()) {
        target.setDate(target.getDate() + 1)
      }

      const diff = target.getTime() - now.getTime()
      
      const hh = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const mm = Math.floor((diff / (1000 * 60)) % 60)
      const ss = Math.floor((diff / 1000) % 60)

      setCountdown({
        h: hh.toString().padStart(2, '0'),
        m: mm.toString().padStart(2, '0'),
        s: ss.toString().padStart(2, '0')
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [nextPrayer.time])

  const gregorianDate = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }, [])

  const menuItems = [
    { label: "Quran", icon: Book, href: "/quran", color: "text-primary" },
    { label: "Doa", icon: FileText, href: "/duas", color: "text-primary" },
    { label: "Kiblat", icon: Compass, href: "/qibla", color: "text-primary" },
    { label: "Tasbih", icon: LayoutGrid, href: "/tasbih", color: "text-primary" },
    { label: "Favorit", icon: Heart, href: "/favorites", color: "text-primary" },
    { label: "Jadwal", icon: Clock, href: "/prayer-times", color: "text-primary" },
  ]

  if (!isLoaded) return null

  return (
    <div className="pb-12 pt-6 px-4 md:px-8 space-y-8 bg-background min-h-screen text-foreground animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <Link href="/prayer-times" className="flex items-center gap-2 bg-secondary/50 py-2.5 px-4 rounded-2xl border border-border/50 backdrop-blur-md hover:bg-secondary/80 transition-all">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold tracking-tight truncate max-w-[120px] sm:max-w-none">
            {city.replace('Kota ', '').replace('Kab. ', '')}
          </span>
          <ChevronDown className="w-4 h-4 opacity-40" />
        </Link>
        <div className="flex gap-2">
          <ModeToggle />
        </div>
      </header>

      <Card className="border-none bg-gradient-to-br from-primary via-emerald-600 to-teal-800 text-primary-foreground rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-10px_rgba(16,185,129,0.3)] relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
        <CardContent className="p-6 sm:p-8 space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-medium tracking-tight opacity-90">Assalamu'alaikum,</h2>
            </div>
            <div className="inline-flex items-center gap-2 bg-black/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-inner max-w-full">
               <CalendarIcon className="w-3.5 h-3.5 opacity-60 shrink-0" />
               <span className="text-[9px] sm:text-[10px] font-bold tracking-wide uppercase truncate">
                {gregorianDate} <span className="mx-1 opacity-30">•</span> {hijriDate}
               </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                 <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 truncate">Mendatang</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter drop-shadow-lg truncate">
                {nextPrayer.name === "..." ? "Memuat" : nextPrayer.name}
              </h1>
              <p className="text-base sm:text-lg font-bold opacity-80 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 opacity-60" />
                {nextPrayer.time}
              </p>
            </div>

            <div className="relative w-full sm:w-auto">
              <div className="bg-white/10 backdrop-blur-2xl p-4 sm:p-5 rounded-[2rem] border border-white/20 text-center shadow-2xl relative overflow-hidden">
                <p className="text-xl sm:text-2xl font-black tabular-nums tracking-tighter text-white">
                  {countdown.h}<span className="animate-pulse mx-0.5">:</span>{countdown.m}<span className="animate-pulse mx-0.5">:</span>{countdown.s}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 mt-1 text-white/70">tersisa</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-secondary/80 rounded-xl">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">Jadwal Sholat</h3>
        </div>

        <Card className="border-none bg-secondary/30 backdrop-blur-sm rounded-[2rem] sm:rounded-[2.5rem] p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {prayers.length > 0 ? prayers.map((p) => (
              <div 
                key={p.name} 
                className={cn(
                  "flex flex-col items-center justify-center p-4 sm:p-5 rounded-[1.8rem] sm:rounded-[2rem] transition-all relative overflow-hidden",
                  nextPrayer.name === p.name 
                    ? "bg-primary/10 border border-primary/30 shadow-lg shadow-primary/5" 
                    : "bg-transparent hover:bg-primary/5"
                )}
              >
                <p.icon className={cn("w-5 h-5 mb-2 sm:mb-3 opacity-40", nextPrayer.name === p.name && "text-primary opacity-100")} />
                <p className={cn("text-[9px] sm:text-[10px] font-medium opacity-60 mb-0.5", nextPrayer.name === p.name && "text-primary opacity-100")}>{p.name}</p>
                <p className={cn("text-base sm:text-lg font-black tracking-tight", nextPrayer.name === p.name && "text-primary")}>{p.time}</p>
              </div>
            )) : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-secondary/20 animate-pulse h-28" />
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-secondary/80 rounded-xl">
            <LayoutGrid className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-bold tracking-tight">Menu Utama</h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-3 group active:scale-95 transition-all">
              <div className="w-full aspect-square rounded-[1.8rem] sm:rounded-[2.2rem] bg-secondary/40 border border-border/50 flex items-center justify-center group-hover:bg-secondary/60 group-hover:border-primary/20 transition-all shadow-sm">
                <item.icon className={cn("w-7 h-7 sm:w-8 sm:h-8", item.color)} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-tight opacity-70 group-hover:opacity-100">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
