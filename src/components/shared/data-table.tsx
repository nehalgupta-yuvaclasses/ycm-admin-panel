import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface DataTableProps<TData> {
  columns: {
    header: string | React.ReactNode
    accessorKey?: keyof TData | string
    cell?: (item: TData) => React.ReactNode
    className?: string
  }[]
  data: TData[]
  isLoading?: boolean
  emptyState?: React.ReactNode
  onRowClick?: (item: TData) => void
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  emptyState,
  onRowClick,
  className,
}: DataTableProps<TData>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={cn("h-11 px-4 text-sm font-medium text-muted-foreground", column.className)}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="px-4 py-4">
                      <Skeleton className="h-5 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-auto p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow 
                  key={i} 
                  className={cn(
                    "h-14 transition-colors hover:bg-muted/30",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, j) => (
                    <TableCell key={j} className={cn("px-4 py-4 align-middle text-sm", column.className)}>
                      {column.cell 
                        ? column.cell(item) 
                        : column.accessorKey 
                          ? (item[column.accessorKey as keyof TData] as React.ReactNode)
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
