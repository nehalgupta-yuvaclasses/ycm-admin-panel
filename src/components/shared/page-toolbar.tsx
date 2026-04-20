import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PageToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
  className,
}: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      {onSearchChange ? (
        <div className="relative w-full flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      ) : (
        <div />
      )}
      <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div>
    </div>
  );
}