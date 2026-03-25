import { apiRequest } from "./api";
import type { ApiResponse } from "@/types/auth";

export interface GetCalendarParams {
  userId: string;
  month: number;
  year: number;
}

// ==========================================
// USER / PROFILE QUERIES
// ==========================================

export const fetchMe = async () => {
  const response = await apiRequest<ApiResponse<unknown>>({
    url: "/me",
    method: "GET",
  });
  return response?.data;
};

export const getCalendarQuery = async (params: GetCalendarParams) => {
  const response = await apiRequest<ApiResponse<any>>({
    url: `/me/calendar?userId=${params.userId}&month=${params.month}&year=${params.year}`,
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
