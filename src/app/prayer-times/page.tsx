
"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MapPin, 
  ChevronRight, 
  Clock, 
  ArrowLeft, 
  Sunrise,
  Sun,
  CloudSun,
  CloudMoon,
  MoonStar,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocation } from "@/hooks/use-location"
import { prayerService } from "@/services/prayer-service"
import { PrayerSchedule } from "@/app/lib/prayer-data"

export default function PrayerTimes() {
  const router = useRouter()
  const { province, city, updateLocation, isLoaded } = useLocation()
  
  const [provinces, setProvinces] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [monthlySchedules, setMonthlySchedules] = useState<PrayerSchedule[]>([])
  const [viewedDay, setViewedDay] = useState<number>(new Date().getDate())
  
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [countdown, setCountdown] = useState({ h: "--", m: "--", s: "--" })

  useEffect(() => {
    async function loadInitial() {
      const provs = await prayerService.getProvinces()
      setProvinces(provs)
      setLoadingProvinces(false)
      
      if (province) {
        const cityList = await prayerService.getCities(province)
        setCities(cityList)
        const data = await prayerService.getSchedules(province, city)
        if (data) setMonthlySchedules(data.jadwal)
      }
    }
    if (isLoaded) loadInitial()
  }, [isLoaded])

  const handleProvinceChange = async (val: string) => {
    const cityList = await prayerService.getCities(val)
    setCities(cityList)
    
    if (cityList.length > 0) {
      const defaultCity = cityList[0]
      updateLocation(val, defaultCity)
      setViewedDay(new Date().getDate())
      fetchData(val, defaultCity)
    }
  }

  const handleCityChange = (val: string) => {
    updateLocation(province, val)
    setViewedDay(new Date().getDate())
    fetchData(province, val)
  }

  const fetchData = async (p: string, c: string) => {
    setLoadingSchedule(true)
    const data = await prayerService.getSchedules(p, c)
    if (data) setMonthlySchedules(data.jadwal)
    setLoadingSchedule(false)
  }

  const currentViewedSchedule = useMemo(() => {
    return monthlySchedules.find(s => s.tanggal === viewedDay) || null
  }, [monthlySchedules, viewedDay])

  const todaySchedule = useMemo(() => {
    const today = new Date().getDate()
    return monthlySchedules.find(s => s.tanggal === today) || null
  }, [monthlySchedules])

  const prayers = useMemo(() => {
    if (!currentViewedSchedule) return []
    return [
      { name: "Subuh", time: currentViewedSchedule.subuh, icon: CloudMoon },
      { name: "Terbit", time: currentViewedSchedule.terbit, icon: Sunrise },
      { name: "Dzuhur", time: currentViewedSchedule.dzuhur, icon: Sun },
      { name: "Ashar", time: currentViewedSchedule.ashar, icon: CloudSun },
      { name: "Maghrib", time: currentViewedSchedule.maghrib, icon: MoonStar },
      { name: "Isya", time: currentViewedSchedule.isya, icon: MoonStar },
    ]
  }, [currentViewedSchedule])

  const nextPrayer = useMemo(() => {
    if (!todaySchedule) return { name: "-", time: "--:--" }
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const list = [
      { name: "Subuh", time: todaySchedule.subuh },
      { name: "Terbit", time: todaySchedule.terbit },
      { name: "Dzuhur", time: todaySchedule.dzuhur },
      { name: "Ashar", time: todaySchedule.ashar },
      { name: "Maghrib", time: todaySchedule.maghrib },
      { name: "Isya", time: todaySchedule.isya },
    ]
    for (const p of list) {
      const [h, m] = p.time.split(':').map(Number)
      if (h * 60 + m > currentMinutes) return p
    }
    return list[0]
  }, [todaySchedule])

  useEffect(() => {
    if (!nextPrayer.time || nextPrayer.time === "--:--") return;
    const timer = setInterval(() => {
      const now = new Date();
      const [h, m] = nextPrayer.time.split(':').map(Number);
      let target = new Date();
      target.setHours(h, m, 0, 0);
      if (target.getTime() < now.getTime()) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      setCountdown({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
        m: Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0'),
        s: Math.floor((diff / 1000) % 60).toString().padStart(2, '0')
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [nextPrayer.time]);

  if (!isLoaded) return null

  return (
    <div className="pb-12 pt-10 px-4 md:px-8 space-y-8 animate-in fade-in duration-500 bg-background min-h-screen">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">Jadwal Shalat</h1>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{city}, {province}</span>
            </div>
          </div>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl">
          <Clock className="w-5 h-5 text-primary" />
        </div>
      </header>

      <Card className="glass-card border-none shadow-xl rounded-[2.2rem] overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Provinsi</label>
              <Select value={province} onValueChange={handleProvinceChange}>
                <SelectTrigger className="h-10 rounded-xl bg-secondary/50 border-none text-[11px] font-bold">
                  <SelectValue placeholder="Pilih Provinsi" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none glass-card max-h-[300px]">
                  {provinces.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Kota/Kab</label>
              <Select value={city} onValueChange={handleCityChange}>
                <SelectTrigger className="h-10 rounded-xl bg-secondary/50 border-none text-[11px] font-bold">
                  <SelectValue placeholder="Pilih Kota" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none glass-card max-h-[300px]">
                  {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border border-primary/20 shadow-2xl rounded-[2.5rem] md:rounded-[2.8rem] relative overflow-hidden">
        <CardContent className="p-8 sm:p-10 text-center space-y-6 flex flex-col items-center">
           <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Mendatang: {nextPrayer.name}</p>
              <h2 className="text-5xl sm:text-6xl font-black tracking-tighter tabular-nums text-foreground">{nextPrayer.time}</h2>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 py-4 border-y border-border/50 w-full justify-center">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-primary">{countdown.h}</p>
                <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">Jam</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-primary">{countdown.m}</p>
                <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">Menit</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-black tabular-nums tracking-tight text-primary">{countdown.s}</p>
                <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">Detik</p>
              </div>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <h3 className="font-black text-lg tracking-tight">Jadwal Lengkap</h3>
          <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl w-fit">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewedDay(d => d-1)} disabled={viewedDay <= 1}><ChevronLeft/></Button>
            <div className="text-center min-w-[80px]">
              <span className="text-[10px] font-black uppercase text-primary block">{currentViewedSchedule?.hari}</span>
              <span className="text-[11px] font-bold">{viewedDay} {monthlySchedules[0]?.tanggal_lengkap ? new Date(monthlySchedules[0].tanggal_lengkap).toLocaleDateString('id-ID', { month: 'short' }) : ''}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewedDay(d => d+1)} disabled={viewedDay >= monthlySchedules.length}><ChevronRight/></Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loadingSchedule ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-[2rem]" />) : 
            prayers.map((prayer) => (
              <div key={prayer.name} className={cn("flex items-center justify-between p-5 rounded-[2rem] border bg-card/40 border-border/50 transition-all", nextPrayer.name === prayer.name && "border-primary bg-primary/5 scale-[1.02]")}>
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center", nextPrayer.name === prayer.name ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                    <prayer.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h4 className="font-black text-xs sm:text-sm">{prayer.name}</h4>
                </div>
                <span className="text-xl sm:text-2xl font-black tabular-nums">{prayer.time}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
