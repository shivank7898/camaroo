import { apiRequest } from "./api";
import type { ApiResponse, AuthData, ProfileUpdatePayload, ForgotPasswordForm, ResetPasswordForm, ChangePasswordForm, UpdateAvailabilityPayload } from "@/types/auth";
import type { UpdatePortfolioPayload, UpdatePortfolioStatusPayload } from "@/types/portfolio";
import type {
  CreateOpportunityPayload,
  ApplyToOpportunityPayload,
  ReviewApplicationPayload,
  Opportunity,
  OpportunityApplication,
} from "@/types/opportunity";

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
  const response = await apiRequest<ApiResponse<unknown>>({
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
  const response = await apiRequest<ApiResponse<unknown>>({
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
  const response = await apiRequest<ApiResponse<unknown>>({
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
  const response = await apiRequest<ApiResponse<unknown>>({
    url: `/portfolio-engagement/likes`,
    method: "POST",
    payload: params,
  });
  return response?.data;
};

export const unlikePortfolioPostMutation = async (params: { portfolioId: string }) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: `/portfolio-engagement/likes/portfolio/${params.portfolioId}`,
    method: "DELETE",
    payload: params,
  });
  return response?.data;
};

export const subscribeUserMutation = async (payload: { userId: string }) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: `/portfolio-engagement/subscribe`,
    method: "POST",
    payload,
  });
  return response?.data;
};

export const unsubscribeUserMutation = async (userId: string) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: `/portfolio-engagement/unsubscribe/${userId}`,
    method: "DELETE",
  });
  return response?.data;
};

// ==========================================
// OPPORTUNITY MUTATIONS
// ==========================================

export const createOpportunityMutation = async (payload: CreateOpportunityPayload) => {
  const response = await apiRequest<ApiResponse<Opportunity>>({
    url: "/opportunity",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const cancelOpportunityMutation = async (id: string) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: `/opportunity/${id}/cancel`,
    method: "PATCH",
  });
  return response?.data;
};

// ==========================================
// APPLICATION MUTATIONS
// ==========================================

export const applyToOpportunityMutation = async (payload: ApplyToOpportunityPayload) => {
  const response = await apiRequest<ApiResponse<OpportunityApplication>>({
    url: "/application",
    method: "POST",
    payload,
  });
  return response?.data;
};

export const cancelApplicationMutation = async (id: string) => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: `/application/${id}/cancel`,
    method: "PATCH",
  });
  return response?.data;
};

export const reviewApplicationMutation = async ({
  id,
  payload,
}: {
  id: string;
  payload: ReviewApplicationPayload;
}) => {
  const response = await apiRequest<ApiResponse<OpportunityApplication>>({
    url: `/application/${id}/review`,
    method: "PATCH",
    payload,
  });
  return response?.data;
};

// ==========================================
// CHAT MUTATIONS
// ==========================================

export const createConversationMutation = async (participantId: string) => {
  const response = await apiRequest<any>({
    url: "/socket-chat/conversations",
    method: "POST",
    payload: { participantId },
  });
  return response?.data || response;
};
