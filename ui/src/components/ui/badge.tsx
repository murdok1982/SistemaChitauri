import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function Badge({ className, variant = "default", ...props }: {
  className?: string
  variant?: "default" | "secondary" | "destructive" | "outline"
} & React.HTMLAttributes<HTMLDivElement>) {
  const variants = {
    default: "border-transparent bg-military-green/20 text-military-green hover:bg-military-green/30",
    secondary: "border-transparent bg-military-panel text-gray-300 hover:bg-military-border",
    destructive: "border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30",
    outline: "text-military-green border-military-green/30",
  }
  return (
    <div className={twMerge("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-mono transition-colors", variants[variant], className)} {...props} />
  )
}

export { Badge }
