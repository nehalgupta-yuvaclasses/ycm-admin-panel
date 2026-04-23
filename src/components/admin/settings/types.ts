import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const platformSchema = z.object({
  platformName: z.string().trim().min(2, "Platform name is required"),
  contactEmail: z.string().trim().email("Enter a valid contact email"),
  supportPhone: z.string().trim().min(6, "Support phone is required"),
  defaultLanguage: z.string().trim().min(2, "Select a default language"),
  maintenanceMode: z.boolean().default(false),
});

export type PlatformFormValues = z.infer<typeof platformSchema>;

export const paymentSchema = z.object({
  provider: z.literal("razorpay"),
  apiKey: z.string().trim().min(1, "API key is required"),
  currency: z.literal("INR"),
  gstRate: z.coerce.number().min(0, "GST cannot be negative").max(100, "GST cannot exceed 100"),
  enablePayments: z.boolean().default(true),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export type SettingsSession = {
  id: string;
  title: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type SettingsActivityLog = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};