import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Check, ImagePlus, Loader2, Plus, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { instructorFormSchema, type InstructorFormValues } from '../types';

interface InstructorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (values: InstructorFormValues, profileImageFile: File | null) => Promise<void>;
  isSubmitting: boolean;
  initialValues?: Partial<InstructorFormValues>;
}

const defaultValues: InstructorFormValues = {
  full_name: '',
  email: '',
  phone: '',
  bio: '',
  profile_image: '',
  expertise: [],
  experience_years: 0,
  is_active: true,
};

function normalizeExpertise(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

export function InstructorFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
  isSubmitting,
  initialValues,
}: InstructorFormDialogProps) {
  const [profileImageFile, setProfileImageFile] = React.useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = React.useState('');
  const [expertiseInput, setExpertiseInput] = React.useState('');
  const profileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorFormSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = form;
  const expertise = watch('expertise');
  const fullName = watch('full_name');

  React.useEffect(() => {
    if (!open) return;

    const nextValues = {
      ...defaultValues,
      ...initialValues,
      expertise: normalizeExpertise(initialValues?.expertise || []),
    };

    reset(nextValues);
    setProfileImageFile(null);
    setProfileImagePreview(nextValues.profile_image || '');
    setExpertiseInput('');
  }, [open, initialValues, reset]);

  const handleProfileImage = (file?: File | null) => {
    if (!file) return;

    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const addExpertise = () => {
    const nextItems = expertiseInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (!nextItems.length) return;

    setValue('expertise', normalizeExpertise([...(expertise || []), ...nextItems]), { shouldDirty: true });
    setExpertiseInput('');
  };

  const submit = async (values: InstructorFormValues) => {
    await onSubmit(values, profileImageFile);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent showCloseButton={false} className="h-[min(92vh,900px)] w-[min(96vw,840px)] !max-w-[min(96vw,840px)] overflow-hidden rounded-xl border-border/60 bg-popover p-0 shadow-sm">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1.5">
              <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {fullName ? `Editing ${fullName}` : 'Instructor profile'}
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(submit as any)} className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Dr. Anika Sharma" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="teacher@example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+91 98765 43210" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/60 bg-background text-muted-foreground transition-colors hover:border-border hover:bg-muted/30"
                      >
                        <Avatar className="h-full w-full rounded-none" size="lg">
                          <AvatarImage src={profileImagePreview || undefined} alt={fullName || 'Instructor'} />
                          <AvatarFallback className="rounded-none text-sm">
                            {fullName
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase())
                              .join('') || 'IN'}
                          </AvatarFallback>
                        </Avatar>
                      </button>

                      <div className="min-w-0 space-y-2">
                        <Input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleProfileImage(event.target.files?.[0] || null)} />
                        <FormField
                          control={control}
                          name="profile_image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Or paste image URL" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <p className="text-sm text-muted-foreground">Use a square image for clean avatar rendering across admin and course surfaces.</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 grid gap-2">
                    <label className="text-[13px] font-semibold tracking-wide text-foreground/80">Bio</label>
                    <FormField
                      control={control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea {...field} className="min-h-32" placeholder="Short professional bio, teaching focus, or background." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2 grid gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <label className="text-[13px] font-semibold tracking-wide text-foreground/80">Expertise</label>
                        <p className="text-sm text-muted-foreground">Add one or more topics separated by commas.</p>
                      </div>
                      <Badge variant="outline" className="rounded-md border-border/60 px-2 py-0.5 text-xs">
                        {expertise.length} tags
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        value={expertiseInput}
                        onChange={(event) => setExpertiseInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ',') {
                            event.preventDefault();
                            addExpertise();
                          }
                        }}
                        placeholder="React, UI Architecture, Supabase"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={addExpertise}>
                        <Plus className="h-4 w-4" /> Add tag
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expertise.length ? (
                        expertise.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-2 rounded-md px-3 py-1 text-sm">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setValue('expertise', expertise.filter((item) => item !== tag), { shouldDirty: true })}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No expertise tags yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={control}
                      name="experience_years"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience (years)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" step="1" placeholder="5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="rounded-xl border border-border/60 bg-muted/20 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 space-y-1">
                              <FormLabel>Status</FormLabel>
                              <p className="max-w-[22rem] text-sm text-muted-foreground">Active instructors appear in course assignment dropdowns.</p>
                            </div>
                            <FormControl>
                              <div className="pt-0.5">
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </div>
                            </FormControl>
                          </div>
                          <div className="mt-3 text-sm text-muted-foreground">{field.value ? 'Active' : 'Inactive'}</div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
              <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2 rounded-lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
