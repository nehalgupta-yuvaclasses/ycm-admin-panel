import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Eye,
  LayoutGrid,
  Plus,
  Save,
  Settings2,
  Timer,
  Trophy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import { testService } from "@/services/testService";
import type { Question, Test } from "@/types/test";

function createQuestionDraft(testId: string, suffix = "") {
  return {
    test_id: testId,
    question_text: suffix ? `New Question ${suffix}` : "New Question",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correct_answer: 0,
    marks: 1,
  } satisfies Omit<Question, "id">;
}

export default function TestBuilder() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const testRef = useRef<Test | null>(null);
  const questionsRef = useRef<Question[]>([]);
  const questionTimersRef = useRef<Record<string, number>>({});
  const metaTimerRef = useRef<number | null>(null);

  useEffect(() => {
    testRef.current = test;
  }, [test]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    if (!testId) {
      setLoading(false);
      return;
    }

    let active = true;

    const loadBuilder = async () => {
      try {
        setLoading(true);
        const data = await testService.getTestWithQuestions(testId);

        if (!active || !data) {
          return;
        }

        setTest({
          id: data.id,
          course_id: data.course_id,
          subject_id: data.subject_id,
          title: data.title,
          duration: data.duration,
          total_marks: data.total_marks,
          status: data.status,
          start_time: data.start_time,
          end_time: data.end_time,
          created_at: data.created_at,
        });
        setQuestions(data.questions || []);
        setSelectedQuestionId(data.questions?.[0]?.id ?? null);
      } catch (error) {
        console.error("Failed to load test builder data", error);
        toast.error("Failed to load test builder data");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBuilder();

    return () => {
      active = false;
      Object.values(questionTimersRef.current).forEach((timerId) => window.clearTimeout(timerId));
      questionTimersRef.current = {};
      if (metaTimerRef.current) {
        window.clearTimeout(metaTimerRef.current);
      }
    };
  }, [testId]);

  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
    [questions],
  );
  const filledQuestions = useMemo(
    () => questions.filter((question) => question.question_text.trim().length > 0).length,
    [questions],
  );
  const completion = questions.length > 0 ? Math.round((filledQuestions / questions.length) * 100) : 0;

  const selectedQuestion = questions.find((question) => question.id === selectedQuestionId) ?? null;
  const selectedQuestionIndex = selectedQuestionId
    ? questions.findIndex((question) => question.id === selectedQuestionId)
    : -1;

  const queueMetaSave = () => {
    if (!testId || !testRef.current) {
      return;
    }

    if (metaTimerRef.current) {
      window.clearTimeout(metaTimerRef.current);
    }

    metaTimerRef.current = window.setTimeout(async () => {
      const currentTest = testRef.current;
      if (!currentTest || !currentTest.id) {
        return;
      }

      setIsSyncing(true);
      try {
        await testService.updateTest(currentTest.id, {
          title: currentTest.title,
          status: currentTest.status,
        });
      } catch (error) {
        console.error("Failed to save test meta", error);
      } finally {
        setIsSyncing(false);
      }
    }, 500);
  };

  const queueQuestionSave = (questionId: string) => {
    if (questionTimersRef.current[questionId]) {
      window.clearTimeout(questionTimersRef.current[questionId]);
    }

    questionTimersRef.current[questionId] = window.setTimeout(async () => {
      const currentQuestion = questionsRef.current.find((question) => question.id === questionId);
      if (!currentQuestion || !currentQuestion.id) {
        return;
      }

      setIsSyncing(true);
      try {
        await testService.updateQuestion(currentQuestion.id, {
          question_text: currentQuestion.question_text,
          options: currentQuestion.options,
          correct_answer: currentQuestion.correct_answer,
          marks: currentQuestion.marks,
        });
      } catch (error) {
        console.error("Failed to save question", error);
      } finally {
        setIsSyncing(false);
      }
    }, 450);
  };

  const handleCreateQuestion = async () => {
    if (!testId) {
      return;
    }

    try {
      setIsSyncing(true);
      const created = await testService.addQuestions([createQuestionDraft(testId, String(questions.length + 1))]);
      const question = created[0] as Question | undefined;

      if (!question) {
        throw new Error("Question creation returned no data.");
      }

      setQuestions((currentQuestions) => [...currentQuestions, question]);
      setSelectedQuestionId(question.id ?? null);
      toast.success("Question added");
    } catch (error) {
      console.error("Failed to add question", error);
      toast.error("Failed to add question");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    if (!testId) {
      return;
    }

    try {
      setIsSyncing(true);
      const created = await testService.addQuestions([
        {
          test_id: testId,
          question_text: `${question.question_text} (Copy)`,
          options: [...question.options],
          correct_answer: question.correct_answer,
          marks: question.marks,
        },
      ]);

      const duplicated = created[0] as Question | undefined;
      if (!duplicated) {
        throw new Error("Duplicate question returned no data.");
      }

      setQuestions((currentQuestions) => [...currentQuestions, duplicated]);
      setSelectedQuestionId(duplicated.id ?? null);
      toast.success("Question duplicated");
    } catch (error) {
      console.error("Failed to duplicate question", error);
      toast.error("Failed to duplicate question");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setIsSyncing(true);
      await testService.deleteQuestion(questionId);

      const nextQuestions = questionsRef.current.filter((question) => question.id !== questionId);
      setQuestions(nextQuestions);
      setSelectedQuestionId(nextQuestions[0]?.id ?? null);
      toast.success("Question deleted");
    } catch (error) {
      console.error("Failed to delete question", error);
      toast.error("Failed to delete question");
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSelectedQuestion = (patch: Partial<Question>) => {
    if (!selectedQuestionId) {
      return;
    }

    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === selectedQuestionId ? { ...question, ...patch } : question,
      ),
    );
    queueQuestionSave(selectedQuestionId);
  };

  const updateTestMeta = (patch: Partial<Pick<Test, "title" | "status">>) => {
    setTest((currentTest) => (currentTest ? { ...currentTest, ...patch } : currentTest));
    queueMetaSave();
  };

  const syncNow = async () => {
    if (!testRef.current?.id) {
      return;
    }

    try {
      setIsSyncing(true);
      await testService.updateTest(testRef.current.id, {
        title: testRef.current.title,
        status: testRef.current.status,
      });

      await Promise.all(
        questionsRef.current.map((question) =>
          testService.updateQuestion(question.id, {
            question_text: question.question_text,
            options: question.options,
            correct_answer: question.correct_answer,
            marks: question.marks,
          }),
        ),
      );

      toast.success("Builder synced");
    } catch (error) {
      console.error("Failed to sync test builder", error);
      toast.error("Failed to sync test builder");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="-m-6 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),_transparent_26%),linear-gradient(180deg,_rgba(10,10,10,0.94),_rgba(7,7,7,1))]">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1800px] items-center justify-center px-6 py-10">
          <Card className="w-full max-w-3xl border-border/60 bg-background/80 backdrop-blur-xl">
            <CardHeader className="space-y-4 border-b border-border/60">
              <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-3/4 animate-pulse rounded-2xl bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-full bg-muted/70" />
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/40" />
                ))}
              </div>
              <div className="h-72 animate-pulse rounded-3xl border border-border/60 bg-muted/30" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="-m-6 min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),_transparent_26%),linear-gradient(180deg,_rgba(10,10,10,0.94),_rgba(7,7,7,1))] text-foreground">
      <div className="sticky top-0 z-20 border-b border-border/60 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-5 px-6 py-5 lg:px-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/tests")}
              className="mt-1 rounded-full border border-border/60 bg-background/70 shadow-sm hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em]">
                  Test Builder
                </Badge>
                <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  ID: {testId}
                </Badge>
                <Badge variant="outline" className="rounded-full border-border/70 bg-background/80 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {isSyncing ? "Syncing" : "Auto-save on"}
                </Badge>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">Build a test that feels deliberate.</h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground lg:text-[15px]">
                  Edit the test metadata, manage questions on the left, and keep the active question focused on the right.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Card size="sm" className="min-w-[126px] border-border/60 bg-background/80 backdrop-blur">
              <CardContent className="flex items-center gap-3 px-3 py-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-lg font-semibold leading-none">{questions.length}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Questions</div>
                </div>
              </CardContent>
            </Card>
            <Card size="sm" className="min-w-[126px] border-border/60 bg-background/80 backdrop-blur">
              <CardContent className="flex items-center gap-3 px-3 py-3">
                <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-lg font-semibold leading-none">{totalMarks}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Total Marks</div>
                </div>
              </CardContent>
            </Card>
            <Card size="sm" className="min-w-[126px] border-border/60 bg-background/80 backdrop-blur">
              <CardContent className="flex items-center gap-3 px-3 py-3">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                  <Timer className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-lg font-semibold leading-none">{completion}%</div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Filled</div>
                </div>
              </CardContent>
            </Card>
            <Button onClick={syncNow} disabled={isSyncing} className="gap-2 px-5 shadow-lg shadow-primary/20">
              <Save className="h-4 w-4" />
              {isSyncing ? "Saving..." : "Sync now"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1800px] gap-6 px-6 py-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:px-8">
        <aside className="xl:sticky xl:top-[7.5rem] xl:h-[calc(100vh-9rem)]">
          <Card className="flex h-full flex-col border-border/60 bg-background/82 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="space-y-4 border-b border-border/60 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-base font-semibold tracking-tight">Question Navigator</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Pick a question to edit, duplicate, or remove.</CardDescription>
              </div>
              <Button className="h-10 w-full justify-center gap-2 font-semibold shadow-sm" onClick={handleCreateQuestion}>
                <Plus className="h-4 w-4" /> Add Question
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full xl:h-[calc(100vh-17rem)]">
                <div className="space-y-2 p-3">
                  {questions.map((question, index) => {
                    const isSelected = selectedQuestionId === question.id;

                    return (
                      <motion.button
                        key={question.id}
                        type="button"
                        onClick={() => setSelectedQuestionId(question.id)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        className={cn(
                          "group flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all duration-200",
                          isSelected
                            ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                            : "border-border/60 bg-background/40 hover:border-border hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[11px] font-semibold",
                            isSelected
                              ? "border-primary/30 bg-primary text-primary-foreground"
                              : "border-border/70 bg-background text-muted-foreground",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("line-clamp-2 text-sm font-medium leading-5", isSelected ? "text-foreground" : "text-foreground/90")}>{question.question_text || "Untitled Question"}</p>
                            {isSelected && <Badge className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">Active</Badge>}
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                            <span>{question.options.length} options</span>
                            <span>{question.marks} marks</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", isSelected ? "text-primary-foreground hover:bg-primary-foreground/10" : "text-muted-foreground hover:bg-muted")}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDuplicateQuestion(question);
                            }}
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-8 w-8",
                              isSelected ? "text-primary-foreground hover:bg-primary-foreground/10" : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                            )}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteQuestion(question.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.button>
                    );
                  })}

                  {questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 px-5 py-12 text-center">
                      <div className="mb-4 rounded-2xl border border-border/60 bg-background/80 p-4 text-muted-foreground shadow-sm">
                        <AlertCircle className="h-8 w-8" />
                      </div>
                      <h3 className="text-base font-semibold">No questions yet</h3>
                      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                        Start by creating the first question. The builder will save it right away.
                      </p>
                      <Button className="mt-6 gap-2" onClick={handleCreateQuestion}>
                        <Plus className="h-4 w-4" /> Create First Question
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        <main className="min-w-0">
          <AnimatePresence mode="wait">
            {test ? (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex h-full flex-col"
              >
                <Card className="flex min-h-[calc(100vh-11rem)] flex-1 border-border/60 bg-background/82 shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <CardHeader className="space-y-5 border-b border-border/60 pb-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]">
                            Editing Question {Math.max(selectedQuestionIndex + 1, 1)}
                          </Badge>
                          <Badge variant="outline" className="rounded-full border-border/70 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {selectedQuestion?.options.length ?? 0} options
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-2xl font-bold tracking-tight">Question Editor</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            Draft the prompt, mark the correct answer, and keep the content readable at a glance.
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-muted/25 p-4 lg:min-w-[320px]">
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="test-title" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                              Test Title
                            </Label>
                            <Input
                              id="test-title"
                              value={test.title}
                              onChange={(event) => updateTestMeta({ title: event.target.value })}
                              className="h-10 border-border/60 bg-background text-sm font-medium"
                              placeholder="Enter test title"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="space-y-1 text-right">
                              <Label className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                Publish
                              </Label>
                              <div className="text-xs text-muted-foreground">
                                {test.status === "published" ? "Live" : "Draft"}
                              </div>
                            </div>
                            <Switch
                              checked={test.status === "published"}
                              onCheckedChange={(checked) => updateTestMeta({ status: checked ? "published" : "draft" })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                            <div className="font-semibold text-foreground">{test.duration} min</div>
                            <div className="mt-1">Duration</div>
                          </div>
                          <div className="rounded-2xl border border-border/60 bg-background/70 p-3">
                            <div className="font-semibold text-foreground">{test.total_marks}</div>
                            <div className="mt-1">Total marks</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      <Badge variant="outline" className="rounded-full border-border/70 bg-background/80">
                        <Eye className="mr-1 h-3 w-3" /> Preview aware
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-border/70 bg-background/80">
                        <Trophy className="mr-1 h-3 w-3" /> {totalMarks} live marks
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-border/70 bg-background/80">
                        <LayoutGrid className="mr-1 h-3 w-3" /> {completion}% questions filled
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-8 px-6 py-6 lg:px-8 lg:py-8">
                        {selectedQuestion ? (
                          <>
                            <Card className="border-border/60 bg-muted/15">
                              <CardHeader className="border-b border-border/60 pb-4">
                                <CardTitle className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                  Question Content
                                </CardTitle>
                                <CardDescription>
                                  Write the exact prompt students will see. Keep it sharp and unambiguous.
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-4">
                                <Textarea
                                  placeholder="Enter your question here..."
                                  className="min-h-[220px] resize-none rounded-3xl border-2 border-border/60 bg-background p-6 text-lg leading-8 transition-all focus-visible:border-primary/50 focus-visible:ring-0"
                                  value={selectedQuestion.question_text}
                                  onChange={(event) => updateSelectedQuestion({ question_text: event.target.value })}
                                />
                              </CardContent>
                            </Card>

                            <Card className="border-border/60 bg-muted/15">
                              <CardHeader className="border-b border-border/60 pb-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <CardTitle className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                      Answer Options
                                    </CardTitle>
                                    <CardDescription>
                                      Select the correct option and keep the others plausible.
                                    </CardDescription>
                                  </div>
                                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em]">
                                    One correct answer
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-4">
                                <RadioGroup
                                  value={String(selectedQuestion.correct_answer)}
                                  onValueChange={(value) => updateSelectedQuestion({ correct_answer: Number(value) })}
                                  className="grid gap-4"
                                >
                                  {selectedQuestion.options.map((option, index) => {
                                    const isCorrect = selectedQuestion.correct_answer === index;

                                    return (
                                      <div
                                        key={index}
                                        className={cn(
                                          "group flex items-center gap-4 rounded-3xl border-2 p-4 transition-all duration-200",
                                          isCorrect
                                            ? "border-primary bg-primary/5 shadow-sm shadow-primary/5"
                                            : "border-border/60 bg-background hover:border-border hover:bg-muted/30",
                                        )}
                                      >
                                        <div className="pt-0.5">
                                          <RadioGroupItem value={String(index)} id={`option-${index}`} className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-2">
                                          <Label htmlFor={`option-${index}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                            Option {index + 1}
                                          </Label>
                                          <Input
                                            value={option}
                                            onChange={(event) => {
                                              const nextOptions = [...selectedQuestion.options];
                                              nextOptions[index] = event.target.value;
                                              updateSelectedQuestion({ options: nextOptions });
                                            }}
                                            className={cn(
                                              "h-11 border-0 bg-transparent p-0 text-base font-medium shadow-none focus-visible:ring-0",
                                              isCorrect ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                                            )}
                                            placeholder={`Option ${index + 1}`}
                                          />
                                        </div>
                                        {isCorrect ? (
                                          <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                            Correct
                                          </div>
                                        ) : (
                                          <div className="h-8 w-8 rounded-full border border-dashed border-border/70 bg-muted/20" />
                                        )}
                                      </div>
                                    );
                                  })}
                                </RadioGroup>
                              </CardContent>
                            </Card>
                          </>
                        ) : (
                          <div className="flex min-h-[420px] items-center justify-center">
                            <Card className="w-full max-w-2xl border-border/60 bg-background/85 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
                              <CardContent className="space-y-6 p-10 lg:p-14">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 text-muted-foreground">
                                  <Settings2 className="h-8 w-8" />
                                </div>
                                <div className="space-y-2">
                                  <h3 className="text-2xl font-bold tracking-tight">No Question Selected</h3>
                                  <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground">
                                    Use the navigator to open a question or create a new one to start building the test.
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                  <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/tests") }>
                                    <ChevronLeft className="h-4 w-4" /> Back to Tests
                                  </Button>
                                  <Button className="gap-2" onClick={handleCreateQuestion}>
                                    <Plus className="h-4 w-4" /> Create First Question
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[calc(100vh-11rem)] items-center justify-center">
                <Card className="w-full max-w-2xl border-border/60 bg-background/85 text-center shadow-2xl shadow-black/20 backdrop-blur-xl">
                  <CardContent className="space-y-6 p-10 lg:p-14">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/20 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold tracking-tight">No Question Selected</h3>
                      <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground">
                        Create a question or select one from the navigator to continue editing the test.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button variant="outline" className="gap-2" onClick={() => navigate("/admin/tests") }>
                        <ChevronLeft className="h-4 w-4" /> Back to Tests
                      </Button>
                      <Button className="gap-2" onClick={handleCreateQuestion}>
                        <Plus className="h-4 w-4" /> Create First Question
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
