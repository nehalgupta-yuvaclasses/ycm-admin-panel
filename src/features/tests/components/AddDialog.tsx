import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDialog } from "@/components/shared/FormDialog";
import { testSchema, TestFormValues } from "../types";
import { courseService, Subject } from "@/services/courseService";
import type { CourseSummary } from "@/components/admin/courses/types";

interface AddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TestFormValues) => Promise<void>;
  isSubmitting: boolean;
  courses: Pick<CourseSummary, "id" | "title">[];
}

export function AddDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  courses,
}: AddDialogProps) {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = React.useState(false);
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: "",
      course_id: "",
      subject_id: "",
      duration: 30,
      total_marks: 100,
      status: "draft",
    },
  });

  const { handleSubmit, reset, control, watch } = form;
  const selectedCourseId = watch("course_id");
  const previousCourseIdRef = React.useRef<string>("");

  React.useEffect(() => {
    if (open) {
      reset();
      setSubjects([]);
      setLoadingSubjects(false);
      previousCourseIdRef.current = "";
    }
  }, [open, reset]);

  React.useEffect(() => {
    if (!selectedCourseId) {
      setSubjects([]);
      return;
    }

    if (previousCourseIdRef.current === selectedCourseId) {
      return;
    }

    previousCourseIdRef.current = selectedCourseId;
    form.setValue("subject_id", "");
    setLoadingSubjects(true);

    void courseService
      .getSubjects(selectedCourseId)
      .then((rows) => setSubjects(rows))
      .catch((error) => {
        console.error("Failed to load subjects", error);
        setSubjects([]);
      })
      .finally(() => setLoadingSubjects(false));
  }, [form, selectedCourseId]);

  const onFormSubmit = async (data: TestFormValues) => {
    await onSubmit(data);
  };

  return (
    <FormDialog
      title="New Assessment"
      description="Define the core parameters for your new test."
      isOpen={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit(onFormSubmit)}
      loading={isSubmitting}
      submitText="Continue to Builder"
    >
      <Form {...form}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Test Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Mid-term React Assessment" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="course_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("subject_id", "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id!}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="subject_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedCourseId || loadingSubjects}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCourseId ? (loadingSubjects ? "Loading subjects..." : "Select subject") : "Select a course first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (min)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="30" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="total_marks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Marks</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormDialog>
  );
}
