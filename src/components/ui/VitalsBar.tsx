import { cn } from '@/lib/utils'

// One heartbeat unit spans x=0..500 (baseline y=30); the same shape is
// repeated at x=500..1000 so translating the <svg> by -50% loops seamlessly.
const ECG_PATH =
  'M0,30 H80 L95,12 L110,46 L120,30 H230 L245,8 L262,52 L273,30 H500 ' +
  'H580 L595,12 L610,46 L620,30 H730 L745,8 L762,52 L773,30 H1000'

export function VitalsBar({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-16 rounded-2xl overflow-hidden bg-[#0b1015] border border-[var(--ink)]/10', className)}>
      <svg
        className="absolute inset-0 w-[200%] h-full animate-ecg-scroll opacity-90"
        viewBox="0 0 1000 60"
        preserveAspectRatio="none"
      >
        <path d={ECG_PATH} fill="none" stroke="#3ddc84" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="relative z-10 h-full flex items-center gap-2 px-4">
        <span className="w-2 h-2 rounded-full bg-[#3ddc84] animate-status-pulse" />
        <span className="text-[#3ddc84] text-xs font-mono tracking-wider">SURVEILLANCE ACTIVE</span>
      </div>
    </div>
  )
}
