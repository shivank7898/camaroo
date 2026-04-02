import { apiRequest } from "./api";
import type { ApiResponse, AuthData, ProfileUpdatePayload, ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm, UpdateAvailabilityPayload } from "@/types/auth";
import type { UpdatePortfolioPayload, UpdatePortfolioStatusPayload } from "@/types/portfolio";

// Re-export types for convenience
export type { ApiResponse, AuthData };

// ==========================================
// AUTHENTICATION MUTATIONS
// ==========================================

export const socialSignInMutation = async (payload: { idToken: string; provider: "google" | "apple" }) => {
  const response = await apiRequest<ApiResponse<AuthData>>({
    url: "/auth/social-sign-in",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const signInMutation = async (payload: { email: string; password: string }) => {
  const response = await apiRequest<ApiResponse<AuthData>>({
    url: "/auth/sign-in",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const signUpEmailMutation = async (payload: { email: string; password: string }) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/auth/sign-up-email",
    method: "POST",
    payload,
  });
  return response;
};

export const signUpMobileMutation = async (payload: { mobile: string }) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/auth/sign-up-mobile",
    method: "POST",
    payload,
  });
  return response;
};

export const verifyOtpMutation = async (payload: { type: "email" | "mobile"; otp: string; email?: string; mobile?: string }) => {
  const response = await apiRequest<ApiResponse<AuthData>>({
    url: "/auth/otp-verify",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const forgotPasswordMutation = async (payload: ForgotPasswordForm) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/auth/forgot-password",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const resetPasswordMutation = async (payload: ResetPasswordForm) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: `/auth/reset-password?token=${payload.token}`,
    method: "PATCH",
    payload: { password: payload.password },
  });
  return response?.data;
};

export const changePasswordMutation = async (payload: ChangePasswordForm) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/auth/change-password",
    method: "POST",
    payload,
  });
  return response?.data;
};

// ==========================================
// PROFILE MUTATIONS
// ==========================================

export const updateProfileMutation = async (payload: ProfileUpdatePayload) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/me",
    method: "PATCH",
    payload,
  });
  return response?.data;
};

export const updateAvailabilityMutation = async (payload: UpdateAvailabilityPayload) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/me/self-occupied",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const getUploadUrlMutation = async (payload: { mediaType: string; fileName: string; contentType: string }) => {
  const response = await apiRequest<ApiResponse<{ uploadUrl: string; fileUrl: string }>>({
    url: "/me/upload-files",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const createPortfolioPostMutation = async (payload: {
  title: string;
  description: string;
  mediaUrls: { name: string; url: string; mediaType: string };
  coverUrls: { name: string; url: string; mediaType: string };
  tags: string[];
  visibility: "public" | "private";
}) => {
  const response = await apiRequest<ApiResponse<any>>({
    url: "/portfolio",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const updatePortfolioMutation = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePortfolioPayload;
}) => {
  const response = await apiRequest<ApiResponse<any>>({
    url: `/portfolio/${id}`,
    method: "PATCH",
    payload,
  });
  return response?.data;
};

export const updatePortfolioStatusMutation = async ({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePortfolioStatusPayload;
}) => {
  const response = await apiRequest<ApiResponse<any>>({
    url: `/portfolio/${id}/status`,
    method: "PATCH",
    payload,
  });
  return response?.data;
};

// ==========================================
// PORTFOLIO ENGAGEMENT MUTATIONS
// ==========================================

export const likePortfolioPostMutation = async (params: { portfolioId: string }) => {
  const response = await apiRequest<ApiResponse<any>>({
    url: `/portfolio-engagement/likes`,
    method: "POST",
    payload: params,
  });
  return response?.data;
};

export const unlikePortfolioPostMutation = async (params: { portfolioId: string }) => {
  const response = await apiRequest<ApiResponse<any>>({
    url: `/portfolio-engagement/likes/portfolio/${params.portfolioId}`,
    method: "DELETE",
    payload: params,
  });
  return response?.data;
};
