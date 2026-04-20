import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Batch } from "../types";

interface StudentFiltersProps {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  batchFilter: string;
  onBatchChange: (value: string) => void;
  batches: Batch[];
  onReset: () => void;
}

export function StudentFilters({
  statusFilter,
  onStatusChange,
  batchFilter,
  onBatchChange,
  batches,
  onReset,
}: StudentFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const activeFiltersCount = [
    statusFilter !== "all",
    batchFilter !== "all",
  ].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="h-11 gap-2 rounded-xl border-border/60 px-4 transition-colors hover:bg-muted/50">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        }
      />
      <SheetContent className="flex flex-col border-none p-0 shadow-2xl">
        <SheetHeader className="border-b border-border/50 bg-muted/30 p-6">
          <SheetTitle className="text-xl font-semibold tracking-tight">Advanced Filters</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Narrow down your student list by status and batch.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          <div className="space-y-3">
            <Label className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Status</Label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-muted/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
                <SelectItem value="pending">Pending Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Academic Batch</Label>
            <Select value={batchFilter} onValueChange={onBatchChange}>
              <SelectTrigger className="h-11 rounded-xl border-border/60 bg-muted/20">
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="gap-3 border-t border-border/50 bg-muted/30 p-6">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => {
              onReset();
              setIsOpen(false);
            }}
          >
            Reset
          </Button>
          <Button className="flex-1" onClick={() => setIsOpen(false)}>
            Apply
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
