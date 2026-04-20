import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2.5 text-sm leading-relaxed transition-all duration-200 outline-none",
        "placeholder:text-muted-foreground/50",
        "hover:border-border hover:bg-muted/40",
        "focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-primary/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:ring-3 aria-invalid:ring-destructive/10",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
