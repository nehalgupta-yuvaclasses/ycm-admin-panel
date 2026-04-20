import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function DashboardCard({
  title,
  description,
  children,
  className,
  icon: Icon,
  iconColor = "text-primary",
  action,
  noPadding = false,
}: DashboardCardProps) {
  return (
    <Card
      className={cn("border-border/50 shadow-sm overflow-hidden", className)}
    >
      <CardHeader
        className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-2",
          !noPadding && "p-6",
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl",
                iconColor,
                "bg-opacity-10",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs text-muted-foreground/70">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className={cn(noPadding ? "" : "px-6 pb-6")}>
        {children}
      </CardContent>
    </Card>
  );
}
