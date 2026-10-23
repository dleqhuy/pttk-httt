import { Link } from "@tanstack/react-router"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "full" | "icon" | "responsive"
  className?: string
  asLink?: boolean
}
export function Logo({
  variant = "full",
  className,
  asLink = true,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Layers className="size-5" />
      </span>
      {variant !== "icon" && (
        <span
          className={
            variant === "responsive"
              ? "group-data-[collapsible=icon]:hidden"
              : ""
          }
        >
          <strong className="block text-xl tracking-tight">
            PMS<span className="text-primary">.</span>
          </strong>
          <span className="block text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Performance workspace
          </span>
        </span>
      )}
    </span>
  )
  return asLink ? <Link to="/">{content}</Link> : content
}
