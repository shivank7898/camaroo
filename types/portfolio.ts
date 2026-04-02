import type { UserProfile } from "./auth";

export interface MediaUrl {
  name?: string;
  url?: string;
  mediaType?: "image" | "video" | "photo";
}

export interface PortfolioPost {
  _id: string;
  userData?: Partial<UserProfile>; // Nested user details
  title: string;
  description?: string;
  mediaUrls?: MediaUrl;
  coverUrls?: MediaUrl;
  tags?: string[];
  visibility?: "public" | "private";
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedPortfolioResponse {
  isSuccess: boolean;
  message: string;
  statusCode: number;
  totalItems: number;
  startIndex: number;
  itemsPerPage: number;
  totalPage: number;
  data: PortfolioPost[];
}

export interface UpdatePortfolioPayload {
  title?: string;
  description?: string;
  mediaUrls?: MediaUrl;
  coverUrls?: MediaUrl;
  tags?: string[];
  visibility?: "public" | "private";
}

export interface UpdatePortfolioStatusPayload {
  isActive: boolean;
}
