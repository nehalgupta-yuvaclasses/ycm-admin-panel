import { BookOpen, Clock3, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PublicCourseCardData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailUrl?: string;
  instructorName?: string;
  instructorImage?: string;
  sellingPrice?: number;
  studentsCount?: number;
  durationText?: string;
  category?: string;
}

interface CourseCardProps {
  course: PublicCourseCardData;
  className?: string;
  onClick?: () => void;
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return 'Free';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function formatInitials(name?: string) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'IN'
  );
}

export function CourseCard({ course, className, onClick }: CourseCardProps) {
  return (
    <Card
      className={cn('overflow-hidden rounded-xl border-border/60 bg-card transition-colors hover:bg-muted/20', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      <div className="aspect-[16/9] overflow-hidden border-b border-border/60 bg-muted/20">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <BookOpen className="h-7 w-7" />
          </div>
        )}
      </div>
      <CardContent className="space-y-4 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-base font-semibold text-foreground">{course.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">{course.subtitle || course.description}</p>
            </div>
            {course.category && <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-xs">{course.category}</Badge>}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-border/60" size="sm">
              <AvatarImage src={course.instructorImage || undefined} alt={course.instructorName || 'Instructor'} />
              <AvatarFallback>{formatInitials(course.instructorName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-foreground">{course.instructorName || 'Instructor'}</div>
              <div className="truncate text-xs text-muted-foreground">Instructor</div>
            </div>
          </div>
          <div className="text-right text-sm font-medium text-foreground">{formatCurrency(course.sellingPrice)}</div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {typeof course.studentsCount === 'number' && <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {course.studentsCount} students</span>}
          {course.durationText && <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {course.durationText}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
