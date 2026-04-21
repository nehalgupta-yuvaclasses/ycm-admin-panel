import { supabase } from '@/lib/supabaseClient';
import type {
  CourseAnalytics,
  CourseFormValues,
  CourseSummary,
  EnrollmentRecord,
  InstructorOption,
  LessonRecord,
  ModuleRecord,
  SubjectRecord,
} from '@/components/admin/courses/types';

export interface Course {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  category?: string;
  instructor_id?: string | null;
  course_type?: 'Live' | 'Recorded' | 'Hybrid';
  lifecycle_stage?: 'Draft' | 'Review' | 'Published' | 'Archived';
  access_mode?: 'Open' | 'InviteOnly' | 'Approval';
  enrollment_mode?: 'SelfEnroll' | 'Manual' | 'Cohort';
  drip_enabled?: boolean;
  drip_mode?: 'Immediate' | 'Scheduled' | 'Sequential';
  drip_interval_days?: number;
  certificate_enabled?: boolean;
  certificate_template?: string;
  analytics_enabled?: boolean;
  analytics_event_key?: string;
  brand_color?: string;
  cover_image_url?: string;
  publish_at?: string | null;
  archived_at?: string | null;
  assessment_mode?: 'None' | 'PerSubject' | 'PerModule' | 'PerLesson';
    assessment_notes?: string | null;
  completion_threshold?: number;
  instructor_name?: string;
  buying_price: number;
  selling_price: number;
  status: 'Draft' | 'Published';
  visibility?: 'Public' | 'Private';
  thumbnail_url?: string;
  students_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id?: string;
  course_id: string;
  name: string;
  description?: string;
  order?: number;
}

export interface CurriculumSubject {
  id?: string;
  courseId?: string;
  name: string;
  description: string;
  order: number;
  modules: CurriculumModule[];
}

export interface CurriculumModule {
  id?: string;
  subjectId?: string;
  courseId?: string;
  title: string;
  description: string;
  moduleType: 'content' | 'assessment' | 'live' | 'resource';
  dripDaysAfterSubject: number;
  order: number;
  lessons: LessonDraft[];
}

type LessonDraft = {
  id: string;
  title: string;
  lessonType: 'recorded' | 'live';
  contentType: 'recorded' | 'live' | 'document' | 'quiz' | 'assignment';
  videoUrl: string;
  liveUrl: string;
  scheduledAt: string;
  isLive: boolean;
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
};

export interface Lecture {
  id?: string;
  subject_id: string;
  title: string;
  type: 'recorded' | 'live';
  video_url?: string;
  live_url?: string;
  meeting_link?: string;
  scheduled_at?: string;
  is_live?: boolean;
  live_started_at?: string;
  live_ended_at?: string;
  live_by?: string | null;
  duration?: string;
  notes?: string;
  order?: number;
}

type CourseTableRow = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  instructor_id?: string | null;
  course_type?: 'Live' | 'Recorded' | 'Hybrid' | null;
  lifecycle_stage?: 'Draft' | 'Review' | 'Published' | 'Archived' | null;
  access_mode?: 'Open' | 'InviteOnly' | 'Approval' | null;
  enrollment_mode?: 'SelfEnroll' | 'Manual' | 'Cohort' | null;
  drip_enabled?: boolean | null;
  drip_mode?: 'Immediate' | 'Scheduled' | 'Sequential' | null;
  drip_interval_days?: number | null;
  certificate_enabled?: boolean | null;
  certificate_template?: string | null;
  analytics_enabled?: boolean | null;
  analytics_event_key?: string | null;
  brand_color?: string | null;
  cover_image_url?: string | null;
  publish_at?: string | null;
  archived_at?: string | null;
  assessment_mode?: 'None' | 'PerSubject' | 'PerModule' | 'PerLesson' | null;
  assessment_notes?: string | null;
  completion_threshold?: number | null;
  buying_price?: number | null;
  selling_price?: number | null;
  status?: 'Draft' | 'Published' | string | null;
  visibility?: 'Public' | 'Private' | string | null;
  thumbnail_url?: string | null;
  students_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UserRow = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
};

type InstructorRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  profile_image?: string | null;
  expertise?: string[] | null;
  experience_years?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ModuleRow = {
  id: string;
  course_id: string;
  subject_id?: string | null;
  title: string;
  description?: string | null;
  module_type?: 'content' | 'assessment' | 'live' | 'resource' | string | null;
  drip_days_after_subject?: number | null;
  order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type SubjectRow = {
  id: string;
  course_id: string;
  name: string;
  description?: string | null;
  order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  lesson_type?: string | null;
  content_type?: string | null;
  video_url?: string | null;
  live_url?: string | null;
  scheduled_at?: string | null;
  is_live?: boolean | null;
  live_started_at?: string | null;
  live_ended_at?: string | null;
  live_by?: string | null;
  notes?: string | null;
  duration?: string | null;
  resource_url?: string | null;
  is_preview?: boolean | null;
  unlock_after_days?: number | null;
  assessment_test_id?: string | null;
  completion_required?: boolean | null;
  published_at?: string | null;
  order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CourseInstructorRow = {
  course_id: string;
  instructor_id: string;
  is_primary?: boolean | null;
  display_order?: number | null;
};

type TestRow = {
  id: string;
  course_id?: string | null;
};

type CurriculumBundle = {
  subjects: SubjectRecord[];
  modules: ModuleRecord[];
};

type EnrollmentRow = {
  id: string;
  user_id: string;
  course_id: string;
  progress_percent?: number | null;
  status?: string | null;
  payment_status?: string | null;
  enrolled_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type LiveLessonContext = {
  courseId: string;
  lessonId: string;
  title?: string;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCourseType(value?: string | null): 'Live' | 'Recorded' | 'Hybrid' {
  return value === 'Live' || value === 'Recorded' ? value : 'Hybrid';
}

function normalizeLifecycleStage(value?: string | null): 'Draft' | 'Review' | 'Published' | 'Archived' {
  return value === 'Review' || value === 'Published' || value === 'Archived' ? value : 'Draft';
}

function normalizeAccessMode(value?: string | null): 'Open' | 'InviteOnly' | 'Approval' {
  return value === 'InviteOnly' || value === 'Approval' ? value : 'Open';
}

function normalizeEnrollmentMode(value?: string | null): 'SelfEnroll' | 'Manual' | 'Cohort' {
  return value === 'Manual' || value === 'Cohort' ? value : 'SelfEnroll';
}

function normalizeDripMode(value?: string | null): 'Immediate' | 'Scheduled' | 'Sequential' {
  return value === 'Immediate' || value === 'Scheduled' ? value : 'Sequential';
}

function normalizeAssessmentMode(value?: string | null): 'None' | 'PerSubject' | 'PerModule' | 'PerLesson' {
  return value === 'None' || value === 'PerModule' || value === 'PerLesson' ? value : 'PerSubject';
}

function normalizeLessonContentType(value?: string | null): 'recorded' | 'live' | 'document' | 'quiz' | 'assignment' {
  return value === 'live' || value === 'document' || value === 'quiz' || value === 'assignment' ? value : 'recorded';
}

function normalizeModuleType(value?: string | null): 'content' | 'assessment' | 'live' | 'resource' {
  return value === 'assessment' || value === 'live' || value === 'resource' ? value : 'content';
}

function toLessonRecord(lessonRow: LessonRow): LessonRecord {
  return {
    id: lessonRow.id,
    moduleId: lessonRow.module_id,
    title: lessonRow.title,
    lessonType: lessonRow.lesson_type === 'live' || Boolean(lessonRow.live_url) || Boolean(lessonRow.scheduled_at) ? 'live' : 'recorded',
    contentType: normalizeLessonContentType(lessonRow.content_type || lessonRow.lesson_type),
    videoUrl: lessonRow.video_url || '',
    liveUrl: lessonRow.live_url || '',
    scheduledAt: lessonRow.scheduled_at || '',
    isLive: Boolean(lessonRow.is_live),
    liveStartedAt: lessonRow.live_started_at || '',
    liveEndedAt: lessonRow.live_ended_at || '',
    liveBy: lessonRow.live_by || '',
    notes: lessonRow.notes || '',
    duration: lessonRow.duration || '',
    resourceUrl: lessonRow.resource_url || '',
    isPreview: Boolean(lessonRow.is_preview),
    unlockAfterDays: toNumber(lessonRow.unlock_after_days),
    assessmentTestId: lessonRow.assessment_test_id || undefined,
    completionRequired: lessonRow.completion_required ?? true,
    publishedAt: lessonRow.published_at || undefined,
    order: lessonRow.order || 0,
  };
}

function buildJitsiRoomUrl({ courseId, lessonId, title }: LiveLessonContext) {
  const seed = [courseId, lessonId, title || 'live-class']
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `https://meet.jit.si/yuva-${seed || lessonId}`;
}

async function getCurrentUserContext() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw authError;
  }

  const user = authData.user;
  if (!user) {
    throw new Error('You must be signed in to manage live classes.');
  }

  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (userError) {
    throw userError;
  }

  return {
    id: user.id,
    role: userRow?.role || user.user_metadata?.role || '',
  };
}

function patchLessonInCurriculum(subjects: SubjectRecord[], lesson: LessonRecord) {
  return subjects.map((subject) => ({
    ...subject,
    modules: subject.modules.map((module) => {
      if (module.id !== lesson.moduleId) {
        return module;
      }

      return {
        ...module,
        lessons: module.lessons.map((currentLesson) => (currentLesson.id === lesson.id ? lesson : currentLesson)),
      };
    }),
  }));
}

function normalizeCourse(
  row: CourseTableRow,
  instructorMap: Map<string, InstructorRow>,
  courseInstructorMap: Map<string, CourseInstructorRow[]>,
  studentsCount = 0,
  subjectsCount = 0,
  modulesCount = 0,
  lessonsCount = 0,
  testsCount = 0,
): CourseSummary {
  const instructorRows = courseInstructorMap.get(row.id) || [];
  const primaryInstructorId = instructorRows.find((entry) => entry.is_primary)?.instructor_id || row.instructor_id || '';
  const instructor = primaryInstructorId ? instructorMap.get(primaryInstructorId) : undefined;
  const instructorName = instructor?.full_name || instructor?.email || 'Unassigned';

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    category: row.category || 'General',
    instructorId: primaryInstructorId,
    instructorName,
    instructorCount: Math.max(1, instructorRows.length || (row.instructor_id ? 1 : 0)),
    coInstructorIds: instructorRows.filter((entry) => !entry.is_primary).map((entry) => entry.instructor_id),
    instructorImage: instructor?.profile_image || '',
    instructorBio: instructor?.bio || '',
    instructorExperienceYears: toNumber(instructor?.experience_years),
    thumbnailUrl: row.thumbnail_url || '',
    coverImageUrl: row.cover_image_url || '',
    brandColor: row.brand_color || '#111827',
    originalPrice: toNumber(row.buying_price),
    sellingPrice: toNumber(row.selling_price),
    courseType: normalizeCourseType(row.course_type),
    lifecycleStage: normalizeLifecycleStage(row.lifecycle_stage),
    accessMode: normalizeAccessMode(row.access_mode),
    enrollmentMode: normalizeEnrollmentMode(row.enrollment_mode),
    dripEnabled: Boolean(row.drip_enabled),
    dripMode: normalizeDripMode(row.drip_mode),
    dripIntervalDays: toNumber(row.drip_interval_days, 7),
    certificateEnabled: Boolean(row.certificate_enabled),
    certificateTemplate: row.certificate_template || '',
    assessmentMode: normalizeAssessmentMode(row.assessment_mode),
    assessmentNotes: row.assessment_notes || '',
    completionThreshold: toNumber(row.completion_threshold, 80),
    analyticsEnabled: row.analytics_enabled ?? true,
    analyticsEventKey: row.analytics_event_key || '',
    publishAt: row.publish_at || undefined,
    archivedAt: row.archived_at || undefined,
    status: row.status === 'Published' ? 'Published' : 'Draft',
    visibility: row.visibility === 'Private' ? 'Private' : 'Public',
    studentsCount,
    createdAt: row.created_at || new Date().toISOString(),
    lastUpdated: row.updated_at || row.created_at || new Date().toISOString(),
    subjectsCount,
    modulesCount,
    lessonsCount,
    testsCount,
  };
}

async function fetchInstructorMap() {
  const { data } = await supabase
    .from('instructors')
    .select('id, full_name, email, phone, bio, profile_image, expertise, experience_years, is_active, created_at, updated_at');

  const map = new Map<string, InstructorRow>();
  (data || []).forEach((instructor: InstructorRow) => map.set(instructor.id, instructor));
  return map;
}

async function fetchCourseInstructorMap() {
  const { data } = await supabase
    .from('course_instructors')
    .select('course_id, instructor_id, is_primary, display_order');

  const map = new Map<string, CourseInstructorRow[]>();
  (data || []).forEach((row: CourseInstructorRow) => {
    const current = map.get(row.course_id) || [];
    current.push(row);
    map.set(row.course_id, current.sort((left, right) => toNumber(left.display_order) - toNumber(right.display_order)));
  });
  return map;
}

async function syncCourseInstructors(courseId: string, leadInstructorId: string | null | undefined, coInstructorIds: string[] = []) {
  const uniqueCoInstructorIds = Array.from(new Set(coInstructorIds.filter((instructorId) => instructorId && instructorId !== leadInstructorId)));

  const { error: deleteError } = await supabase
    .from('course_instructors')
    .delete()
    .eq('course_id', courseId);

  if (deleteError) {
    throw deleteError;
  }

  const instructorRows = [
    ...(leadInstructorId
      ? [{ course_id: courseId, instructor_id: leadInstructorId, role: 'lead', is_primary: true, display_order: 0 }]
      : []),
    ...uniqueCoInstructorIds.map((instructorId, index) => ({
      course_id: courseId,
      instructor_id: instructorId,
      role: 'co_instructor',
      is_primary: false,
      display_order: index + 1,
    })),
  ];

  if (!instructorRows.length) {
    return;
  }

  const { error: insertError } = await supabase.from('course_instructors').insert(instructorRows);
  if (insertError) {
    throw insertError;
  }
}

async function filterAdminLinkedInstructors<T extends { id: string }>(rows: T[]) {
  if (!rows.length) return rows;

  const { data, error } = await supabase
    .from('users')
    .select('id, role')
    .in('id', rows.map((row) => row.id));

  if (error) {
    return rows;
  }

  const adminIds = new Set((data || []).filter((user: UserRow) => user.role === 'admin').map((user: UserRow) => user.id));
  return rows.filter((row) => !adminIds.has(row.id));
}

async function fetchCounts() {
  const [subjectsRes, modulesRes, lessonsRes, enrollmentsRes, testsRes] = await Promise.all([
    supabase.from('subjects').select('id, course_id'),
    supabase.from('modules').select('id, course_id'),
    supabase.from('lessons').select('id, module_id'),
    supabase.from('enrollments').select('id, course_id, progress_percent'),
    supabase.from('tests').select('id, course_id'),
  ]);

  const subjectRows = (subjectsRes.data || []) as SubjectRow[];
  const moduleRows = (modulesRes.data || []) as ModuleRow[];
  const lessonRows = (lessonsRes.data || []) as LessonRow[];
  const enrollmentRows = (enrollmentsRes.data || []) as EnrollmentRow[];
  const testRows = (testsRes.data || []) as TestRow[];

  const subjectCountByCourse = new Map<string, number>();
  subjectRows.forEach((subjectRow) => {
    subjectCountByCourse.set(subjectRow.course_id, (subjectCountByCourse.get(subjectRow.course_id) || 0) + 1);
  });

  const moduleCountByCourse = new Map<string, number>();
  moduleRows.forEach((moduleRow) => {
    moduleCountByCourse.set(moduleRow.course_id, (moduleCountByCourse.get(moduleRow.course_id) || 0) + 1);
  });

  const moduleById = new Map<string, string>();
  moduleRows.forEach((moduleRow) => moduleById.set(moduleRow.id, moduleRow.course_id));

  const lessonCountByCourse = new Map<string, number>();
  lessonRows.forEach((lessonRow) => {
    const courseId = moduleById.get(lessonRow.module_id);
    if (courseId) {
      lessonCountByCourse.set(courseId, (lessonCountByCourse.get(courseId) || 0) + 1);
    }
  });

  const enrollmentCountByCourse = new Map<string, number>();
  const progressByCourse = new Map<string, { total: number; count: number }>();
  enrollmentRows.forEach((enrollmentRow) => {
    enrollmentCountByCourse.set(enrollmentRow.course_id, (enrollmentCountByCourse.get(enrollmentRow.course_id) || 0) + 1);
    const aggregate = progressByCourse.get(enrollmentRow.course_id) || { total: 0, count: 0 };
    aggregate.total += toNumber(enrollmentRow.progress_percent);
    aggregate.count += 1;
    progressByCourse.set(enrollmentRow.course_id, aggregate);
  });

  const testCountByCourse = new Map<string, number>();
  testRows.forEach((testRow) => {
    if (!testRow.course_id) return;
    testCountByCourse.set(testRow.course_id, (testCountByCourse.get(testRow.course_id) || 0) + 1);
  });

  return {
    subjectCountByCourse,
    moduleCountByCourse,
    lessonCountByCourse,
    enrollmentCountByCourse,
    averageProgressByCourse: new Map<string, number>([...progressByCourse.entries()].map(([courseId, aggregate]) => [courseId, aggregate.count ? aggregate.total / aggregate.count : 0])),
    testCountByCourse,
    enrollmentRows,
  };
}

async function getCourseRecords(courseId?: string) {
  const [courseRes, usersRes, courseInstructorsRes, counts] = await Promise.all([
    courseId
      ? supabase.from('courses').select('*').eq('id', courseId).maybeSingle()
      : supabase.from('courses').select('*').order('created_at', { ascending: false }),
    fetchInstructorMap(),
    fetchCourseInstructorMap(),
    fetchCounts(),
  ]);

  const courseRows = Array.isArray(courseRes.data)
    ? (courseRes.data as CourseTableRow[])
    : courseRes.data
      ? [courseRes.data as CourseTableRow]
      : [];

  const courses = courseRows.map((row) =>
    normalizeCourse(
      row,
      usersRes,
      courseInstructorsRes,
      counts.enrollmentCountByCourse.get(row.id) || row.students_count || 0,
      counts.subjectCountByCourse.get(row.id) || 0,
      counts.moduleCountByCourse.get(row.id) || 0,
      counts.lessonCountByCourse.get(row.id) || 0,
      counts.testCountByCourse.get(row.id) || 0,
    ),
  );

  return { courses, counts, instructorMap: usersRes, courseInstructorMap: courseInstructorsRes };
}

async function getCourseCurriculum(courseId: string): Promise<CurriculumBundle> {
  const [subjectsRes, modulesRes, lessonsRes] = await Promise.all([
    supabase.from('subjects').select('id, course_id, name, description, order, created_at, updated_at').eq('course_id', courseId).order('order', { ascending: true }),
    supabase.from('modules').select('id, course_id, subject_id, title, description, module_type, drip_days_after_subject, order, created_at, updated_at').eq('course_id', courseId).order('order', { ascending: true }),
    supabase.from('lessons').select('id, module_id, title, lesson_type, content_type, video_url, live_url, scheduled_at, is_live, live_started_at, live_ended_at, live_by, notes, duration, resource_url, is_preview, unlock_after_days, assessment_test_id, completion_required, published_at, order, created_at, updated_at'),
  ]);

  const subjectRows = (subjectsRes.data || []) as SubjectRow[];
  const moduleRows = (modulesRes.data || []) as ModuleRow[];
  const lessonRows = (lessonsRes.data || []) as LessonRow[];

  const lessonsByModule = new Map<string, LessonRow[]>();
  lessonRows.forEach((lessonRow) => {
    const current = lessonsByModule.get(lessonRow.module_id) || [];
    current.push(lessonRow);
    lessonsByModule.set(lessonRow.module_id, current);
  });

  const modulesBySubject = new Map<string, ModuleRecord[]>();
  moduleRows.forEach((moduleRow) => {
    if (!moduleRow.subject_id) {
      return;
    }

    const current = modulesBySubject.get(moduleRow.subject_id) || [];
    current.push({
      id: moduleRow.id,
      subjectId: moduleRow.subject_id,
      courseId: moduleRow.course_id,
      title: moduleRow.title,
      description: moduleRow.description || '',
      moduleType: normalizeModuleType(moduleRow.module_type),
      dripDaysAfterSubject: toNumber(moduleRow.drip_days_after_subject),
      order: moduleRow.order || 0,
      lessons: (lessonsByModule.get(moduleRow.id) || [])
        .sort((left, right) => toNumber(left.order) - toNumber(right.order))
        .map(toLessonRecord),
    });
    modulesBySubject.set(moduleRow.subject_id, current);
  });

  const subjects = subjectRows.map((subjectRow) => ({
    id: subjectRow.id,
    courseId: subjectRow.course_id,
    name: subjectRow.name,
    description: subjectRow.description || '',
    order: subjectRow.order || 0,
    modules: (modulesBySubject.get(subjectRow.id) || []).sort((left, right) => left.order - right.order),
  })) satisfies SubjectRecord[];

  const modules = subjects.flatMap((subject) => subject.modules);

  return { subjects, modules };
}

export const courseService = {
  async getCourses(): Promise<CourseSummary[]> {
    try {
      const { courses } = await getCourseRecords();
      return courses;
    } catch (err) {
      console.error('getCourses exception:', err);
      return [];
    }
  },

  async getInstructorOptions(): Promise<InstructorOption[]> {
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('id, full_name, email, profile_image, is_active')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('getInstructorOptions error:', error);
        return [];
      }

      const filteredRows = await filterAdminLinkedInstructors((data || []) as InstructorRow[]);

      return filteredRows.map((instructor: InstructorRow) => ({
        id: instructor.id,
        name: instructor.full_name || instructor.email || 'Untitled instructor',
        email: instructor.email || '',
        role: instructor.is_active ? 'Instructor' : 'Inactive',
        profileImage: instructor.profile_image || '',
        isActive: Boolean(instructor.is_active ?? true),
      }));
    } catch (err) {
      console.error('getInstructorOptions exception:', err);
      return [];
    }
  },

  async getCourseDetails(courseId: string): Promise<{
    course: CourseSummary | null;
    subjects: SubjectRecord[];
    modules: ModuleRecord[];
    enrollments: EnrollmentRecord[];
    analytics: CourseAnalytics;
  }> {
    try {
      const { courses, counts } = await getCourseRecords(courseId);
      const course = courses[0] || null;
      const curriculum = courseId ? await getCourseCurriculum(courseId) : { subjects: [], modules: [] };
      const subjects = curriculum.subjects;
      const modules = curriculum.modules;
      const enrollments = await this.getEnrollments(courseId);
      const revenue = course ? enrollments.length * course.sellingPrice : 0;
      const averageProgress = counts.averageProgressByCourse.get(courseId) || 0;

      return {
        course,
        subjects,
        modules,
        enrollments,
        analytics: {
          enrollments: enrollments.length,
          revenue,
          completionRate: averageProgress,
          subjects: subjects.length,
          modules: modules.length,
          lessons: modules.reduce((acc, moduleRecord) => acc + moduleRecord.lessons.length, 0),
          tests: counts.testCountByCourse.get(courseId) || 0,
        },
      };
    } catch (err) {
      console.error('getCourseDetails exception:', err);
      return {
        course: null,
        subjects: [],
        modules: [],
        enrollments: [],
        analytics: { enrollments: 0, revenue: 0, completionRate: 0, subjects: 0, modules: 0, lessons: 0, tests: 0 },
      };
    }
  },

  async createCourse(course: CourseFormValues) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: course.title,
            subtitle: course.subtitle,
            description: course.description,
            category: course.category,
            instructor_id: course.instructorId || null,
            course_type: course.courseType,
            lifecycle_stage: course.lifecycleStage,
            access_mode: course.accessMode,
            enrollment_mode: course.enrollmentMode,
            drip_enabled: course.dripEnabled,
            drip_mode: course.dripMode,
            drip_interval_days: course.dripIntervalDays,
            certificate_enabled: course.certificateEnabled,
            certificate_template: course.certificateTemplate || null,
            analytics_enabled: course.analyticsEnabled,
            analytics_event_key: course.analyticsEventKey || null,
            brand_color: course.brandColor,
            cover_image_url: course.coverImageUrl || null,
            publish_at: course.publishAt || null,
            archived_at: course.archivedAt || null,
            assessment_mode: course.assessmentMode,
            assessment_notes: course.assessmentNotes || null,
            completion_threshold: course.completionThreshold,
            thumbnail_url: course.thumbnailUrl || null,
            buying_price: course.originalPrice,
            selling_price: course.sellingPrice,
            status: course.status,
            visibility: course.visibility,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('createCourse error:', error);
        throw error;
      }

      const courseId = data.id;
      await syncCourseInstructors(courseId, course.instructorId || null, course.coInstructorIds || []);

      if (!course.subjects.length) {
        throw new Error('At least one subject is required.');
      }

      for (const subjectDraft of course.subjects) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .insert([
            {
              course_id: courseId,
              name: subjectDraft.name,
              description: subjectDraft.description || null,
              order: subjectDraft.order,
            },
          ])
          .select('id')
          .single();

        if (subjectError) {
          throw subjectError;
        }

        for (const moduleDraft of subjectDraft.modules) {
          const { data: moduleData, error: moduleError } = await supabase
            .from('modules')
            .insert([
              {
                course_id: courseId,
                subject_id: subjectData.id,
                title: moduleDraft.title,
                description: moduleDraft.description || null,
                module_type: moduleDraft.moduleType,
                drip_days_after_subject: moduleDraft.dripDaysAfterSubject,
                order: moduleDraft.order,
              },
            ])
            .select('id')
            .single();

          if (moduleError) {
            throw moduleError;
          }

          for (const lessonDraft of moduleDraft.lessons) {
            const lessonType = lessonDraft.lessonType === 'live' ? 'live' : 'recorded';
            const { error: lessonError } = await supabase
              .from('lessons')
              .insert([
                {
                  module_id: moduleData.id,
                  title: lessonDraft.title,
                  lesson_type: lessonType,
                  content_type: lessonDraft.contentType || lessonType,
                  video_url: lessonType === 'recorded' ? lessonDraft.videoUrl || null : null,
                  live_url: lessonType === 'live' ? lessonDraft.liveUrl || null : null,
                  scheduled_at: lessonType === 'live' ? lessonDraft.scheduledAt || null : null,
                  is_live: Boolean(lessonDraft.isLive),
                  live_started_at: lessonDraft.liveStartedAt || null,
                  live_ended_at: lessonDraft.liveEndedAt || null,
                  live_by: lessonDraft.liveBy || null,
                  notes: lessonDraft.notes || null,
                  duration: lessonDraft.duration || null,
                  resource_url: lessonDraft.resourceUrl || null,
                  is_preview: Boolean(lessonDraft.isPreview),
                  unlock_after_days: lessonDraft.unlockAfterDays,
                  assessment_test_id: lessonDraft.assessmentTestId || null,
                  completion_required: lessonDraft.completionRequired,
                  published_at: lessonDraft.publishedAt || null,
                  order: lessonDraft.order,
                },
              ]);

            if (lessonError) {
              throw lessonError;
            }
          }
        }
      }

      return data;
    } catch (err) {
      console.error('createCourse exception:', err);
      throw err;
    }
  },

  async updateCourse(id: string, updates: Partial<Course> & { coInstructorIds?: string[] }) {
    try {
      const { coInstructorIds, ...courseUpdates } = updates;
      const { data, error } = await supabase
        .from('courses')
        .update({ ...courseUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('updateCourse error:', error);
        throw error;
      }

      if (updates.instructor_id !== undefined || coInstructorIds !== undefined) {
        await syncCourseInstructors(id, updates.instructor_id ?? data.instructor_id ?? null, coInstructorIds || []);
      }

      return data;
    } catch (err) {
      console.error('updateCourse exception:', err);
      throw err;
    }
  },

  async deleteCourse(id: string) {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);

      if (error) {
        console.error('deleteCourse error:', error);
        throw error;
      }
    } catch (err) {
      console.error('deleteCourse exception:', err);
      throw err;
    }
  },

  async saveCurriculum(courseId: string, subjects: SubjectRecord[]) {
    try {
      const { subjects: currentSubjects, modules: currentModules } = await getCourseCurriculum(courseId);

      const seenSubjectIds = new Set<string>();
      const seenModuleIds = new Set<string>();
      const seenLessonIds = new Set<string>();

      for (const subjectRecord of subjects) {
        const subjectId = subjectRecord.id || crypto.randomUUID();
        seenSubjectIds.add(subjectId);

        const { data: savedSubject, error: subjectError } = await supabase
          .from('subjects')
          .upsert(
            {
              id: subjectId,
              course_id: courseId,
              name: subjectRecord.name,
              description: subjectRecord.description || null,
              order: subjectRecord.order,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
          )
          .select('id')
          .single();

        if (subjectError) {
          throw subjectError;
        }

        for (const moduleRecord of subjectRecord.modules) {
          const moduleId = moduleRecord.id || crypto.randomUUID();
          seenModuleIds.add(moduleId);

          const { data: savedModule, error: moduleError } = await supabase
            .from('modules')
            .upsert(
              {
                id: moduleId,
                course_id: courseId,
                subject_id: savedSubject.id,
                title: moduleRecord.title,
                description: moduleRecord.description || null,
                module_type: moduleRecord.moduleType,
                drip_days_after_subject: moduleRecord.dripDaysAfterSubject,
                order: moduleRecord.order,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' },
            )
            .select('id')
            .single();

          if (moduleError) {
            throw moduleError;
          }

          for (const lesson of moduleRecord.lessons) {
            const lessonId = lesson.id || crypto.randomUUID();
            seenLessonIds.add(lessonId);
            const lessonType = lesson.lessonType === 'live' ? 'live' : 'recorded';
            const { error: lessonError } = await supabase
              .from('lessons')
              .upsert(
                {
                  id: lessonId,
                  module_id: savedModule.id,
                  title: lesson.title,
                  lesson_type: lessonType,
                  content_type: lesson.contentType || lessonType,
                  video_url: lessonType === 'recorded' ? lesson.videoUrl || null : null,
                  live_url: lessonType === 'live' ? lesson.liveUrl || null : null,
                  scheduled_at: lessonType === 'live' ? lesson.scheduledAt || null : null,
                  is_live: Boolean(lesson.isLive),
                  live_started_at: lesson.liveStartedAt || null,
                  live_ended_at: lesson.liveEndedAt || null,
                  live_by: lesson.liveBy || null,
                  notes: lesson.notes || null,
                  duration: lesson.duration || null,
                  resource_url: lesson.resourceUrl || null,
                  is_preview: Boolean(lesson.isPreview),
                  unlock_after_days: lesson.unlockAfterDays,
                  assessment_test_id: lesson.assessmentTestId || null,
                  completion_required: lesson.completionRequired,
                  published_at: lesson.publishedAt || null,
                  order: lesson.order,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' },
              );

            if (lessonError) {
              throw lessonError;
            }
          }
        }
      }

      const removableLessons = currentModules.flatMap((module) => module.lessons.filter((lesson) => !seenLessonIds.has(lesson.id)).map((lesson) => lesson.id));
      if (removableLessons.length > 0) {
        const { error: deleteLessonError } = await supabase.from('lessons').delete().in('id', removableLessons);
        if (deleteLessonError) {
          throw deleteLessonError;
        }
      }

      const removableModules = currentModules.filter((module) => !seenModuleIds.has(module.id)).map((module) => module.id);
      if (removableModules.length > 0) {
        const { error: deleteModuleError } = await supabase.from('modules').delete().in('id', removableModules);
        if (deleteModuleError) {
          throw deleteModuleError;
        }
      }

      const removableSubjects = currentSubjects.filter((subject) => !seenSubjectIds.has(subject.id)).map((subject) => subject.id);
      if (removableSubjects.length > 0) {
        const { error: deleteSubjectError } = await supabase.from('subjects').delete().in('id', removableSubjects);
        if (deleteSubjectError) {
          throw deleteSubjectError;
        }
      }
    } catch (err) {
      console.error('saveCurriculum exception:', err);
      throw err;
    }
  },

  async getSubjects(courseId: string) {
    if (!courseId) return [];
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, course_id, name, description, order')
        .eq('course_id', courseId)
        .order('order', { ascending: true });

      if (error) {
        console.error('getSubjects error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('getSubjects exception:', err);
      return [];
    }
  },

  async createSubject(subject: Subject) {
    if (!subject?.course_id) {
      throw new Error('Course ID required');
    }
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ course_id: subject.course_id, name: subject.name, order: subject.order || 0 }])
        .select()
        .single();

      if (error) {
        console.error('createSubject error:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('createSubject exception:', err);
      throw err;
    }
  },

  async updateSubject(id: string, updates: Partial<Subject>) {
    if (!id) {
      throw new Error('Subject ID required');
    }
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({ name: updates.name, order: updates.order, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('updateSubject error:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('updateSubject exception:', err);
      throw err;
    }
  },

  async deleteSubject(id: string) {
    try {
      const { count, error: countError } = await supabase
        .from('modules')
        .select('id', { count: 'exact', head: true })
        .eq('subject_id', id);

      if (countError) {
        throw countError;
      }

      if ((count || 0) > 0) {
        throw new Error('Move or delete modules before deleting this subject.');
      }

      const { error } = await supabase.from('subjects').delete().eq('id', id);

      if (error) {
        console.error('deleteSubject error:', error);
        throw error;
      }
    } catch (err) {
      console.error('deleteSubject exception:', err);
      throw err;
    }
  },

  async getLectures(subjectId: string) {
    if (!subjectId) return [];
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, module_id as subject_id, title, lesson_type, video_url, live_url, scheduled_at, is_live, live_started_at, live_ended_at, live_by, duration, notes, order, created_at')
        .eq('module_id', subjectId)
        .order('order', { ascending: true });

      if (error) {
        console.error('getLectures error:', error);
        return [];
      }
      return data || [];
    } catch (err) {
      console.error('getLectures exception:', err);
      return [];
    }
  },

  async createLecture(lecture: Lecture) {
    try {
      const lessonType = lecture.type === 'live' ? 'live' : 'recorded';
      const { data, error } = await supabase
        .from('lessons')
        .insert([
          {
            module_id: lecture.subject_id,
            title: lecture.title,
            lesson_type: lessonType,
            content_type: lessonType,
            video_url: lessonType === 'recorded' ? lecture.video_url || null : null,
            live_url: lessonType === 'live' ? lecture.live_url || lecture.meeting_link || null : null,
            scheduled_at: lessonType === 'live' ? lecture.scheduled_at || null : null,
            duration: lecture.duration || null,
            notes: '',
            resource_url: null,
            is_preview: false,
            unlock_after_days: 0,
            assessment_test_id: null,
            completion_required: true,
            order: lecture.order || 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('createLecture error:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('createLecture exception:', err);
      throw err;
    }
  },

  async updateLecture(id: string, updates: Partial<Lecture>) {
    try {
      const { data: current, error: currentError } = await supabase
        .from('lessons')
        .select('lesson_type, video_url, live_url, scheduled_at, is_live, live_started_at, live_ended_at, live_by, duration, notes, "order"')
        .eq('id', id)
        .maybeSingle();

      if (currentError) {
        console.error('updateLecture load error:', currentError);
        throw currentError;
      }

      const lessonType = updates.type || (current?.lesson_type === 'live' || current?.live_url || current?.scheduled_at ? 'live' : 'recorded');
      const isLiveLesson = lessonType === 'live';
      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: updates.title,
          lesson_type: lessonType,
          content_type: lessonType,
          video_url: lessonType === 'recorded' ? updates.video_url ?? current?.video_url ?? null : null,
          live_url: isLiveLesson ? updates.live_url ?? updates.meeting_link ?? current?.live_url ?? null : null,
          scheduled_at: isLiveLesson ? updates.scheduled_at ?? current?.scheduled_at ?? null : null,
          is_live: isLiveLesson ? updates.is_live ?? current?.is_live ?? false : false,
          live_started_at: isLiveLesson ? updates.live_started_at ?? current?.live_started_at ?? null : null,
          live_ended_at: isLiveLesson ? updates.live_ended_at ?? current?.live_ended_at ?? null : null,
          live_by: isLiveLesson ? updates.live_by ?? current?.live_by ?? null : null,
          duration: updates.duration ?? current?.duration ?? null,
          notes: updates.notes ?? current?.notes ?? '',
          resource_url: updates.resource_url ?? current?.resource_url ?? null,
          is_preview: updates.is_preview ?? current?.is_preview ?? false,
          unlock_after_days: updates.unlock_after_days ?? current?.unlock_after_days ?? 0,
          assessment_test_id: updates.assessment_test_id ?? current?.assessment_test_id ?? null,
          completion_required: updates.completion_required ?? current?.completion_required ?? true,
          order: updates.order ?? current?.order ?? 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('updateLecture error:', error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error('updateLecture exception:', err);
      throw err;
    }
  },

  async startLiveClass(courseId: string, lessonId: string) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, instructor_id, title')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      throw new Error('Course not found');
    }

    const { id: userId, role } = await getCurrentUserContext();
    if (role !== 'admin' && course.instructor_id && course.instructor_id !== userId) {
      throw new Error('You are not allowed to start this live class.');
    }

    const { data: currentLesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, module_id, title, lesson_type, live_url, is_live, live_started_at, live_ended_at, live_by, order, notes, duration, scheduled_at, video_url')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError) {
      throw lessonError;
    }

    if (!currentLesson) {
      throw new Error('Lesson not found');
    }

    const meetingUrl = currentLesson.live_url || buildJitsiRoomUrl({ courseId, lessonId, title: currentLesson.title });
    const { data, error } = await supabase
      .from('lessons')
      .update({
        lesson_type: 'live',
        live_url: meetingUrl,
        is_live: true,
        live_started_at: new Date().toISOString(),
        live_ended_at: null,
        live_by: course.instructor_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .select('id, module_id, title, lesson_type, content_type, video_url, live_url, scheduled_at, is_live, live_started_at, live_ended_at, live_by, notes, duration, resource_url, is_preview, unlock_after_days, assessment_test_id, completion_required, published_at, order, created_at, updated_at')
      .single();

    if (error) {
      throw error;
    }

    return { lesson: toLessonRecord(data as LessonRow), meetingUrl };
  },

  async endLiveClass(courseId: string, lessonId: string) {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, instructor_id')
      .eq('id', courseId)
      .maybeSingle();

    if (courseError) {
      throw courseError;
    }

    if (!course) {
      throw new Error('Course not found');
    }

    const { id: userId, role } = await getCurrentUserContext();
    if (role !== 'admin' && course.instructor_id && course.instructor_id !== userId) {
      throw new Error('You are not allowed to end this live class.');
    }

    const { data, error } = await supabase
      .from('lessons')
      .update({
        is_live: false,
        live_ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .select('id, module_id, title, lesson_type, content_type, video_url, live_url, scheduled_at, is_live, live_started_at, live_ended_at, live_by, notes, duration, resource_url, is_preview, unlock_after_days, assessment_test_id, completion_required, published_at, order, created_at, updated_at')
      .single();

    if (error) {
      throw error;
    }

    return toLessonRecord(data as LessonRow);
  },

  watchCourseLessonChanges(courseId: string, onChange: (lesson: LessonRecord) => void) {
    let active = true;
    const channel = supabase.channel(`public:lesson-live:${courseId}`);

    const boot = async () => {
      const { data: modules, error } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      if (error || !active) {
        return;
      }

      const moduleIds = (modules || []).map((module: { id: string }) => module.id);
      const moduleIdSet = new Set(moduleIds);

      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
        },
        (payload) => {
          if (!active) return;
          const raw = payload.eventType === 'DELETE' ? payload.oldRecord : payload.newRecord;
          if (!raw || Object.keys(raw).length === 0) return;
          if (!moduleIdSet.has(String(raw.module_id || ''))) return;
          onChange(toLessonRecord(raw as LessonRow));
        },
      );

      channel.subscribe();
    };

    void boot();

    return async () => {
      active = false;
      await supabase.removeChannel(channel);
    };
  },

  async deleteLecture(id: string) {
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) {
        console.error('deleteLecture error:', error);
        throw error;
      }
    } catch (err) {
      console.error('deleteLecture exception:', err);
      throw err;
    }
  },

  async getEnrollments(courseId: string): Promise<EnrollmentRecord[]> {
    if (!courseId) return [];

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, user_id, course_id, progress_percent, created_at')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('getEnrollments error:', error);
        return [];
      }

      const userIds = (data || []).map((row: EnrollmentRow) => row.user_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, name, full_name, email')
        .in('id', userIds);

      const usersMap = new Map<string, UserRow>();
      (users || []).forEach((user: UserRow) => usersMap.set(user.id, user));

      return (data || []).map((row: EnrollmentRow) => {
        const student = usersMap.get(row.user_id);
        return {
          id: row.id,
          userId: row.user_id,
          courseId: row.course_id,
          progressPercent: toNumber(row.progress_percent),
          createdAt: row.created_at || new Date().toISOString(),
          studentName: student?.name || student?.full_name || student?.email || 'Student',
          studentEmail: student?.email || '',
        };
      });
    } catch (err) {
      console.error('getEnrollments exception:', err);
      return [];
    }
  },
};
