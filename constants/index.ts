/**
 * constants/index.ts
 * Re-exports all constants for convenient single-import access.
 *
 * Usage:
 *   import { MOCK_USER, MY_PROFILE, MOCK_FEED, CREATOR_ROLES, SETTINGS_MENU } from "@constants";
 */

export * from "./mockUsers";
export * from "./mockFeed";

export const CREATOR_ROLES = [
  "Photographer",
  "Cinematographer",
  "Videographer",
  "Editor",
  "Drone Pilot",
  "Audio Engineer"
];

export const SETTINGS_MENU = [
  {
    id: "account",
    iconName: "user",
    title: "Account Details",
    subtitle: "Update your public profile and bio",
    route: "/settings/edit",
  },
  {
    id: "availability",
    iconName: "calendar",
    title: "Availability",
    subtitle: "Manage your 7-day schedule",
    route: "/settings/availability",
  },
  {
    id: "security",
    iconName: "shield",
    title: "Security",
    subtitle: "Change your password",
    route: "/settings/security",
  },
];
