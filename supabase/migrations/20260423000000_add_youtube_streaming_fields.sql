-- Add YouTube-based streaming fields while keeping legacy lesson URLs intact during migration.

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS youtube_live_url text,
  ADD COLUMN IF NOT EXISTS youtube_recording_url text,
  ADD COLUMN IF NOT EXISTS is_recorded_ready boolean NOT NULL DEFAULT false;

UPDATE public.lessons
SET
  youtube_live_url = COALESCE(youtube_live_url, live_url),
  youtube_recording_url = COALESCE(youtube_recording_url, video_url),
  is_recorded_ready = COALESCE(is_recorded_ready, FALSE)
WHERE youtube_live_url IS NULL
   OR youtube_recording_url IS NULL
   OR is_recorded_ready IS NULL;

CREATE INDEX IF NOT EXISTS lessons_is_recorded_ready_idx ON public.lessons (is_recorded_ready);
CREATE INDEX IF NOT EXISTS lessons_youtube_live_url_idx ON public.lessons (youtube_live_url);
CREATE INDEX IF NOT EXISTS lessons_youtube_recording_url_idx ON public.lessons (youtube_recording_url);

COMMENT ON COLUMN public.lessons.youtube_live_url IS 'Canonical YouTube live stream URL for live lessons.';
COMMENT ON COLUMN public.lessons.youtube_recording_url IS 'Canonical YouTube recording URL for recorded lessons.';
COMMENT ON COLUMN public.lessons.is_recorded_ready IS 'Marks a recorded lesson as published and ready for playback.';

CREATE OR REPLACE FUNCTION public.current_student_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT student.id
  FROM public.students student
  WHERE student.user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_course_enrolled(course_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments enrollment
    WHERE enrollment.course_id = course_uuid
      AND enrollment.student_id = public.current_student_id()
      AND COALESCE(enrollment.status, 'active') IN ('active', 'completed')
      AND (enrollment.access_expires_at IS NULL OR enrollment.access_expires_at > now())
  );
$$;

