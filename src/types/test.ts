export type TestStatus = "draft" | "published";

export interface Test {
  id: string;
  title: string;
  course_id: string;
  subject_id: string;
  duration: number; // in minutes
  total_marks: number;
  status: TestStatus;
  start_time?: string;
  end_time?: string;
  created_at: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  options: string[];
  correct_answer: number; // index of options
  marks: number;
}

export interface Attempt {
  id: string;
  student_id: string;
  student_name?: string;
  test_id: string;
  score: number;
  status: "completed" | "ongoing" | "failed";
  submitted_at: string;
}
