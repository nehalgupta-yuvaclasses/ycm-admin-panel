import { useMemo } from "react";
import { BarChart3, BookOpen, Edit3, GraduationCap, Layers3, PlayCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { CourseAnalytics, CourseSummary, EnrollmentRecord, LessonRecord, SubjectRecord } from "./types";
import { SubjectCurriculumEditor } from "./SubjectCurriculumEditor";

type CourseDetailsProps = {
  course: CourseSummary;
  subjects: SubjectRecord[];
  enrollments: EnrollmentRecord[];
  analytics: CourseAnalytics;
  onEditCourse: () => void;
  onSaveCurriculum: (subjects: SubjectRecord[]) => Promise<void>;
  onStartLiveClass?: (lesson: LessonRecord) => Promise<void>;
  onEndLiveClass?: (lesson: LessonRecord) => Promise<void>;
  liveActionLessonId?: string | null;
  isSavingCurriculum: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function CourseDetails({
  course,
  subjects,
  enrollments,
  analytics,
  onEditCourse,
  onSaveCurriculum,
  onStartLiveClass,
  onEndLiveClass,
  liveActionLessonId,
  isSavingCurriculum,
}: CourseDetailsProps) {
  const discountPercent = useMemo(() => {
    if (!course.originalPrice) return 0;
    return Math.max(0, Math.round(((course.originalPrice - course.sellingPrice) / course.originalPrice) * 100));
  }, [course.originalPrice, course.sellingPrice]);

  const liveLessons = useMemo(() => {
    return subjects.reduce((count, subject) => {
      return count + subject.modules.reduce((moduleCount, module) => {
        return moduleCount + module.lessons.filter((lesson) => lesson.isLive).length;
      }, 0);
    }, 0);
  }, [subjects]);

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-36 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
                {course.thumbnailUrl ? (
                  <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <BookOpen className="h-7 w-7" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
                  <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-xs">{course.courseType}</Badge>
                  <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-xs">{course.lifecycleStage}</Badge>
                  <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-xs">{course.status}</Badge>
                  <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-xs">{course.visibility}</Badge>
                </div>
                <div className="max-w-2xl text-sm text-muted-foreground">{course.subtitle || course.description}</div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{course.category}</span>
                  <span>•</span>
                  <span>{course.instructorName}</span>
                  <span>•</span>
                  <span>{course.instructorCount} instructors</span>
                  <span>•</span>
                  <span>{course.studentsCount} students</span>
                  <span>•</span>
                  <span>Updated {formatDate(course.lastUpdated)}</span>
                </div>
              </div>
            </div>

            <Button type="button" className="gap-2 rounded-lg" onClick={onEditCourse}>
              <Edit3 className="h-4 w-4" /> Edit course
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="min-w-max gap-1 rounded-lg border border-border/60 bg-card p-1">
            <TabsTrigger value="overview" className="rounded-md px-4 py-2">Overview</TabsTrigger>
            <TabsTrigger value="curriculum" className="rounded-md px-4 py-2">Curriculum</TabsTrigger>
            <TabsTrigger value="students" className="rounded-md px-4 py-2">Students</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-md px-4 py-2">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 outline-none">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Pricing</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(course.sellingPrice)}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Original price {formatCurrency(course.originalPrice)}
                <div>{discountPercent}% discount applied</div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Delivery</CardDescription>
                <CardTitle className="text-2xl">{course.courseType}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{course.enrollmentMode} enrollment and {course.accessMode} access</CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Lifecycle</CardDescription>
                <CardTitle className="text-2xl">{course.lifecycleStage}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{course.status} publication state</CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Subjects</CardDescription>
                <CardTitle className="text-2xl">{analytics.subjects}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{analytics.modules} modules and {analytics.lessons} lessons total</CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Enrollments</CardDescription>
                <CardTitle className="text-2xl">{analytics.enrollments}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Current course audience</CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Assessments</CardDescription>
                <CardTitle className="text-2xl">{analytics.tests}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Linked tests across the course tree</CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Basic info</CardTitle>
              <CardDescription>Key data powering catalog, search, and pricing surfaces.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">{course.description}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delivery rules</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {course.courseType} course with {course.accessMode} access and {course.enrollmentMode} enrollment.
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Instructor</div>
                <div className="mt-3 flex items-start gap-3">
                  <Avatar className="h-12 w-12 border border-border/60" size="default">
                    <AvatarImage src={course.instructorImage || undefined} alt={course.instructorName} />
                    <AvatarFallback>{course.instructorName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'IN'}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">{course.instructorName}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.instructorExperienceYears !== undefined
                        ? `${course.instructorExperienceYears} years experience`
                        : 'Instructor profile linked'}
                    </div>
                    {course.instructorBio && <div className="max-w-md text-sm leading-6 text-muted-foreground">{course.instructorBio}</div>}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Instruction model</div>
                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {course.instructorCount > 1 ? `${course.instructorCount} instructors are attached to this course.` : 'Single lead instructor.'}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</div>
                <div className="mt-2 text-sm font-medium">{course.category}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assessment policy</div>
                <div className="mt-2 text-sm font-medium">{course.assessmentMode}</div>
                <div className="mt-1 text-sm text-muted-foreground">Threshold {Math.round(course.completionThreshold)}%</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Drip content</div>
                <div className="mt-2 text-sm font-medium">{course.dripEnabled ? `${course.dripMode} every ${course.dripIntervalDays} days` : 'Disabled'}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Certificates</div>
                <div className="mt-2 text-sm font-medium">{course.certificateEnabled ? 'Enabled' : 'Disabled'}</div>
                {course.certificateTemplate ? <div className="mt-1 text-sm text-muted-foreground">{course.certificateTemplate}</div> : null}
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Updated</div>
                <div className="mt-2 text-sm font-medium">{formatDate(course.lastUpdated)}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum" className="outline-none">
          <SubjectCurriculumEditor
            courseId={course.id}
            subjects={subjects}
            onSave={onSaveCurriculum}
            onStartLiveClass={onStartLiveClass}
            onEndLiveClass={onEndLiveClass}
            liveActionLessonId={liveActionLessonId}
            isSaving={isSavingCurriculum}
          />
        </TabsContent>

        <TabsContent value="students" className="outline-none">
          <Card className="rounded-xl border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Enrolled users</CardTitle>
              <CardDescription>Track progress for each enrolled learner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {enrollments.length ? (
                enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-medium">{enrollment.studentName}</div>
                        <div className="text-sm text-muted-foreground">{enrollment.studentEmail || enrollment.userId}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">Joined {formatDate(enrollment.createdAt)}</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-foreground/80" style={{ width: `${Math.min(100, Math.max(0, enrollment.progressPercent))}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground">{Math.round(enrollment.progressPercent)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                  No enrollments yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="outline-none">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Enrollments</CardDescription>
                <CardTitle className="text-2xl">{analytics.enrollments}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4" /> Active audience count</CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Revenue</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(analytics.revenue)}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground"><GraduationCap className="h-4 w-4" /> Estimated from enrollments</CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Completion rate</CardDescription>
                <CardTitle className="text-2xl">{Math.round(analytics.completionRate)}%</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground"><BarChart3 className="h-4 w-4" /> Based on enrolled progress data</CardContent>
            </Card>
            <Card className="rounded-xl border-border/60">
              <CardHeader className="pb-2">
                <CardDescription>Tests</CardDescription>
                <CardTitle className="text-2xl">{analytics.tests}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground"><BookOpen className="h-4 w-4" /> Assessment coverage across the course</CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border-border/60 mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Content depth</CardTitle>
              <CardDescription>Structure density for this course.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><Layers3 className="h-4 w-4" /> Modules</span>
                <span className="font-medium">{analytics.modules}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><PlayCircle className="h-4 w-4" /> Lessons</span>
                <span className="font-medium">{analytics.lessons}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}