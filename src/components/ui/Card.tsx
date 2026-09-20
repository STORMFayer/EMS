import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { type CSSProperties, type ReactNode } from 'react'

const OFFSETS = {
  bottom: { y: 26, x: 0 },
  left: { y: 0, x: -32 },
  right: { y: 0, x: 32 },
}

export function Card({
  children,
  className,
  style,
  delay = 0,
  hoverable = false,
  from = 'bottom',
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delay?: number
  hoverable?: boolean
  from?: 'bottom' | 'left' | 'right'
}) {
  const offset = OFFSETS[from]
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      whileHover={hoverable ? { y: -4, boxShadow: '0 0 20px rgba(225,29,46,.32), 0 14px 34px rgba(0,0,0,.4)' } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay }}
      style={style}
      className={cn(
        'rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] transition-shadow duration-300',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}
