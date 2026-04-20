import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createInstructor, deleteInstructor, getInstructorOptions, getInstructors, updateInstructor } from '../api';
import type { InstructorFormValues } from '../types';

export const instructorKeys = {
  all: ['instructors'] as const,
  options: ['instructors', 'options'] as const,
};

export function useInstructors() {
  return useQuery({
    queryKey: instructorKeys.all,
    queryFn: getInstructors,
  });
}

export function useInstructorOptions() {
  return useQuery({
    queryKey: instructorKeys.options,
    queryFn: getInstructorOptions,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: InstructorFormValues) => createInstructor(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: instructorKeys.all });
      await queryClient.invalidateQueries({ queryKey: instructorKeys.options });
    },
  });
}

export function useUpdateInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: InstructorFormValues }) => updateInstructor(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: instructorKeys.all });
      await queryClient.invalidateQueries({ queryKey: instructorKeys.options });
    },
  });
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInstructor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: instructorKeys.all });
      await queryClient.invalidateQueries({ queryKey: instructorKeys.options });
    },
  });
}
