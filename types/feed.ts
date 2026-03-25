/**
 * types/feed.ts
 * Type definitions for all Home feed post types.
 * Replace `any[]` in screens with `FeedItem[]`.
 */

export interface PortfolioPost {
  id: string;
  type: "portfolio";
  name: string;
  time: string;
  location: string;
  avatar: string;
  images: string[];
  tag: string;
  description: string;
}

export interface OpportunityPost {
  id: string;
  type: "opportunity";
  name: string;
  time: string;
  location: string;
  avatar: string;
  title: string;
  budget: string;
  description: string;
  category: string;
  shootType: string;
  date: string;
  duration: string;
}

export interface MarketplacePost {
  id: string;
  type: "marketplace";
  name: string;
  time: string;
  location: string;
  avatar: string;
  title: string;
  price: string;
  images: string[];
}

/** FeedItem — discriminated union of all feed post types */
export type FeedItem = PortfolioPost | OpportunityPost | MarketplacePost;
