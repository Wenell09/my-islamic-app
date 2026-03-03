
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Heart, Share2, Info, BookOpen } from "lucide-react"
import { type Dua, API_DOA_URL } from "@/app/lib/duas-data"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DuaDetailPage(props: PageProps) {
  const resolvedParams = React.use(props.params)
  const duaId = resolvedParams.id
  const router = useRouter()

  const [dua, setDua] = useState<Dua | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    async function fetchDuaDetail() {
      try {
        const response = await fetch(`${API_DOA_URL}/${duaId}`)
        const result = await response.json()
        if (result.status === "success") {
          setDua(result.data)
          
          const savedFavorites = JSON.parse(localStorage.getItem('myislamic_fav_duas') || '[]')
          setIsFavorite(savedFavorites.includes(parseInt(duaId)))
        }
      } catch (error) {
        console.error("Gagal mengambil detail doa:", error)
        toast({ variant: "destructive", title: "Gagal memuat detail doa" })
      } finally {
        setLoading(false)
      }
    }

    if (duaId) fetchDuaDetail()
  }, [duaId])

  const toggleFavorite = () => {
    if (!dua) return
    const savedFavorites = JSON.parse(localStorage.getItem('myislamic_fav_duas') || '[]')
    let newFavorites
    if (isFavorite) {
      newFavorites = savedFavorites.filter((id: number) => id !== dua.id)
      setIsFavorite(false)
      toast({ title: "Dihapus dari favorit" })
    } else {
      newFavorites = [...savedFavorites, dua.id]
      setIsFavorite(true)
      toast({ title: "Ditambahkan ke favorit" })
    }
    localStorage.setItem('myislamic_fav_duas', JSON.stringify(newFavorites))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Teks doa disalin ke clipboard" })
  }

  const handleShare = async () => {
    if (!dua) return
    const text = `${dua.nama}\n\n${dua.ar}\n\nArtinya: ${dua.idn}\n\nDibagikan dari MyIslamic`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: dua.nama, text })
      } catch (error) {
        // Fallback jika browser menolak akses share
        copyToClipboard(text)
      }
    } else {
      copyToClipboard(text)
    }
  }

  if (loading) {
    return (
      <div className="pb-12 pt-10 px-5 space-y-8 min-h-screen bg-background animate-pulse">
        <header className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <Skeleton className="h-8 w-40" />
        </header>
        <Skeleton className="h-64 w-full rounded-[2.5rem]" />
        <Skeleton className="h-32 w-full rounded-[2rem]" />
      </div>
    )
  }

  if (!dua) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center space-y-4">
        <p className="text-muted-foreground font-medium italic">Doa tidak ditemukan</p>
        <Button onClick={() => router.back()} variant="secondary">Kembali</Button>
      </div>
    )
  }

  return (
    <div className="pb-12 pt-10 px-5 space-y-8 animate-in fade-in duration-500 min-h-screen bg-background">
      <header className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-4 flex-1">
          <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary shrink-0" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight leading-tight">{dua.nama}</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{dua.grup}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="icon" className="rounded-xl border-none bg-secondary/50" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-10 w-10 rounded-xl", isFavorite ? "text-rose-500 bg-rose-50" : "text-muted-foreground bg-secondary/50")}
            onClick={toggleFavorite}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        </div>
      </header>

      <Card className="border-none bg-card rounded-[2.8rem] shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BookOpen className="w-32 h-32" />
        </div>
        <CardContent className="p-8 space-y-10 relative z-10">
          <div className="space-y-8">
            <p className="text-4xl font-arabic text-right leading-[2] font-bold text-foreground drop-shadow-sm" dir="rtl">
              {dua.ar}
            </p>
            
            <div className="space-y-4 pt-4 border-t border-border/50">
              <p className="text-[11px] text-primary font-black uppercase tracking-[0.15em] leading-relaxed bg-primary/5 p-4 rounded-2xl">
                {dua.tr}
              </p>
              <p className="text-base text-muted-foreground font-serif italic leading-relaxed border-l-4 border-primary/20 pl-6 py-1">
                "{dua.idn}"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1 text-muted-foreground">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-widest">Tentang Doa & Sumber</h3>
        </div>
        <Card className="border-none bg-secondary/30 rounded-[2.2rem] shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm leading-relaxed text-foreground/80 font-serif italic whitespace-pre-line">
              {dua.tentang}
            </p>
          </CardContent>
        </Card>
      </div>

      {dua.tag && dua.tag.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dua.tag.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-tighter">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
