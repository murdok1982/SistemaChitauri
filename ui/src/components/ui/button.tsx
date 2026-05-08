import * as React from 'react'
import { clsx } from 'clsx'

type Variant = 'default' | 'outline' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  default:
    'bg-military-green/20 text-military-green border border-military-green/30 hover:bg-military-green/30',
  outline:
    'bg-transparent text-gray-200 border border-military-border hover:bg-military-border',
  ghost: 'bg-transparent text-gray-300 hover:bg-military-border',
  destructive:
    'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2 text-[10px]',
  md: 'h-8 px-3 text-xs',
  lg: 'h-10 px-4 text-sm',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-military-green/40',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button }
