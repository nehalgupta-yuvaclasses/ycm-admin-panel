import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  icon,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/50 text-foreground">
              {icon}
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
