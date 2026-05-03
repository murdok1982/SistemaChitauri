import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge("relative h-2 w-full overflow-hidden rounded-full bg-military-border", className)}
      {...props}
    >
      <div
        className={twMerge("h-full flex-1 bg-military-green transition-all", indicatorClassName)}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }
