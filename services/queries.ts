import { apiRequest } from "./api";
import type { ApiResponse } from "@/types/auth";
import type { PaginatedPortfolioResponse } from "@/types/portfolio";
import type {
  PaginatedOpportunityResponse,
  PaginatedApplicationResponse,
  OpportunityFilters,
  ApplicationFilters,
  Opportunity,
} from "@/types/opportunity";
import { buildQueryString } from "@/utils/queryString";

export type GetCalendarParams = {
  userId?: string;
  isOwner?: boolean;
  month: number;
  year: number;
};

export type PortfolioFilters = {
  isOwner?: boolean;
  userId?: string;
} & Record<string, any>;

// ==========================================
// USER / PROFILE QUERIES
// ==========================================

export const fetchMe = async () => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/me",
    method: "GET",
  });
  console.log("fetchMe", response?.data)
  return response?.data;
};

export const getUserByIdQuery = async (id: string) => {
  const response = await apiRequest<ApiResponse<any>>({
    url: `/user/${id}`,
    method: "GET",
  });
  return response?.data;
};

export const searchUsersQuery = async (search: string = "") => {
  const qs = search ? `?startIndex=1&itemsPerPage=100&search=${encodeURIComponent(search)}` : "?startIndex=1&itemsPerPage=100";
  const response = await apiRequest<any>({
    url: `/user${qs}`,
    method: "GET",
  });
  return response;
};


export const getUserPortfolioQuery = async (filters?: PortfolioFilters) => {
  const qs = buildQueryString(filters);
  const response = await apiRequest<PaginatedPortfolioResponse>({
    url: `/portfolio/get-user-portfolio${qs}`,
    method: "GET"
  });
  return response || null;
};

export const getPortfolioByIdQuery = async (id: string) => {
  const response = await apiRequest<{ data: any }>({
    url: `/portfolio/get-portfolio/${id}`,
    method: "GET"
  });
  const data = response?.data;
  // Normalize snake_case → camelCase for consistent field naming
  if (data && data.liked_by_me !== undefined) {
    data.likedByMe = data.liked_by_me;
    delete data.liked_by_me;
  }
  return data;
};

export const getCalendarQuery = async (params: GetCalendarParams) => {
  const isOwnerStr = params.isOwner ? `isOwner=true&` : "";
  const userIdStr = params.userId ? `userId=${params.userId}&` : "";
  const response = await apiRequest<ApiResponse<any>>({
    url: `/me/calendar?${isOwnerStr}${userIdStr}month=${params.month}&year=${params.year}`,
    method: "GET",
  });
  return response?.data;
};

// ==========================================
// SYSTEM QUERIES
// ==========================================

export const fetchCountries = async () => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/auth/get-countries",
    method: "GET",
  });
  return response?.data;
};

// ==========================================
// OPPORTUNITY QUERIES
// ==========================================

export const getOpportunitiesQuery = async (filters?: OpportunityFilters) => {
  const qs = buildQueryString(filters as Record<string, any>);
  const response = await apiRequest<PaginatedOpportunityResponse>({
    url: `/opportunity${qs}`,
    method: "GET",
  });
  return response;
};

export const getOpportunityByIdQuery = async (id: string) => {
  const response = await apiRequest<ApiResponse<Opportunity>>({
    url: `/opportunity/${id}`,
    method: "GET",
  });
  return response?.data;
};

// ==========================================
// APPLICATION QUERIES
// ==========================================

export const getMyApplicationsQuery = async (filters?: ApplicationFilters) => {
  const qs = buildQueryString(filters as Record<string, any>);
  const response = await apiRequest<PaginatedApplicationResponse>({
    url: `/application/my${qs}`,
    method: "GET",
  });
  return response;
};

export const getOpportunityApplicationsQuery = async (
  opportunityId: string,
  filters?: ApplicationFilters
) => {
  const qs = buildQueryString(filters as Record<string, any>);
  const response = await apiRequest<PaginatedApplicationResponse>({
    url: `/application/opportunity/${opportunityId}${qs}`,
    method: "GET",
  });
  return response;
};

// ==========================================
// CHAT QUERIES
// ==========================================

export const getChatConversationsQuery = async () => {
  const response = await apiRequest<any>({
    url: "/socket-chat/conversations",
    method: "GET",
  });
  return response?.data || response;
};

export const getChatMessagesQuery = async (conversationId: string, cursor?: string) => {
  const qs = cursor ? `?cursor=${cursor}&limit=20` : "?limit=20";
  const response = await apiRequest<any>({
    url: `/socket-chat/conversations/${conversationId}/messages${qs}`,
    method: "GET",
  });
  return response?.data || response;
};
