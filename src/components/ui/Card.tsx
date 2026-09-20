import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]',
      className,
    )}>
      {children}
    </div>
  )
}
