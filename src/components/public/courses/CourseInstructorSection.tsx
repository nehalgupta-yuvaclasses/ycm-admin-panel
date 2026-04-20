import { GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface PublicCourseInstructorData {
  instructorName?: string;
  instructorImage?: string;
  instructorBio?: string;
  instructorExperienceYears?: number;
}

interface CourseInstructorSectionProps {
  instructor: PublicCourseInstructorData;
  className?: string;
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

export function CourseInstructorSection({ instructor, className }: CourseInstructorSectionProps) {
  return (
    <Card className={cn('rounded-xl border-border/60', className)}>
      <CardHeader className="border-b border-border/60">
        <CardTitle className="text-lg">Instructor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border border-border/60" size="lg">
            <AvatarImage src={instructor.instructorImage || undefined} alt={instructor.instructorName || 'Instructor'} />
            <AvatarFallback>{formatInitials(instructor.instructorName)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              {instructor.instructorName || 'Instructor'}
            </div>
            <div className="text-sm text-muted-foreground">
              {typeof instructor.instructorExperienceYears === 'number'
                ? `${instructor.instructorExperienceYears} years experience`
                : 'Instructor profile linked'}
            </div>
          </div>
        </div>

        {instructor.instructorBio && (
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{instructor.instructorBio}</p>
        )}
      </CardContent>
    </Card>
  );
}
