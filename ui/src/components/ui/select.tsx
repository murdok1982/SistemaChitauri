import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={twMerge("flex h-8 w-full items-center justify-between rounded border border-military-border bg-military-dark px-3 py-1 text-xs font-mono ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-military-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = "Select"

export { Select }
