import { cn } from '@/lib/utils'
import { type SelectHTMLAttributes, forwardRef } from 'react'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg bg-white/5 border border-white/12 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-red/50 disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'
