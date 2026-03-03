
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Search, ArrowLeft, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { type Dua, API_DOA_URL } from "@/app/lib/duas-data"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DuasPage() {
  const router = useRouter()
  const [allDuas, setAllDuas] = useState<Dua[]>([])
  const [categories, setCategories] = useState<string[]>(["Semua"])
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [search, setSearch] = useState("")
  const [favorites, setFavorites] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDuas() {
      try {
        const response = await fetch(API_DOA_URL)
        const result = await response.json()
        if (result.status === "success") {
          setAllDuas(result.data)
          const uniqueGroups = Array.from(new Set(result.data.map((d: Dua) => d.grup))) as string[]
          setCategories(["Semua", ...uniqueGroups])
        }
      } catch (error) {
        console.error("Gagal mengambil data doa:", error)
        toast({ variant: "destructive", title: "Gagal memuat doa" })
      } finally {
        setLoading(false)
      }
    }

    const savedFavorites = localStorage.getItem('myislamic_fav_duas')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
    fetchDuas()
  }, [])

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const isFav = favorites.includes(id);
    let newFavorites;
    if (isFav) {
      newFavorites = favorites.filter(f => f !== id);
      toast({ title: "Dihapus dari Favorit" });
    } else {
      newFavorites = [...favorites, id];
      toast({ title: "Ditambahkan ke Favorit" });
    }
    setFavorites(newFavorites);
    localStorage.setItem('myislamic_fav_duas', JSON.stringify(newFavorites));
  }

  const filteredDuas = useMemo(() => {
    return allDuas.filter(d => {
      const matchesCategory = activeCategory === "Semua" || d.grup === activeCategory
      const matchesSearch = d.nama.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [allDuas, activeCategory, search])

  return (
    <div className="pb-12 pt-10 px-4 md:px-8 space-y-8 animate-in fade-in duration-500 min-h-screen bg-background text-foreground">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight">Doa Harian</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Pintu Langit Terbuka</p>
          </div>
        </div>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          className="h-14 pl-12 pr-6 rounded-2xl bg-secondary/30 border-none focus-visible:ring-primary shadow-sm text-sm" 
          placeholder="Cari doa tertentu..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1 text-muted-foreground">
          <Filter className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">Kategori Doa</span>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-1 px-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "secondary"}
              size="sm"
              className={cn(
                "rounded-full whitespace-nowrap px-6 h-10 text-[10px] font-black uppercase tracking-widest border-none transition-all",
                activeCategory === cat ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary/60 text-muted-foreground hover:bg-secondary/80"
              )}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-[2rem] p-6 border border-border/50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          ))
        ) : filteredDuas.length > 0 ? (
          filteredDuas.map((dua) => (
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
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none px-2 h-5 text-[8px] font-black tracking-tighter uppercase">
                      {dua.grup}
                    </Badge>
                  </div>
                </div>
              </Link>
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-10 w-10 rounded-xl", favorites.includes(dua.id) ? "text-rose-500 bg-rose-50" : "text-muted-foreground bg-secondary/50")}
                  onClick={(e) => toggleFavorite(dua.id, e)}
                >
                  <Heart className={cn("h-5 w-5", favorites.includes(dua.id) && "fill-current")} />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center opacity-40 col-span-full">
            <p className="text-sm font-black uppercase tracking-widest">Doa tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}
