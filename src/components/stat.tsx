// src/components/stat.tsx
import { cn } from "@/lib/utils"

interface StatProps {
  title: string
  value: string
  change: string
  className?: string
}

export function Stat({ title, value, change, className }: StatProps) {
  const isPositive = change.startsWith('+')
  
  return (
    <div className={cn("rounded-xl border border-zinc-200 p-6", className)}>
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900">{value}</span>
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-emerald-600" : "text-red-600"
        )}>
          {change}
        </span>
      </p>
    </div>
  )
}