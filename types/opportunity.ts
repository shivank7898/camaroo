/**
 * types/opportunity.ts
 * Type definitions for Opportunity & Application modules.
 */

import type { UserProfile } from "./auth";

// ==========================================
// OPPORTUNITY TYPES
// ==========================================

export type OpportunityStatus = "open" | "closed" | "cancelled";

export interface MediaReference {
  name: string;
  url: string;
  mediaType: "photo" | "video";
}

export interface Opportunity {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  createdBy: string | {
    _id: string;
    fullName: string;
    profilePicture?: string;
    role?: string[];
  };
  userId?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    role?: string[];
  };
  userData?: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    role?: string[];
  };
  status: OpportunityStatus;
  createdAt: string;
  updatedAt: string;
  reference?: MediaReference[];
  shootType?: string;
  category?: string;
}

// ==========================================
// APPLICATION TYPES
// ==========================================

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface OpportunityApplication {
  _id: string;
  opportunityId: string | Opportunity;
  applicantId?: string | Partial<UserProfile>;
  userId?: Partial<UserProfile>;
  message: string;
  status: ApplicationStatus;
  reason?: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PAYLOADS
// ==========================================

export interface CreateOpportunityPayload {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status?: OpportunityStatus;
}

export interface ApplyToOpportunityPayload {
  opportunityId: string;
  message?: string;
}

export interface ReviewApplicationPayload {
  status: "accepted" | "rejected";
  reason?: string;
}

// ==========================================
// QUERY FILTER TYPES
// ==========================================

export interface OpportunityFilters {
  isOwner?: boolean;
  userId?: string;
  startIndex?: number;
  itemsPerPage?: number;
  search?: string;
  status?: OpportunityStatus;
  location?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortValue?: number;
}

export interface ApplicationFilters {
  startIndex?: number;
  itemsPerPage?: number;
  search?: string;
  status?: ApplicationStatus;
  sortBy?: string;
  sortValue?: number;
}

// ==========================================
// PAGINATED RESPONSES
// ==========================================

export interface PaginatedOpportunityResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  totalItems: number;
  startIndex: number;
  itemsPerPage: number;
  totalPage: number;
  data: Opportunity[];
}

export interface PaginatedApplicationResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  totalItems: number;
  startIndex: number;
  itemsPerPage: number;
  totalPage: number;
  data: OpportunityApplication[];
}
