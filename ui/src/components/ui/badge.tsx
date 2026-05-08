import * as React from 'react'
import { clsx } from 'clsx'

type Variant = 'default' | 'secondary' | 'destructive' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  default: 'border-transparent bg-military-green/20 text-military-green hover:bg-military-green/30',
  secondary: 'border-transparent bg-military-panel text-gray-300 hover:bg-military-border',
  destructive: 'border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30',
  outline: 'text-military-green border-military-green/30',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
