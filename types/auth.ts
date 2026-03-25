/**
 * types/auth.ts
 * Type definitions for all authentication-related data.
 */

// ==========================================
// FORM TYPES
// ==========================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface PhoneInputProps {
  control: import("react-hook-form").Control<{ mobile: string }>;
  disabled?: boolean;
}

export interface EmailSignupForm {
  email: string;
  password: string;
}

export interface PhoneSignupForm {
  mobile: string;
}

export interface OtpForm {
  otp: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
}

export interface OptionalForm {
  experience: string;
}

export interface UpdateAvailabilityPayload {
  date: string;
  message: string;
}

export interface MeResponse {
  user: UserProfile;
  subscription: Subscription | null;
}

// ==========================================
// API TYPES
// ==========================================

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface AuthData {
  authToken: string;
  signUpType?: string;
  user: {
    id?: string;
    _id?: string;
    fullName?: string;
    email?: string;
    mobile?: string;
    role?: string[];
    profilePicture?: string;
    isProfileCompleted?: boolean;
    [key: string]: unknown;
  };
}

// ==========================================
// USER / PROFILE TYPES
// ==========================================

export interface SocialMediaLinks {
  instagram?: string;
  youtube?: string;
  website?: string;
  other?: string;
}

export interface Subscription {
  _id: string;
  status: string;
  isFree: boolean;
  subscriptionId?: {
    name: string;
    slug: string;
    duration: string;
    price: number;
    features: unknown[];
  };
  usage?: unknown[];
}

export interface UserProfile {
  _id: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  role?: string[];
  profilePicture?: string;
  address?: string;
  state?: string;
  city?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  category?: string;
  specialization?: string;
  yearsOfExperience?: number;
  socialMediaLinks?: SocialMediaLinks;
  isProfileCompleted?: boolean;
  isEmailVerified?: boolean;
  signUpType?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// ==========================================
// ONBOARDING TYPES
// ==========================================

export interface OnboardingData {
  fullName?: string;
  email?: string;
  mobile?: string;
  role?: string[];
  address?: string;
  state?: string;
  city?: string;
  profilePicture?: string;
  socialMediaLinks?: SocialMediaLinks;
}

// ==========================================
// PROFILE UPDATE PAYLOAD
// ==========================================

export interface ProfileUpdatePayload {
  fullName?: string;
  email?: string;
  mobile?: string;
  role?: string[];
  category?: string;
  signUpType?: string;
  address?: string;
  state?: string;
  city?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
  socialMediaLinks?: SocialMediaLinks;
  yearsOfExperience?: number;
  specialization?: string;
  profilePicture?: string;
}

// ==========================================
// LOCATION API TYPES
// ==========================================

export interface LocationItem {
  name: string;
  isoCode: string;
}

export interface CountryListResponse {
  countryList: LocationItem[];
}

export interface StateListResponse {
  stateList: LocationItem[];
}

export interface CityItem {
  name: string;
}

export interface CityListResponse {
  cityList: CityItem[];
}

export interface PickerOption {
  label: string;
  value: string;
}

// ==========================================
// API ERROR TYPE
// ==========================================

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}
