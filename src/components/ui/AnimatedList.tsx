import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}

const item = {
  hidden: { opacity: 0, x: -26 },
  show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 340, damping: 26 } },
  exit: { opacity: 0, x: 26, scale: 0.96, transition: { duration: 0.18 } },
}

export function AnimatedList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial="hidden" animate="show" variants={container}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </motion.div>
  )
}

export function AnimatedListItem({
  children,
  className,
  layoutId,
}: {
  children: ReactNode
  className?: string
  layoutId?: string
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      variants={item}
      exit="exit"
      whileHover={{ x: 4, boxShadow: '0 0 16px rgba(225,29,46,.28)', borderColor: 'rgba(225,29,46,.5)' }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
