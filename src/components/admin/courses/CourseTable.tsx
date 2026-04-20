import { BookOpen, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { CourseSummary } from "./types";

type CourseTableProps = {
  courses: CourseSummary[];
  isLoading: boolean;
  onOpenCourse: (courseId: string) => void;
  onEditCourse: (courseId: string) => void;
  onDeleteCourse: (courseId: string) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

function formatInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'IN';
}

export function CourseTable({ courses, isLoading, onOpenCourse, onEditCourse, onDeleteCourse }: CourseTableProps) {
  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-xl border border-border/60 bg-card md:block">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[320px]">Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="h-16 animate-pulse">
                  <TableCell colSpan={7} className="px-4 py-6">
                    <div className="h-5 rounded bg-muted/40" />
                  </TableCell>
                </TableRow>
              ))
            ) : courses.length ? (
              courses.map((course) => (
                <TableRow
                  key={course.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30"
                  onClick={() => onOpenCourse(course.id)}
                >
                  <TableCell className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <BookOpen className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{course.title}</div>
                        <div className="line-clamp-1 text-sm text-muted-foreground">{course.subtitle || course.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-border/60" size="sm">
                        <AvatarImage src={course.instructorImage || undefined} alt={course.instructorName} />
                        <AvatarFallback>{formatInitials(course.instructorName)}</AvatarFallback>
                      </Avatar>
                      <span>{course.instructorName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-medium">{formatCurrency(course.sellingPrice)}</div>
                      {course.originalPrice > course.sellingPrice && (
                        <div className="text-xs text-muted-foreground line-through">{formatCurrency(course.originalPrice)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.studentsCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-md border-border/60 px-2 py-0.5 text-xs",
                        course.status === 'Published'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                      )}
                    >
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(course.lastUpdated)}</TableCell>
                  <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onOpenCourse(course.id)}>
                          <BookOpen className="mr-2 h-4 w-4" /> Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditCourse(course.id)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleteCourse(course.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No courses match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {courses.map((course) => (
          <button
            key={course.id}
            type="button"
            onClick={() => onOpenCourse(course.id)}
            className="rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start gap-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="truncate font-medium">{course.title}</div>
                <div className="line-clamp-1 text-sm text-muted-foreground">{course.subtitle || course.description}</div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                  <span>{course.instructorName}</span>
                  <span>•</span>
                  <span>{formatCurrency(course.sellingPrice)}</span>
                  <span>•</span>
                  <span>{course.studentsCount} students</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}