-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  test_id uuid,
  score integer DEFAULT 0,
  status text DEFAULT 'completed'::text CHECK (status = ANY (ARRAY['completed'::text, 'ongoing'::text, 'failed'::text])),
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attempts_pkey PRIMARY KEY (id),
  CONSTRAINT attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT attempts_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.banners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  subtitle text,
  cta_text text,
  cta_link text,
  sort_order integer DEFAULT 0,
  CONSTRAINT banners_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content jsonb DEFAULT '{}'::jsonb,
  excerpt text,
  cover_image text,
  meta_title text,
  meta_description text,
  keywords ARRAY DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text])),
  author_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category text DEFAULT 'General'::text,
  author_name text,
  author_role text,
  author_avatar_url text,
  author_bio text,
  CONSTRAINT blogs_pkey PRIMARY KEY (id),
  CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.contact_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'read'::text, 'replied'::text])),
  CONSTRAINT contact_messages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.course_instructors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'co_instructor'::text CHECK (role = ANY (ARRAY['lead'::text, 'co_instructor'::text, 'assistant'::text])),
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT course_instructors_pkey PRIMARY KEY (id),
  CONSTRAINT course_instructors_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_instructors_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'Draft'::text CHECK (status = ANY (ARRAY['Draft'::text, 'Published'::text])),
  thumbnail_url text,
  students_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  buying_price numeric DEFAULT 0,
  selling_price numeric DEFAULT 0,
  author text DEFAULT ''::text,
  subtitle text DEFAULT ''::text,
  category text DEFAULT 'General'::text,
  instructor_id uuid,
  visibility text NOT NULL DEFAULT 'Public'::text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  course_type text NOT NULL DEFAULT 'Hybrid'::text CHECK (course_type = ANY (ARRAY['Live'::text, 'Recorded'::text, 'Hybrid'::text])),
  lifecycle_stage text NOT NULL DEFAULT 'Draft'::text CHECK (lifecycle_stage = ANY (ARRAY['Draft'::text, 'Review'::text, 'Published'::text, 'Archived'::text])),
  access_mode text NOT NULL DEFAULT 'Open'::text CHECK (access_mode = ANY (ARRAY['Open'::text, 'InviteOnly'::text, 'Approval'::text])),
  enrollment_mode text NOT NULL DEFAULT 'SelfEnroll'::text CHECK (enrollment_mode = ANY (ARRAY['SelfEnroll'::text, 'Manual'::text, 'Cohort'::text])),
  drip_enabled boolean NOT NULL DEFAULT false,
  drip_mode text NOT NULL DEFAULT 'Sequential'::text CHECK (drip_mode = ANY (ARRAY['Immediate'::text, 'Scheduled'::text, 'Sequential'::text])),
  drip_interval_days integer NOT NULL DEFAULT 7 CHECK (drip_interval_days >= 0),
  certificate_enabled boolean NOT NULL DEFAULT false,
  certificate_template text DEFAULT ''::text,
  analytics_enabled boolean NOT NULL DEFAULT true,
  analytics_event_key text DEFAULT ''::text,
  brand_color text NOT NULL DEFAULT '#111827'::text,
  cover_image_url text DEFAULT ''::text,
  publish_at timestamp with time zone,
  archived_at timestamp with time zone,
  assessment_mode text NOT NULL DEFAULT 'PerSubject'::text CHECK (assessment_mode = ANY (ARRAY['None'::text, 'PerSubject'::text, 'PerModule'::text, 'PerLesson'::text])),
  assessment_notes text DEFAULT ''::text,
  completion_threshold numeric NOT NULL DEFAULT 80 CHECK (completion_threshold >= 0::numeric AND completion_threshold <= 100::numeric),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  course_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text])),
  enrolled_at timestamp with time zone,
  completed_at timestamp with time zone,
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text])),
  source text NOT NULL DEFAULT 'web'::text,
  access_expires_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.instructors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE,
  phone text,
  bio text,
  profile_image text,
  expertise ARRAY NOT NULL DEFAULT '{}'::text[],
  experience_years integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT instructors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lectures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid,
  title text NOT NULL,
  type text DEFAULT 'recorded'::text CHECK (type = ANY (ARRAY['recorded'::text, 'live'::text])),
  video_url text,
  meeting_link text,
  duration text,
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lectures_pkey PRIMARY KEY (id),
  CONSTRAINT lectures_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  title text NOT NULL,
  video_url text,
  notes text,
  duration text,
  order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  lesson_type text NOT NULL DEFAULT 'recorded'::text CHECK (lesson_type = ANY (ARRAY['recorded'::text, 'live'::text])),
  live_url text,
  scheduled_at timestamp with time zone,
  is_live boolean NOT NULL DEFAULT false,
  live_started_at timestamp with time zone,
  live_ended_at timestamp with time zone,
  live_by uuid,
  content_type text NOT NULL DEFAULT 'recorded'::text,
  resource_url text,
  is_preview boolean NOT NULL DEFAULT false,
  unlock_after_days integer NOT NULL DEFAULT 0,
  assessment_test_id uuid,
  completion_required boolean NOT NULL DEFAULT true,
  published_at timestamp with time zone,
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT lessons_live_by_fkey FOREIGN KEY (live_by) REFERENCES public.instructors(id),
  CONSTRAINT lessons_assessment_test_id_fkey FOREIGN KEY (assessment_test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  title text NOT NULL,
  order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  subject_id uuid NOT NULL,
  module_type text NOT NULL DEFAULT 'content'::text,
  drip_days_after_subject integer NOT NULL DEFAULT 0,
  unlock_after_module_id uuid,
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT modules_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT modules_unlock_after_module_id_fkey FOREIGN KEY (unlock_after_module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  target_type text DEFAULT 'all'::text CHECK (target_type = ANY (ARRAY['all'::text, 'course'::text, 'batch'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_config (
  id integer NOT NULL DEFAULT nextval('payment_config_id_seq'::regclass),
  razorpay_key_id text,
  razorpay_key_secret text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_settings (
  id integer NOT NULL DEFAULT 1,
  provider text NOT NULL DEFAULT 'razorpay'::text,
  api_key text NOT NULL DEFAULT ''::text,
  api_secret text NOT NULL DEFAULT ''::text,
  currency text NOT NULL DEFAULT 'INR'::text,
  gst_rate numeric NOT NULL DEFAULT 18,
  enable_payments boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_enabled boolean NOT NULL DEFAULT true,
  CONSTRAINT payment_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  amount numeric NOT NULL,
  status text DEFAULT 'success'::text CHECK (status = ANY (ARRAY['success'::text, 'pending'::text, 'failed'::text, 'refunded'::text])),
  created_at timestamp with time zone DEFAULT now(),
  course_id uuid,
  user_id uuid NOT NULL,
  order_id text UNIQUE,
  payment_id text,
  provider text NOT NULL DEFAULT 'razorpay'::text,
  currency text NOT NULL DEFAULT 'INR'::text,
  gst_amount numeric NOT NULL DEFAULT 0,
  verified_at timestamp with time zone,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT payments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.platform_config (
  id integer NOT NULL DEFAULT nextval('platform_config_id_seq'::regclass),
  platform_name text DEFAULT 'Yuva Classes'::text,
  support_email text DEFAULT 'support@yuvaclasses.com'::text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT platform_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.platform_settings (
  id integer NOT NULL DEFAULT 1,
  platform_name text NOT NULL DEFAULT 'Yuva Classes'::text,
  logo_url text,
  contact_email text NOT NULL DEFAULT 'support@yuvaclasses.com'::text,
  support_phone text NOT NULL DEFAULT '+91 98765 43210'::text,
  default_language text NOT NULL DEFAULT 'en'::text,
  maintenance_mode boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT platform_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  email text,
  role text DEFAULT 'student'::text CHECK (role = ANY (ARRAY['admin'::text, 'student'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid,
  question_text text NOT NULL,
  options ARRAY NOT NULL,
  correct_answer integer NOT NULL,
  marks integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.resource_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  resource_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending'::text CHECK (payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text])),
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT resource_purchases_pkey PRIMARY KEY (id),
  CONSTRAINT resource_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT resource_purchases_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT ''::text,
  type text NOT NULL CHECK (type = ANY (ARRAY['pdf'::text, 'notes'::text, 'book'::text])),
  file_url text NOT NULL DEFAULT ''::text,
  thumbnail_url text,
  base_price numeric NOT NULL DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['active'::text, 'draft'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT resources_pkey PRIMARY KEY (id)
);
CREATE TABLE public.results (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  exam text NOT NULL,
  rank text NOT NULL,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  result text,
  year text,
  CONSTRAINT results_pkey PRIMARY KEY (id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.student_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  course_name text NOT NULL,
  CONSTRAINT student_courses_pkey PRIMARY KEY (id),
  CONSTRAINT student_courses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  city text,
  state text,
  name text,
  phone text,
  firebase_uid text,
  aspirant_type text,
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  order integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  description text DEFAULT ''::text,
  CONSTRAINT subjects_pkey PRIMARY KEY (id),
  CONSTRAINT subjects_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'unsubscribed'::text])),
  CONSTRAINT subscribers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  subject_id uuid NOT NULL,
  title text NOT NULL,
  duration integer DEFAULT 30,
  total_marks integer DEFAULT 100,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['published'::text, 'draft'::text])),
  created_at timestamp with time zone DEFAULT now(),
  module_id uuid,
  lesson_id uuid,
  assessment_kind text NOT NULL DEFAULT 'quiz'::text CHECK (assessment_kind = ANY (ARRAY['quiz'::text, 'assignment'::text, 'mock'::text, 'exam'::text])),
  attempt_limit integer NOT NULL DEFAULT 1,
  passing_marks numeric NOT NULL DEFAULT 40,
  duration_minutes integer,
  instructions text DEFAULT ''::text,
  published_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tests_pkey PRIMARY KEY (id),
  CONSTRAINT tests_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT tests_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT tests_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT tests_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE,
  role text DEFAULT 'student'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  avatar_url text,
  bio text,
  firebase_uid text NOT NULL,
  phone text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);