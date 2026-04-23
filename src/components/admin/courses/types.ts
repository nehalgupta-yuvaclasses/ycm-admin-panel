export type CourseStatus = "Draft" | "Published";
export type CourseLifecycleStage = "Draft" | "Review" | "Published" | "Archived";
export type CourseType = "Live" | "Recorded" | "Hybrid";
export type CourseAccessMode = "Open" | "InviteOnly" | "Approval";
export type CourseEnrollmentMode = "SelfEnroll" | "Manual" | "Cohort";
export type CourseDripMode = "Immediate" | "Scheduled" | "Sequential";
export type CourseAssessmentMode = "None" | "PerSubject" | "PerModule" | "PerLesson";
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
  contentType: "recorded" | "live" | "document" | "quiz" | "assignment";
  videoUrl: string;
  youtubeLiveUrl?: string;
  youtubeRecordingUrl?: string;
  liveUrl: string;
  scheduledAt: string;
  isLive: boolean;
  isRecordedReady?: boolean;
  liveStartedAt: string;
  liveEndedAt: string;
  liveBy: string;
  notes: string;
  duration: string;
  resourceUrl: string;
  isPreview: boolean;
  unlockAfterDays: number;
  order: number;
}

export interface ModuleDraft {
  id: string;
  title: string;
  description: string;
  moduleType: "content" | "assessment" | "live" | "resource";
  dripDaysAfterSubject: number;
  order: number;
  lessons: LessonDraft[];
}

export interface SubjectDraft {
  id: string;
  name: string;
  description: string;
  order: number;
  modules: ModuleDraft[];
}

export interface CourseFormValues {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  instructorId: string;
  coInstructorIds: string[];
  courseType: CourseType;
  lifecycleStage: CourseLifecycleStage;
  accessMode: CourseAccessMode;
  enrollmentMode: CourseEnrollmentMode;
  thumbnailUrl: string;
  coverImageUrl: string;
  brandColor: string;
  originalPrice: number;
  sellingPrice: number;
  dripEnabled: boolean;
  dripMode: CourseDripMode;
  dripIntervalDays: number;
  certificateEnabled: boolean;
  certificateTemplate: string;
  assessmentMode: CourseAssessmentMode;
  assessmentNotes: string;
  completionThreshold: number;
  analyticsEnabled: boolean;
  analyticsEventKey: string;
  publishAt: string;
  archivedAt: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  subjects: SubjectDraft[];
}

export interface CourseSummary {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  instructorId: string;
  instructorName: string;
  instructorCount: number;
  coInstructorIds: string[];
  instructorImage?: string;
  instructorBio?: string;
  instructorExperienceYears?: number;
  thumbnailUrl: string;
  coverImageUrl: string;
  brandColor: string;
  originalPrice: number;
  sellingPrice: number;
  courseType: CourseType;
  lifecycleStage: CourseLifecycleStage;
  accessMode: CourseAccessMode;
  enrollmentMode: CourseEnrollmentMode;
  dripEnabled: boolean;
  dripMode: CourseDripMode;
  dripIntervalDays: number;
  certificateEnabled: boolean;
  certificateTemplate: string;
  assessmentMode: CourseAssessmentMode;
  assessmentNotes: string;
  completionThreshold: number;
  analyticsEnabled: boolean;
  analyticsEventKey: string;
  publishAt?: string;
  archivedAt?: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  studentsCount: number;
  createdAt: string;
  lastUpdated: string;
  subjectsCount: number;
  modulesCount: number;
  lessonsCount: number;
  testsCount: number;
}

export interface LessonRecord {
  id: string;
  moduleId: string;
  title: string;
  lessonType: "recorded" | "live";
  contentType: "recorded" | "live" | "document" | "quiz" | "assignment";
  videoUrl: string;
  youtubeLiveUrl?: string;
  youtubeRecordingUrl?: string;
  liveUrl: string;
  scheduledAt: string;
  isLive: boolean;
  isRecordedReady?: boolean;
  liveStartedAt: string;
  liveEndedAt: string;
  liveBy: string;
  notes: string;
  duration: string;
  resourceUrl: string;
  isPreview: boolean;
  unlockAfterDays: number;
  assessmentTestId?: string;
  completionRequired: boolean;
  publishedAt?: string;
  order: number;
}

export interface ModuleRecord {
  id: string;
  subjectId: string;
  courseId: string;
  title: string;
  description: string;
  moduleType: "content" | "assessment" | "live" | "resource";
  dripDaysAfterSubject: number;
  order: number;
  lessons: LessonRecord[];
}

export interface SubjectRecord {
  id: string;
  courseId: string;
  name: string;
  description: string;
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
  tests: number;
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