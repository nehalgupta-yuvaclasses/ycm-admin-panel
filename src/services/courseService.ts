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
  order?: number;
}

export interface CurriculumSubject {
  id?: string;
  courseId?: string;
  name: string;
  order: number;
  modules: CurriculumModule[];
}

export interface CurriculumModule {
  id?: string;
  subjectId?: string;
  courseId?: string;
  title: string;
  order: number;
  lessons: LessonDraft[];
}

type LessonDraft = {
  id: string;
  title: string;
  lessonType: 'recorded' | 'live';
  videoUrl: string;
  liveUrl: string;
  scheduledAt: string;
  notes: string;
  duration: string;
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
  order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type SubjectRow = {
  id: string;
  course_id: string;
  name: string;
  order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type LessonRow = {
  id: string;
  module_id: string;
  title: string;
  lesson_type?: string | null;
  video_url?: string | null;
  live_url?: string | null;
  scheduled_at?: string | null;
  notes?: string | null;
  duration?: string | null;
  order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  created_at?: string | null;
  updated_at?: string | null;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCourse(
  row: CourseTableRow,
  instructorMap: Map<string, InstructorRow>,
  studentsCount = 0,
  subjectsCount = 0,
  modulesCount = 0,
  lessonsCount = 0,
): CourseSummary {
  const instructor = row.instructor_id ? instructorMap.get(row.instructor_id) : undefined;
  const instructorName = instructor?.full_name || instructor?.email || 'Unassigned';

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    category: row.category || 'General',
    instructorId: row.instructor_id || '',
    instructorName,
    instructorImage: instructor?.profile_image || '',
    instructorBio: instructor?.bio || '',
    instructorExperienceYears: toNumber(instructor?.experience_years),
    thumbnailUrl: row.thumbnail_url || '',
    originalPrice: toNumber(row.buying_price),
    sellingPrice: toNumber(row.selling_price),
    status: row.status === 'Published' ? 'Published' : 'Draft',
    visibility: row.visibility === 'Private' ? 'Private' : 'Public',
    studentsCount,
    createdAt: row.created_at || new Date().toISOString(),
    lastUpdated: row.updated_at || row.created_at || new Date().toISOString(),
    subjectsCount,
    modulesCount,
    lessonsCount,
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
  const [subjectsRes, modulesRes, lessonsRes] = await Promise.all([
    supabase.from('subjects').select('id, course_id'),
    supabase.from('modules').select('id, course_id'),
    supabase.from('lessons').select('id, module_id'),
  ]);

  const subjectRows = (subjectsRes.data || []) as SubjectRow[];
  const moduleRows = (modulesRes.data || []) as ModuleRow[];
  const lessonRows = (lessonsRes.data || []) as LessonRow[];

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

  return {
    subjectCountByCourse,
    moduleCountByCourse,
    lessonCountByCourse,
    enrollmentCountByCourse: new Map<string, number>(),
    averageProgressByCourse: new Map<string, number>(),
    enrollmentRows: [] as EnrollmentRow[],
  };
}

async function getCourseRecords(courseId?: string) {
  const [courseRes, usersRes, counts] = await Promise.all([
    courseId
      ? supabase.from('courses').select('*').eq('id', courseId).maybeSingle()
      : supabase.from('courses').select('*').order('created_at', { ascending: false }),
    fetchInstructorMap(),
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
      counts.enrollmentCountByCourse.get(row.id) || row.students_count || 0,
      counts.subjectCountByCourse.get(row.id) || 0,
      counts.moduleCountByCourse.get(row.id) || 0,
      counts.lessonCountByCourse.get(row.id) || 0,
    ),
  );

  return { courses, counts, instructorMap: usersRes };
}

async function getCourseCurriculum(courseId: string): Promise<CurriculumBundle> {
  const [subjectsRes, modulesRes, lessonsRes] = await Promise.all([
    supabase.from('subjects').select('id, course_id, name, order, created_at, updated_at').eq('course_id', courseId).order('order', { ascending: true }),
    supabase.from('modules').select('id, course_id, subject_id, title, order, created_at, updated_at').eq('course_id', courseId).order('order', { ascending: true }),
    supabase.from('lessons').select('id, module_id, title, lesson_type, video_url, live_url, scheduled_at, notes, duration, order, created_at, updated_at'),
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
      order: moduleRow.order || 0,
      lessons: (lessonsByModule.get(moduleRow.id) || [])
        .sort((left, right) => toNumber(left.order) - toNumber(right.order))
        .map((lessonRow) => ({
          id: lessonRow.id,
          moduleId: lessonRow.module_id,
          title: lessonRow.title,
          lessonType: lessonRow.lesson_type === 'live' || Boolean(lessonRow.live_url) || Boolean(lessonRow.scheduled_at) ? 'live' : 'recorded',
          videoUrl: lessonRow.video_url || '',
          liveUrl: lessonRow.live_url || '',
          scheduledAt: lessonRow.scheduled_at || '',
          notes: lessonRow.notes || '',
          duration: lessonRow.duration || '',
          order: lessonRow.order || 0,
        })),
    });
    modulesBySubject.set(moduleRow.subject_id, current);
  });

  const subjects = subjectRows.map((subjectRow) => ({
    id: subjectRow.id,
    courseId: subjectRow.course_id,
    name: subjectRow.name,
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
      const { courses } = await getCourseRecords(courseId);
      const course = courses[0] || null;
      const curriculum = courseId ? await getCourseCurriculum(courseId) : { subjects: [], modules: [] };
      const subjects = curriculum.subjects;
      const modules = curriculum.modules;
      const enrollments: EnrollmentRecord[] = [];
      const revenue = 0;
      const averageProgress = 0;

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
        },
      };
    } catch (err) {
      console.error('getCourseDetails exception:', err);
      return {
        course: null,
        subjects: [],
        modules: [],
        enrollments: [],
        analytics: { enrollments: 0, revenue: 0, completionRate: 0, subjects: 0, modules: 0, lessons: 0 },
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
      const { data: generalSubject, error: subjectError } = await supabase
        .from('subjects')
        .insert([{ course_id: courseId, name: 'General', order: 0 }])
        .select('id')
        .single();

      if (subjectError) {
        throw subjectError;
      }

      for (const moduleDraft of course.modules) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .insert([
            {
              course_id: courseId,
              subject_id: generalSubject.id,
              title: moduleDraft.title,
              order: moduleDraft.order,
            },
          ])
          .select()
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
                video_url: lessonType === 'recorded' ? lessonDraft.videoUrl || null : null,
                live_url: lessonType === 'live' ? lessonDraft.liveUrl || null : null,
                scheduled_at: lessonType === 'live' ? lessonDraft.scheduledAt || null : null,
                notes: lessonDraft.notes || null,
                duration: lessonDraft.duration || null,
                order: lessonDraft.order,
              },
            ]);

          if (lessonError) {
            throw lessonError;
          }
        }
      }

      return data;
    } catch (err) {
      console.error('createCourse exception:', err);
      throw err;
    }
  },

  async updateCourse(id: string, updates: Partial<Course>) {
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('updateCourse error:', error);
        throw error;
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
                  video_url: lessonType === 'recorded' ? lesson.videoUrl || null : null,
                  live_url: lessonType === 'live' ? lesson.liveUrl || null : null,
                  scheduled_at: lessonType === 'live' ? lesson.scheduledAt || null : null,
                  notes: lesson.notes || null,
                  duration: lesson.duration || null,
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
        .select('id, course_id, name, order')
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
        .select('id, module_id as subject_id, title, lesson_type, video_url, live_url, scheduled_at, duration, notes, order, created_at')
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
            video_url: lessonType === 'recorded' ? lecture.video_url || null : null,
            live_url: lessonType === 'live' ? lecture.live_url || lecture.meeting_link || null : null,
            scheduled_at: lessonType === 'live' ? lecture.scheduled_at || null : null,
            duration: lecture.duration || null,
            notes: '',
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
        .select('lesson_type, video_url, live_url, scheduled_at, duration, notes, "order"')
        .eq('id', id)
        .maybeSingle();

      if (currentError) {
        console.error('updateLecture load error:', currentError);
        throw currentError;
      }

      const lessonType = updates.type || (current?.lesson_type === 'live' || current?.live_url || current?.scheduled_at ? 'live' : 'recorded');
      const { data, error } = await supabase
        .from('lessons')
        .update({
          title: updates.title,
          lesson_type: lessonType,
          video_url: lessonType === 'recorded' ? updates.video_url ?? current?.video_url ?? null : null,
          live_url: lessonType === 'live' ? updates.live_url ?? updates.meeting_link ?? current?.live_url ?? null : null,
          scheduled_at: lessonType === 'live' ? updates.scheduled_at ?? current?.scheduled_at ?? null : null,
          duration: updates.duration ?? current?.duration ?? null,
          notes: updates.notes ?? current?.notes ?? '',
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
