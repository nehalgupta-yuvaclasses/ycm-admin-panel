import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-border/60 bg-muted/30 px-3.5 py-2 text-sm text-foreground transition-all duration-200 outline-none",
        "placeholder:text-muted-foreground/60",
        "hover:border-border hover:bg-muted/40",
        "focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-primary/10",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive/60 aria-invalid:ring-3 aria-invalid:ring-destructive/10",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "[&:-webkit-autofill]:bg-background [&:-webkit-autofill]:text-foreground [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_var(--background)] [&:-webkit-autofill]:transition-[background-color,color,box-shadow] [&:-webkit-autofill]:duration-[9999s]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
