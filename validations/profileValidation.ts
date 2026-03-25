import { z } from "zod";

// Shared schema components
const socialLinksSchema = {
  instagram: z.string().optional().or(z.literal("")),
  youtube: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  other: z.string().optional().or(z.literal("")),
};

// Onboarding Details Schema
export const getOnboardingDetailsSchema = (isMobileSignup: boolean) => z.object({
  fullName: z.string().min(2, "Full Name is required"),
  email: isMobileSignup ? z.string().email("Invalid email address") : z.string().optional().or(z.literal("")),
  mobile: !isMobileSignup ? z.string().min(10, "Invalid mobile number") : z.string().optional().or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  ...socialLinksSchema
});

// Settings / Edit Profile Schema
export const editProfileSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobile: z.string().min(10, "Invalid mobile number").optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  yearsOfExperience: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  categories: z.array(z.string()).optional(),
  ...socialLinksSchema
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type OnboardingDetailsForm = z.infer<ReturnType<typeof getOnboardingDetailsSchema>>;
export type EditProfileForm = z.infer<typeof editProfileSchema>;
export type ChangePasswordLocalForm = z.infer<typeof changePasswordSchema>;
