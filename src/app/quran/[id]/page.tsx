
"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Volume2, ChevronRight, ChevronLeft, BookOpen, Info, MapPin, BookText, Type, Languages, FileText } from "lucide-react"
import { type SurahDetail, type TafsirDetail, API_BASE_URL } from "@/app/lib/quran-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SurahReader(props: PageProps) {
  const resolvedParams = React.use(props.params)
  const surahId = resolvedParams.id
  
  const router = useRouter()
  
  const [surah, setSurah] = useState<SurahDetail | null>(null)
  const [tafsir, setTafsir] = useState<TafsirDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingAyat, setPlayingAyat] = useState<number | null>(null)
  const [showLatin, setShowLatin] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const [readMode, setReadMode] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [surahRes, tafsirRes] = await Promise.all([
          fetch(`${API_BASE_URL}/surat/${surahId}`),
          fetch(`${API_BASE_URL}/tafsir/${surahId}`)
        ]);
        
        const surahJson = await surahRes.json();
        const tafsirJson = await tafsirRes.json();

        if (surahJson.code === 200) {
          setSurah(surahJson.data);
        }
        if (tafsirJson.code === 200) {
          setTafsir(tafsirJson.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data surah:", error)
        toast({
          variant: "destructive",
          title: "Gagal memuat surah",
          description: "Periksa koneksi internet Anda."
        })
      } finally {
        setLoading(false)
      }
    }
    if (surahId) {
      fetchData()
    }
  }, [surahId])

  const playAudio = (url: string, nomorAyat: number) => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    if (playingAyat === nomorAyat) {
      setPlayingAyat(null)
      return
    }
    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingAyat(nomorAyat)
    audio.play()
    audio.onended = () => setPlayingAyat(null)
  }

  const getTafsirText = (nomorAyat: number) => {
    if (!tafsir) return "Memuat tafsir...";
    const detail = tafsir.tafsir.find(t => t.ayat === nomorAyat);
    return detail ? detail.teks : "Tafsir tidak tersedia untuk ayat ini.";
  }

  if (!surah && !loading) return (
    <div className="p-10 text-center space-y-4">
      <p className="text-muted-foreground font-medium italic">Surah tidak ditemukan</p>
      <Button onClick={() => router.push('/quran')} variant="secondary">Kembali</Button>
    </div>
  )

  return (
    <div className="pb-12 min-h-screen bg-background animate-in fade-in duration-700">
      <div className="sticky top-0 z-40 px-5 pt-5 bg-background/80 backdrop-blur-xl pb-2">
        <Card className="border-none bg-primary text-primary-foreground rounded-[2.5rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <BookOpen className="w-24 h-24" />
          </div>
          <CardContent className="p-6 space-y-6 relative z-10">
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="icon" onClick={() => router.push('/quran')} className="rounded-2xl bg-white/10 hover:bg-white/20 text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setReadMode(!readMode)} 
                  className={cn("rounded-2xl transition-all", readMode ? "bg-white text-primary" : "bg-white/10 text-white hover:bg-white/20")}
                  title="Mode Baca"
                >
                  <BookText className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowLatin(!showLatin)} 
                  className={cn("rounded-2xl transition-all", !showLatin ? "opacity-40 bg-white/5" : "bg-white/10 text-white hover:bg-white/20")}
                  title="Toggle Latin"
                >
                  <Type className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowTranslation(!showTranslation)} 
                  className={cn("rounded-2xl transition-all", !showTranslation ? "opacity-40 bg-white/5" : "bg-white/10 text-white hover:bg-white/20")}
                  title="Toggle Terjemahan"
                >
                  <Languages className="w-5 h-5" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-2xl bg-white/10 hover:bg-white/20 text-white">
                      <Info className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] rounded-[2.5rem] border-none glass-card p-8">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black">{surah?.namaLatin}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] mt-4 pr-4">
                      <div className="text-sm leading-relaxed text-muted-foreground font-serif italic" dangerouslySetInnerHTML={{ __html: surah?.deskripsi || '' }} />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {loading ? (
              <div className="text-center space-y-3">
                <Skeleton className="h-8 w-40 mx-auto bg-white/20 rounded-full" />
                <Skeleton className="h-4 w-60 mx-auto bg-white/20 rounded-full" />
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <h1 className="text-3xl font-black tracking-tighter">{surah?.namaLatin}</h1>
                  <span className="text-2xl font-arabic opacity-80">{surah?.nama}</span>
                </div>
                <p className="text-sm opacity-80 font-serif italic">"{surah?.arti}"</p>
                <div className="flex justify-center gap-3 text-[10px] font-black uppercase tracking-widest bg-black/10 py-2.5 px-6 rounded-full w-fit mx-auto mt-4">
                  <span>{surah?.jumlahAyat} Ayat</span>
                  <span className="opacity-30">•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {surah?.tempatTurun}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-5 py-8 space-y-6">
        {surah?.ayat.map((v) => (
          <Card key={v.nomorAyat} className="border-none bg-card/40 rounded-[2.5rem] overflow-hidden shadow-sm">
            <CardContent className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-primary/10">
                    <path d="M50 0 L60 15 L85 15 L85 40 L100 50 L85 60 L85 85 L60 85 L50 100 L40 85 L15 85 L15 60 L0 50 L15 40 L15 15 L40 15 Z" fill="currentColor" />
                  </svg>
                  <span className="relative z-10 font-black text-xs text-primary">{v.nomorAyat}</span>
                </div>
                {!readMode && (
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("h-11 w-11 rounded-2xl transition-all", playingAyat === v.nomorAyat ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-secondary/50 hover:bg-secondary")} 
                      onClick={() => playAudio(v.audio['05'], v.nomorAyat)}
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl bg-secondary/50 hover:bg-secondary">
                          <FileText className="h-5 w-5 text-primary" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[90vw] rounded-[2.5rem] border-none glass-card p-8">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Tafsir Kemenag
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[400px] mt-6 pr-4">
                          <div className="space-y-6">
                            <div className="bg-primary/5 p-6 rounded-3xl space-y-4">
                              <p className="text-2xl font-arabic text-right leading-relaxed" dir="rtl">{v.teksArab}</p>
                              <p className="text-sm text-muted-foreground italic font-serif leading-relaxed">"{v.teksIndonesia}"</p>
                            </div>
                            <div className="text-sm leading-relaxed text-foreground/80 font-medium whitespace-pre-line">
                              {getTafsirText(v.nomorAyat)}
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <p className="text-4xl font-arabic text-right leading-[2.2] font-bold text-foreground drop-shadow-sm" dir="rtl">
                  {v.teksArab}
                </p>

                {!readMode && (
                  <div className="space-y-6 pt-4">
                    {showLatin && (
                      <p className="text-[11px] text-primary font-black uppercase tracking-[0.15em] leading-relaxed bg-primary/5 p-4 rounded-2xl">
                        {v.teksLatin}
                      </p>
                    )}
                    {showTranslation && (
                      <p className="text-base text-muted-foreground font-serif italic leading-relaxed border-l-4 border-primary/20 pl-6 py-1">
                        "{v.teksIndonesia}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && (surah?.suratSelanjutnya || surah?.suratSebelumnya) && (
        <div className="px-5 pb-10 flex gap-3">
          {surah?.suratSebelumnya && (
            <Button 
              asChild 
              variant="outline" 
              className="flex-1 h-16 rounded-[2rem] border-primary/20 hover:bg-primary/5 group"
            >
              <Link href={`/quran/${surah.suratSebelumnya.nomor}`}>
                <div className="flex items-center justify-between w-full px-4">
                  <ChevronLeft className="w-5 h-5 text-primary transition-transform group-hover:-translate-x-1" />
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block">Sebelumnya</span>
                    <span className="font-black text-xs">{surah.suratSebelumnya.namaLatin}</span>
                  </div>
                </div>
              </Link>
            </Button>
          )}
          
          {surah?.suratSelanjutnya && (
            <Button 
              asChild 
              variant="outline" 
              className="flex-1 h-16 rounded-[2rem] border-primary/20 hover:bg-primary/5 group"
            >
              <Link href={`/quran/${surah.suratSelanjutnya.nomor}`}>
                <div className="flex items-center justify-between w-full px-4">
                  <div className="text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40 block">Selanjutnya</span>
                    <span className="font-black text-xs">{surah.suratSelanjutnya.namaLatin}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
