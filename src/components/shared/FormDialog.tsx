import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormDialogProps {
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  onCancel?: () => void
  submitText?: string
  cancelText?: string
  loading?: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  size?: "lg" | "xl"
}

export function FormDialog({
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = "Save changes",
  cancelText = "Cancel",
  loading = false,
  isOpen,
  onOpenChange,
  size = "lg",
}: FormDialogProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "p-0 overflow-hidden flex flex-col gap-0 rounded-2xl border-border/50 bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/20",
          size === "lg" ? "sm:max-w-[520px]" : "sm:max-w-[640px]"
        )}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 space-y-1.5">
          <DialogTitle className="text-lg font-bold tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-[13px] text-muted-foreground/80 leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </div>

        {/* Separator */}
        <div className="h-px bg-border/60 mx-6" />

        {/* Scrollable Body */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 flex-1">
          <form id="form-dialog-form" onSubmit={onSubmit}>
            {children}
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 bg-muted/30 px-6 py-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={loading}
            className="h-10 px-5 rounded-xl font-medium text-muted-foreground hover:text-foreground"
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            form="form-dialog-form"
            disabled={loading}
            className="h-10 px-6 rounded-xl font-semibold min-w-[120px] shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