CREATE OR REPLACE FUNCTION public.get_subject_course_id(subject_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT subject.course_id
  FROM public.subjects subject
  WHERE subject.id = subject_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_module_course_id(module_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT module.course_id
  FROM public.modules module
  WHERE module.id = module_uuid;
$$;

CREATE OR REPLACE FUNCTION public.get_lesson_course_id(lesson_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT module.course_id
  FROM public.lessons lesson
  JOIN public.modules module ON module.id = lesson.module_id
  WHERE lesson.id = lesson_uuid;
$$;

CREATE OR REPLACE FUNCTION public.can_view_lesson_content(lesson_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR public.can_manage_lesson_live_state(lesson_uuid)
    OR public.is_course_enrolled(public.get_lesson_course_id(lesson_uuid))
    OR EXISTS (
      SELECT 1
      FROM public.lessons lesson
      WHERE lesson.id = lesson_uuid
        AND COALESCE(lesson.is_preview, false)
    );
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'courses' AND policyname = 'Anyone can view published courses'
  ) THEN
    CREATE POLICY "Anyone can view published courses"
      ON public.courses
      FOR SELECT
      TO anon, authenticated
      USING (status = 'Published' OR public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subjects' AND policyname = 'Anyone can view subjects for published courses'
  ) THEN
    CREATE POLICY "Anyone can view subjects for published courses"
      ON public.subjects
      FOR SELECT
      TO anon, authenticated
      USING (public.is_admin() OR EXISTS (
        SELECT 1
        FROM public.courses course
        WHERE course.id = public.get_subject_course_id(id)
          AND course.status = 'Published'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'modules' AND policyname = 'Anyone can view modules for published courses'
  ) THEN
    CREATE POLICY "Anyone can view modules for published courses"
      ON public.modules
      FOR SELECT
      TO anon, authenticated
      USING (public.is_admin() OR EXISTS (
        SELECT 1
        FROM public.courses course
        WHERE course.id = public.get_module_course_id(id)
          AND course.status = 'Published'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'lessons' AND policyname = 'Anyone can view playable lessons'
  ) THEN
    CREATE POLICY "Anyone can view playable lessons"
      ON public.lessons
      FOR SELECT
      TO anon, authenticated
      USING (public.can_view_lesson_content(id));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_course_curriculum(course_uuid uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH course_access AS (
  SELECT EXISTS (
    SELECT 1
    FROM public.courses course
    WHERE course.id = course_uuid
      AND (
        course.status = 'Published'
        OR public.is_admin()
        OR public.is_course_enrolled(course_uuid)
      )
  ) AS allowed
),
lesson_scope AS (
  SELECT
    lesson.id,
    lesson.module_id,
    lesson.title,
    lesson.lesson_type,
    lesson.duration,
    lesson.scheduled_at,
    lesson.video_url,
    lesson.youtube_live_url,
    lesson.youtube_recording_url,
    lesson.live_url,
    lesson.notes,
    lesson.is_live,
    lesson.is_recorded_ready,
    lesson.is_preview,
    lesson.live_started_at,
    lesson.live_ended_at,
    lesson.live_by,
    lesson."order",
    (
      public.is_admin()
      OR public.can_manage_lesson_live_state(lesson.id)
      OR public.is_course_enrolled(course_uuid)
      OR COALESCE(lesson.is_preview, false)
    ) AS can_play
  FROM public.lessons lesson
  JOIN public.modules module ON module.id = lesson.module_id
  WHERE module.course_id = course_uuid
),
module_scope AS (
  SELECT
    module.id,
    module.title,
    module.subject_id,
    module."order",
    jsonb_agg(
      jsonb_build_object(
        'id', lesson.id,
        'module_id', lesson.module_id,
        'title', lesson.title,
        'lesson_type', lesson.lesson_type,
        'duration', lesson.duration,
        'scheduled_at', lesson.scheduled_at,
        'video_url', CASE WHEN lesson.can_play THEN lesson.video_url ELSE NULL END,
        'youtube_live_url', CASE WHEN lesson.can_play THEN lesson.youtube_live_url ELSE NULL END,
        'youtube_recording_url', CASE WHEN lesson.can_play THEN lesson.youtube_recording_url ELSE NULL END,
        'live_url', CASE WHEN lesson.can_play THEN lesson.live_url ELSE NULL END,
        'notes', lesson.notes,
        'is_live', lesson.is_live,
        'is_recorded_ready', lesson.is_recorded_ready,
        'live_started_at', lesson.live_started_at,
        'live_ended_at', lesson.live_ended_at,
        'live_by', lesson.live_by,
        'order', lesson."order",
        'can_play', lesson.can_play
      )
      ORDER BY lesson."order"
    ) FILTER (WHERE lesson.id IS NOT NULL) AS lessons
  FROM public.modules module
  LEFT JOIN lesson_scope lesson ON lesson.module_id = module.id
  WHERE module.course_id = course_uuid
  GROUP BY module.id, module.title, module.subject_id, module."order"
),
subject_scope AS (
  SELECT
    subject.id,
    subject.course_id,
    subject.name,
    subject."order",
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', module.id,
          'subject_id', module.subject_id,
          'title', module.title,
          'order', module."order",
          'lessons', COALESCE(module.lessons, '[]'::jsonb)
        )
        ORDER BY module."order"
      ) FILTER (WHERE module.id IS NOT NULL),
      '[]'::jsonb
    ) AS modules
  FROM public.subjects subject
  LEFT JOIN module_scope module ON module.subject_id = subject.id
  WHERE subject.course_id = course_uuid
  GROUP BY subject.id, subject.course_id, subject.name, subject."order"
)
SELECT CASE
  WHEN NOT (SELECT allowed FROM course_access) THEN '[]'::jsonb
  ELSE COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', subject_scope.id,
        'course_id', subject_scope.course_id,
        'name', subject_scope.name,
        'order', subject_scope."order",
        'modules', COALESCE(subject_scope.modules, '[]'::jsonb)
      )
      ORDER BY subject_scope."order"
    ),
    '[]'::jsonb
  )
END
FROM subject_scope;
$$;
