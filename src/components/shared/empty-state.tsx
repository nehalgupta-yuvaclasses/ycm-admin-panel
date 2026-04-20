import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-12 text-center",
      className
    )}>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted/60">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="mt-6 gap-2">
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}
