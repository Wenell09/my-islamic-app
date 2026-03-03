
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ArrowLeft, FileText } from "lucide-react"
import { type Dua, API_DOA_URL } from "@/app/lib/duas-data"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<number[]>([])
  const [allDuas, setAllDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(API_DOA_URL)
        const result = await response.json()
        if (result.status === "success") {
          setAllDuas(result.data)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    const savedFavorites = localStorage.getItem('myislamic_fav_duas')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    fetchData()
  }, [])

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFavorites = favorites.filter(f => f !== id)
    setFavorites(newFavorites)
    localStorage.setItem('myislamic_fav_duas', JSON.stringify(newFavorites))
    toast({ title: "Dihapus dari Favorit" })
  }

  const favoriteDuas = allDuas.filter(d => favorites.includes(d.id))

  return (
    <div className="pb-12 pt-10 px-5 space-y-8 animate-in fade-in duration-500 min-h-screen bg-background text-foreground">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary" onClick={() => router.push('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black tracking-tight">Doa Favorit</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Koleksi Spiritual Anda</p>
        </div>
      </header>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-[2rem]" />
          ))
        ) : favoriteDuas.length > 0 ? (
          favoriteDuas.map((dua) => (
            <div key={dua.id} className="relative group">
              <Link 
                href={`/duas/${dua.id}`}
                className="block bg-card rounded-[2rem] p-6 border border-border/50 shadow-sm hover:shadow-md transition-all relative overflow-hidden active:scale-[0.99]"
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="absolute inset-0 w-full h-full text-primary/10 group-hover:text-primary transition-colors duration-300"
                    >
                      <path 
                        d="M50 0 L60 15 L85 15 L85 40 L100 50 L85 60 L85 85 L60 85 L50 100 L40 85 L15 85 L15 60 L0 50 L15 40 L15 15 L40 15 Z" 
                        fill="currentColor" 
                      />
                    </svg>
                    <span className="relative z-10 font-black text-[10px] text-primary group-hover:text-white transition-colors">
                      {dua.id}
                    </span>
                  </div>
                  <div className="space-y-1 pr-12">
                    <h3 className="font-black text-lg tracking-tight text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">{dua.nama}</h3>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none px-2 h-5 text-[8px] font-black uppercase tracking-tighter">
                      {dua.grup}
                    </Badge>
                  </div>
                </div>
              </Link>
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl text-rose-500 bg-rose-50"
                  onClick={(e) => toggleFavorite(dua.id, e)}
                >
                  <Heart className="h-5 w-5 fill-current" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-40">
            <FileText className="w-16 h-16" />
            <p className="text-sm font-black uppercase tracking-widest">Belum ada doa favorit</p>
            <Button onClick={() => router.push('/duas')} variant="link" className="text-primary font-black uppercase text-[10px] tracking-widest">
                Cari Doa Sekarang
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
