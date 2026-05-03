import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      className={twMerge("flex h-8 w-full rounded border border-military-border bg-military-dark px-3 py-1 text-xs font-mono ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-mono placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-military-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
