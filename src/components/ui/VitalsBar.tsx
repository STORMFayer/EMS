import { useMemo } from 'react'
import { cn } from '@/lib/utils'

const BASE_Y = 30
const BEAT_WIDTH = 125
const BEATS = 8 // 4 per 500-wide half, doubled so translateX(-50%) loops seamlessly

function buildEcgPath() {
  let d = `M0,${BASE_Y} `
  for (let i = 0; i < BEATS; i++) {
    const x = i * BEAT_WIDTH
    d +=
      `L${x + 14},${BASE_Y - 3} L${x + 24},${BASE_Y} L${x + 34},${BASE_Y + 2} ` +
      `L${x + 40},${BASE_Y - 22} L${x + 46},${BASE_Y + 24} L${x + 52},${BASE_Y} ` +
      `L${x + 70},${BASE_Y - 7} L${x + 86},${BASE_Y} H${x + BEAT_WIDTH} `
  }
  return d
}

export function VitalsBar({ className }: { className?: string }) {
  const path = useMemo(buildEcgPath, [])

  return (
    <div className={cn('relative h-14 rounded-2xl overflow-hidden bg-[#0a0f0d] border border-[var(--ink)]/10', className)}>
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(#3ddc84 1px, transparent 1px), linear-gradient(90deg, #3ddc84 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <svg className="absolute inset-0 w-[200%] h-full animate-ecg-scroll" viewBox="0 0 1000 60" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#3ddc84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_4px_rgba(61,220,132,0.65)]" />
      </svg>

      <div className="relative z-10 h-full flex items-center justify-between px-4">
        <span className="flex items-center gap-2 rounded-full bg-[#0a0f0d] pr-2">
          <span className="w-2 h-2 rounded-full bg-[#3ddc84] animate-status-pulse" />
          <span className="text-[#3ddc84] text-[11px] font-mono tracking-widest">SURVEILLANCE ACTIVE</span>
        </span>
        <span className="rounded-full bg-[#0a0f0d] pl-2 text-[#3ddc84] text-xs font-mono tabular-nums">72 BPM</span>
      </div>
    </div>
  )
}
