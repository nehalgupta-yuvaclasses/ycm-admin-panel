import { supabase } from "@/lib/supabase";

export interface Test {
  id?: string;
  course_id: string;
  subject_id: string;
  title: string;
  duration: number;
  total_marks: number;
  status: string;
}

export interface TestListItem {
  id: string;
  course_id: string | null;
  subject_id: string | null;
  title: string;
  duration: number | null;
  total_marks: number | null;
  status: string;
  created_at: string;
  course: { id: string; title: string } | null;
  subject: { id: string; name: string } | null;
}

export interface Question {
  id?: string;
  test_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  marks: number;
}

type AttemptRow = {
  id: string;
  student_id: string | null;
  test_id: string | null;
  score: number | null;
  status: "completed" | "ongoing" | "failed" | string | null;
  submitted_at: string | null;
};

type StudentRow = {
  id: string;
  full_name: string | null;
  name: string | null;
  email: string | null;
};

export type ResolvedAttempt = {
  id: string;
  student_id: string;
  student_name: string;
  test_id: string;
  score: number;
  status: "completed" | "ongoing" | "failed";
  submitted_at: string;
  student_email?: string;
};

async function assertSubjectMatchesCourse(courseId: string, subjectId: string) {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, course_id")
    .eq("id", subjectId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || data.course_id !== courseId) {
    throw new Error("Selected subject does not belong to the selected course.");
  }
}

export const testService = {
  async getTests() {
    try {
      const { data, error } = await supabase
        .from("tests")
        .select("id, course_id, subject_id, title, duration, total_marks, status, created_at, course:courses!tests_course_id_fkey(id, title), subject:subjects!tests_subject_id_fkey(id, name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("getTests error:", error);
        throw error;
      }
      return (data || []) as TestListItem[];
    } catch (err) {
      console.error("getTests exception:", err);
      return [];
    }
  },

  async createTest(test: Test) {
    try {
      if (!test.course_id || !test.subject_id) {
        throw new Error("Course and subject are required.");
      }

      if (!test.status || !["draft", "published"].includes(test.status)) {
        throw new Error("Test status must be draft or published.");
      }

      await assertSubjectMatchesCourse(test.course_id, test.subject_id);

      const payload: Test = {
        course_id: test.course_id,
        subject_id: test.subject_id,
        title: test.title.trim(),
        duration: test.duration,
        total_marks: test.total_marks,
        status: test.status,
      };

      const { data, error } = await supabase
        .from("tests")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error("createTest error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("createTest exception:", err);
      throw err;
    }
  },

  async updateTest(id: string, updates: Partial<Test>) {
    try {
      if (updates.status && !["draft", "published"].includes(updates.status)) {
        throw new Error("Test status must be draft or published.");
      }

      if (updates.course_id || updates.subject_id) {
        const { data: current, error: currentError } = await supabase
          .from("tests")
          .select("course_id, subject_id")
          .eq("id", id)
          .maybeSingle();

        if (currentError) {
          throw currentError;
        }

        const nextCourseId = updates.course_id ?? current?.course_id;
        const nextSubjectId = updates.subject_id ?? current?.subject_id;

        if (nextCourseId && nextSubjectId) {
          await assertSubjectMatchesCourse(nextCourseId, nextSubjectId);
        }
      }

      const { data, error } = await supabase
        .from("tests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateTest error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("updateTest exception:", err);
      throw err;
    }
  },

  async deleteTest(id: string) {
    try {
      const { error } = await supabase.from("tests").delete().eq("id", id);

      if (error) {
        console.error("deleteTest error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteTest exception:", err);
      throw err;
    }
  },

  async addQuestions(questions: Question[]) {
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert(questions)
        .select();

      if (error) {
        console.error("addQuestions error:", error);
        throw error;
      }
      return data || [];
    } catch (err) {
      console.error("addQuestions exception:", err);
      throw err;
    }
  },

  async updateQuestion(id: string, updates: Partial<Question>) {
    try {
      const { data, error } = await supabase
        .from("questions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("updateQuestion error:", error);
        throw error;
      }
      return data;
    } catch (err) {
      console.error("updateQuestion exception:", err);
      throw err;
    }
  },

  async deleteQuestion(id: string) {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);

      if (error) {
        console.error("deleteQuestion error:", error);
        throw error;
      }
    } catch (err) {
      console.error("deleteQuestion exception:", err);
      throw err;
    }
  },

  async getTestWithQuestions(testId: string) {
    try {
      const { data: test, error: testError } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (testError) {
        console.error("getTestWithQuestions test error:", testError);
        throw testError;
      }

      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("test_id", testId);

      if (questionsError) {
        console.error("getTestWithQuestions questions error:", questionsError);
        return { ...test, questions: [] };
      }

      return { ...test, questions: questions || [] };
    } catch (err) {
      console.error("getTestWithQuestions exception:", err);
      return null;
    }
  },

  async getAttempts(testId?: string) {
    try {
      let query = supabase
        .from("attempts")
        .select("id, student_id, test_id, score, status, submitted_at")
        .order("submitted_at", { ascending: false });

      if (testId) {
        query = query.eq("test_id", testId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("getAttempts error:", error);
        return [];
      }

      const attempts = (data as AttemptRow[] | null) ?? [];
      const studentIds = Array.from(
        new Set(
          attempts
            .map((attempt) => attempt.student_id)
            .filter((studentId): studentId is string => Boolean(studentId))
        )
      );

      if (studentIds.length === 0) {
        return attempts.map((attempt) => ({
          id: attempt.id,
          student_id: attempt.student_id ?? "",
          student_name: "Unknown Student",
          test_id: attempt.test_id ?? "",
          score: attempt.score ?? 0,
          status: (attempt.status === "completed" || attempt.status === "ongoing" || attempt.status === "failed"
            ? attempt.status
            : "completed") as ResolvedAttempt["status"],
          submitted_at: attempt.submitted_at ?? new Date().toISOString(),
        }));
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, full_name, name, email")
        .in("id", studentIds);

      if (studentsError) {
        console.error("getAttempts students error:", studentsError);
        return attempts.map((attempt) => ({
          id: attempt.id,
          student_id: attempt.student_id ?? "",
          student_name: "Unknown Student",
          test_id: attempt.test_id ?? "",
          score: attempt.score ?? 0,
          status: (attempt.status === "completed" || attempt.status === "ongoing" || attempt.status === "failed"
            ? attempt.status
            : "completed") as ResolvedAttempt["status"],
          submitted_at: attempt.submitted_at ?? new Date().toISOString(),
        }));
      }

      const students = (studentsData as StudentRow[] | null) ?? [];
      const studentById = new Map(students.map((student) => [student.id, student]));

      return attempts.map((attempt) => {
        const student = attempt.student_id ? studentById.get(attempt.student_id) : null;
        const studentName = student?.full_name || student?.name || student?.email || "Unknown Student";

        return {
          id: attempt.id,
          student_id: attempt.student_id ?? "",
          student_name: studentName,
          student_email: student?.email ?? undefined,
          test_id: attempt.test_id ?? "",
          score: attempt.score ?? 0,
          status: (attempt.status === "completed" || attempt.status === "ongoing" || attempt.status === "failed"
            ? attempt.status
            : "completed") as ResolvedAttempt["status"],
          submitted_at: attempt.submitted_at ?? new Date().toISOString(),
        } satisfies ResolvedAttempt;
      });
    } catch (err) {
      console.error("getAttempts exception:", err);
      return [];
    }
  },
};
