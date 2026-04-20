import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const platformSchema = z.object({
  platform_name: z.string().trim().min(2, "Platform name is required"),
  support_email: z.string().email("Invalid email address"),
});

export type PlatformFormValues = z.infer<typeof platformSchema>;

export const paymentConfigSchema = z.object({
  razorpay_key_id: z.string().trim().min(1, "Key ID is required"),
  razorpay_key_secret: z.string().trim().min(1, "Key Secret is required"),
});

export type PaymentConfigFormValues = z.infer<typeof paymentConfigSchema>;

export const passwordSchema = z.object({
  current: z.string().min(1, "Current password is required"),
  new: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number"),
  confirm: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.new === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;
