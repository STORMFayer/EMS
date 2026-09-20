import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-red/50 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
