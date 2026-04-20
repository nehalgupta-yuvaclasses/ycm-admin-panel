import { z } from 'zod';

export const messageStatuses = ['new', 'read', 'replied'] as const;
export type MessageStatus = (typeof messageStatuses)[number];

export const subscriberStatuses = ['active', 'unsubscribed'] as const;
export type SubscriberStatus = (typeof subscriberStatuses)[number];

export const contactMessageSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(160),
  email: z.string().trim().email(),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  created_at: z.string(),
  status: z.enum(messageStatuses),
});

export type ContactMessage = z.infer<typeof contactMessageSchema>;

export const contactMessageCreateSchema = contactMessageSchema.pick({
  full_name: true,
  email: true,
  subject: true,
  message: true,
}).extend({
  status: z.enum(messageStatuses).default('new'),
});

export type ContactMessageInput = z.infer<typeof contactMessageCreateSchema>;

export const subscriberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().trim().email(),
  created_at: z.string(),
  status: z.enum(subscriberStatuses),
});

export type Subscriber = z.infer<typeof subscriberSchema>;

export const subscriberCreateSchema = subscriberSchema.pick({
  email: true,
}).extend({
  status: z.enum(subscriberStatuses).default('active'),
});

export type SubscriberInput = z.infer<typeof subscriberCreateSchema>;
