import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Facebook,
  Globe2,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  MapPinned,
  Phone,
  Send,
  TimerReset,
  Youtube,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DEFAULT_SOCIALS, type SocialsData } from './socials.service';

const indianPhonePattern = /^\+91[6-9]\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const optionalUrl = z.string().trim().refine((value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}, 'Enter a valid URL');

const socialsSchema = z.object({
  phone: z.string().trim().refine((value) => !value || indianPhonePattern.test(value), 'Use +91XXXXXXXXXX format'),
  email: z.string().trim().refine((value) => !value || emailPattern.test(value), 'Enter a valid email address'),
  whatsapp: optionalUrl,
  telegram: optionalUrl,
  instagram: optionalUrl,
  facebook: optionalUrl,
  twitter: optionalUrl,
  youtube: optionalUrl,
  linkedin: optionalUrl,
  address: z.string().trim(),
  support_hours: z.string().trim(),
});

type SocialsFormValues = z.infer<typeof socialsSchema>;

const fieldGroups = [
  { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', icon: Phone, type: 'input' as const },
  { name: 'email', label: 'Email', placeholder: 'support@yuvaclasses.com', icon: Mail, type: 'input' as const },
  { name: 'whatsapp', label: 'WhatsApp Link', placeholder: 'https://wa.me/919876543210', icon: MessageCircle, type: 'input' as const },
  { name: 'telegram', label: 'Telegram Link', placeholder: 'https://t.me/yuvaclasses', icon: Send, type: 'input' as const },
  { name: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yuvaclasses', icon: Instagram, type: 'input' as const },
  { name: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yuvaclasses', icon: Facebook, type: 'input' as const },
  { name: 'twitter', label: 'Twitter URL', placeholder: 'https://x.com/yuvaclasses', icon: X, type: 'input' as const },
  { name: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@yuvaclasses', icon: Youtube, type: 'input' as const },
  { name: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/yuvaclasses', icon: Linkedin, type: 'input' as const },
  { name: 'address', label: 'Address', placeholder: '123 Education Hub, Mukherjee Nagar, New Delhi', icon: MapPinned, type: 'textarea' as const },
  { name: 'support_hours', label: 'Support Hours', placeholder: 'Mon-Sat, 9:00 AM - 7:00 PM', icon: TimerReset, type: 'input' as const },
] as const;

interface SocialsFormProps {
  socials: SocialsData;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  onSubmit: (values: SocialsFormValues) => Promise<void>;
}

const emptyValues: SocialsFormValues = {
  phone: '',
  email: '',
  whatsapp: '',
  telegram: '',
  instagram: '',
  facebook: '',
  twitter: '',
  youtube: '',
  linkedin: '',
  address: '',
  support_hours: '',
};

export function SocialsForm({ socials, isLoading, isSaving, lastSaved, onSubmit }: SocialsFormProps) {
  const form = useForm<SocialsFormValues>({
    resolver: zodResolver(socialsSchema),
    defaultValues: emptyValues,
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    reset({
      phone: socials.phone ?? '',
      email: socials.email ?? '',
      whatsapp: socials.whatsapp ?? '',
      telegram: socials.telegram ?? '',
      instagram: socials.instagram ?? '',
      facebook: socials.facebook ?? '',
      twitter: socials.twitter ?? '',
      youtube: socials.youtube ?? '',
      linkedin: socials.linkedin ?? '',
      address: socials.address ?? '',
      support_hours: socials.support_hours ?? '',
    });
  }, [reset, socials]);

  if (isLoading && !socials.updated_at) {
    return (
      <Card className="border-border/60">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={cn('h-24 animate-pulse rounded-2xl border border-border/60 bg-muted/20', index === 8 && 'sm:col-span-2')} />
            ))}
          </div>
          <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-muted/20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
            {fieldGroups.map((field) => (
              <FormField
                key={field.name}
                control={control}
                name={field.name}
                render={({ field: fieldProps }) => (
                  <FormItem className={field.name === 'address' ? 'sm:col-span-2' : ''}>
                    <FormLabel className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border/60">
                        <field.icon className="h-4 w-4" />
                      </span>
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      {field.type === 'textarea' ? (
                        <Textarea
                          {...fieldProps}
                          rows={5}
                          placeholder={field.placeholder}
                          className="min-h-28 resize-none"
                        />
                      ) : (
                        <Input {...fieldProps} placeholder={field.placeholder} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>

          <div className="sticky bottom-0 border-t border-border/60 bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Updates here flow into the website, Flutter app, and future clients.</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {lastSaved ? `Last saved ${new Date(lastSaved).toLocaleString()}` : 'Not saved yet'}
                </p>
              </div>
              <Button type="submit" className="gap-2 self-start md:self-auto" disabled={isSaving}>
                <Globe2 className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Socials'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
}

export type { SocialsFormValues };
export { DEFAULT_SOCIALS };