export type CourseStatus = "Draft" | "Published";
export type CourseVisibility = "Public" | "Private";
export type CourseSort = "newest" | "popular";

export interface InstructorOption {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  isActive?: boolean;
}

export interface LessonDraft {
  id: string;
  title: string;
  lessonType: "recorded" | "live";
  videoUrl: string;
  liveUrl: string;
  scheduledAt: string;
  isLive: boolean;
  liveStartedAt: string;
  liveEndedAt: string;
  liveBy: string;
  notes: string;
  duration: string;
  order: number;
}

export interface ModuleDraft {
  id: string;
  title: string;
  order: number;
  lessons: LessonDraft[];
}

export interface CourseFormValues {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  instructorId: string;
  thumbnailUrl: string;
  originalPrice: number;
  sellingPrice: number;
  status: CourseStatus;
  visibility: CourseVisibility;
  modules: ModuleDraft[];
}

export interface CourseSummary {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  instructorId: string;
  instructorName: string;
  instructorImage?: string;
  instructorBio?: string;
  instructorExperienceYears?: number;
  thumbnailUrl: string;
  originalPrice: number;
  sellingPrice: number;
  status: CourseStatus;
  visibility: CourseVisibility;
  studentsCount: number;
  createdAt: string;
  lastUpdated: string;
  subjectsCount: number;
  modulesCount: number;
  lessonsCount: number;
}

export interface LessonRecord {
  id: string;
  moduleId: string;
  title: string;
  lessonType: "recorded" | "live";
  videoUrl: string;
  liveUrl: string;
  scheduledAt: string;
  isLive: boolean;
  liveStartedAt: string;
  liveEndedAt: string;
  liveBy: string;
  notes: string;
  duration: string;
  order: number;
}

export interface ModuleRecord {
  id: string;
  subjectId: string;
  courseId: string;
  title: string;
  order: number;
  lessons: LessonRecord[];
}

export interface SubjectRecord {
  id: string;
  courseId: string;
  name: string;
  order: number;
  modules: ModuleRecord[];
}

export interface EnrollmentRecord {
  id: string;
  userId: string;
  courseId: string;
  progressPercent: number;
  createdAt: string;
  studentName: string;
  studentEmail: string;
}

export interface CourseAnalytics {
  enrollments: number;
  revenue: number;
  completionRate: number;
  subjects: number;
  modules: number;
  lessons: number;
}

export interface CourseDetailsData {
  course: CourseSummary;
  subjects: SubjectRecord[];
  modules: ModuleRecord[];
  enrollments: EnrollmentRecord[];
  analytics: CourseAnalytics;
}

export interface CoursePageFilters {
  search: string;
  status: "all" | CourseStatus;
  category: string;
  sort: CourseSort;
}