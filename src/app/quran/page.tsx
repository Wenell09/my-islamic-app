
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { type Surah, API_BASE_URL } from "@/app/lib/quran-data"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function QuranList() {
  const router = useRouter()
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [search, setSearch] = useState("")
  const [activeRevelation, setActiveRevelation] = useState("Semua")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSurahs() {
      try {
        const response = await fetch(`${API_BASE_URL}/surat`)
        const result = await response.json()
        if (result.code === 200) {
          setSurahs(result.data)
        }
      } catch (error) {
        console.error("Gagal mengambil daftar surah:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSurahs()
  }, [])

  const filteredSurahs = surahs.filter(s => {
    const matchesSearch = s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
                          s.arti.toLowerCase().includes(search.toLowerCase());
    const matchesRevelation = activeRevelation === "Semua" || s.tempatTurun === activeRevelation;
    return matchesSearch && matchesRevelation;
  })

  return (
    <div className="pb-12 pt-10 px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground">Al-Quran</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Kalamullah Azza Wa Jalla</p>
          </div>
        </div>
        <div className="bg-primary/10 p-3 rounded-2xl shadow-inner border border-primary/20">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
      </header>

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          <Input 
            className="h-14 pl-12 pr-6 rounded-2xl bg-secondary/30 border-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-sm text-sm transition-all" 
            placeholder="Cari berdasarkan nama atau arti surah..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
          {["Semua", "Mekah", "Madinah"].map((type) => (
            <Button
              key={type}
              variant={activeRevelation === type ? "default" : "secondary"}
              size="sm"
              className={cn(
                "rounded-full px-6 h-10 text-[10px] font-black uppercase tracking-widest transition-all",
                activeRevelation === type ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
              )}
              onClick={() => setActiveRevelation(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-card rounded-[1.8rem] border border-border/50">
              <div className="flex items-center gap-5">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-12 h-8" />
            </div>
          ))
        ) : filteredSurahs.length > 0 ? (
          filteredSurahs.map((surah) => (
            <Link 
              key={surah.nomor} 
              href={`/quran/${surah.nomor}`}
              className="flex items-center justify-between p-5 bg-card rounded-[1.8rem] border border-border/50 shadow-sm hover:border-primary/50 hover:bg-secondary/10 transition-all duration-500 group relative overflow-hidden active:scale-[0.99]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <svg 
                    viewBox="0 0 100 100" 
                    className="absolute inset-0 w-full h-full text-primary/10 group-hover:text-primary transition-colors duration-500 drop-shadow-sm"
                  >
                    <path 
                      d="M50 0 L60 15 L85 15 L85 40 L100 50 L85 60 L85 85 L60 85 L50 100 L40 85 L15 85 L15 60 L0 50 L15 40 L15 15 L40 15 Z" 
                      fill="currentColor" 
                    />
                  </svg>
                  <span className="relative z-10 font-black text-xs text-primary group-hover:text-primary-foreground transition-colors duration-500">
                    {surah.nomor}
                  </span>
                </div>
                
                <div className="space-y-0.5">
                  <h3 className="font-black text-base tracking-tight text-foreground group-hover:text-primary transition-colors">{surah.namaLatin}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium italic -mt-1 group-hover:text-primary/70 transition-colors">{surah.arti}</p>
                </div>
              </div>

              <div className="text-right flex items-center gap-4 relative z-10">
                <span className="font-arabic text-2xl font-black text-foreground/80 group-hover:text-primary transition-all duration-500">
                  {surah.nama}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-all duration-500" />
              </div>
            </Link>
          ))
        ) : null}
      </div>
    </div>
  )
}
