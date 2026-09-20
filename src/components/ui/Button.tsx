import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'red' | 'ghost' | 'outline' | 'green'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'red', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.045, y: -2 }}
        whileTap={disabled ? undefined : { scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-gradient-to-br from-[#ff5566] to-[#e11d2e] text-white shadow-[0_4px_20px_rgba(225,29,46,0.35)] hover:shadow-[0_10px_40px_rgba(225,29,46,0.55)]': variant === 'red',
            'bg-white/5 text-white/80 border border-white/12 backdrop-blur hover:bg-white/10 hover:text-white hover:border-white/25': variant === 'ghost',
            'bg-transparent text-white border border-red/50 hover:bg-red/10 hover:border-red': variant === 'outline',
            'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-[0_4px_20px_rgba(34,197,94,0.35)] hover:shadow-[0_10px_40px_rgba(34,197,94,0.5)]': variant === 'green',
          },
          {
            'px-4 py-2 text-xs': size === 'sm',
            'px-6 py-3 text-sm': size === 'md',
            'px-8 py-4 text-base': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
