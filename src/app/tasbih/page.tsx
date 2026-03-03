
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function TasbihPage() {
  const [count, setCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [target, setTarget] = useState(33)
  const router = useRouter()

  const increment = () => {
    setCount(prev => (prev + 1) % (target + 1))
    setTotalCount(prev => prev + 1)
    
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  const reset = () => {
    setCount(0)
    setTotalCount(0)
  }

  return (
    <div className="pb-12 pt-10 px-5 space-y-12 animate-in fade-in duration-500 flex flex-col min-h-screen">
      <header className="flex justify-between items-center">
        <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary" onClick={() => router.push('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">Tasbih Digital</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Teman Zikir Anda</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-2xl bg-secondary" onClick={reset}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Total Sesi</p>
          <div className="text-2xl font-black tabular-nums">{totalCount}</div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full group-active:scale-125 transition-transform" />
          <button 
            onClick={increment}
            className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary to-emerald-700 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all outline-none border-[12px] border-white/10"
          >
            <div className="text-7xl font-black text-white tabular-nums tracking-tighter">
              {count}
            </div>
            <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mt-2">
              DARI {target}
            </div>
          </button>
        </div>

        <div className="flex gap-4">
          {[33, 99, 100, 1000].map((val) => (
            <Button 
              key={val}
              variant={target === val ? "default" : "outline"}
              className={cn(
                "rounded-2xl px-6 h-12 font-black text-xs uppercase tracking-widest",
                target === val ? "bg-primary shadow-lg shadow-primary/20" : "bg-secondary/50 border-none"
              )}
              onClick={() => {
                setTarget(val)
                setCount(0)
              }}
            >
              {val}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-[2rem] flex items-center gap-4 border-primary/20">
        <div className="bg-primary/20 p-3 rounded-xl">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Mengingat Allah</p>
          <p className="text-sm font-bold font-serif italic text-foreground/80 leading-snug">
            "Ingatlah, hanya dengan mengingati Allah hati menjadi tenteram."
          </p>
        </div>
      </div>
    </div>
  )
}
