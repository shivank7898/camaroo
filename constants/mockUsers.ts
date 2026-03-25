/**
 * constants/mockUsers.ts
 * Demo user data for UI development.
 * Replace with real API data when backend is connected.
 */

import type { User } from "@services/queries/userQueries";

/** Demo profile for the User Detail screen (another creator) */
export const MOCK_USER: User & {
  contactEmail: string;
  contactPhone: string;
  socialLinks: { instagram: string; youtube: string; website: string };
  availability: Array<{ day: string; date: string; status: "free" | "booked" }>;
  portfolio: string[];
} = {
  id: "1",
  name: "Aria Laurent",
  category: ["Photographer", "Cinematographer"],
  bio: "Creative visual storyteller based in Los Angeles. Specializing in portrait & fashion photography with 8+ years of experience. Available for worldwide projects.",
  location: "Los Angeles, CA",
  profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  contactEmail: "aria@example.com",
  contactPhone: "+1 (555) 123-4567",
  socialLinks: {
    instagram: "https://instagram.com/arialaurent",
    youtube: "https://youtube.com/@arialaurent",
    website: "https://arialaurent.com",
  },
  availability: [
    { day: "Mon", date: "17", status: "booked" },
    { day: "Tue", date: "18", status: "free" },
    { day: "Wed", date: "19", status: "free" },
    { day: "Thu", date: "20", status: "booked" },
    { day: "Fri", date: "21", status: "free" },
    { day: "Sat", date: "22", status: "booked" },
    { day: "Sun", date: "23", status: "free" },
  ],
  portfolio: [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1516280440502-61b6062f6b8b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  ],
};

/** Demo data for the own Profile screen */
export const MY_PROFILE = {
  name: "Alex Rivera",
  category: ["Videographer", "Editor"],
  bio: "Crafting visual stories one frame at a time. Based in Mumbai, shooting globally. 5+ years in commercial & documentary work.",
  location: "Mumbai, India",
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  contactEmail: "alex@example.com",
  contactPhone: "+91 98765 43210",
  socialLinks: {
    instagram: "https://instagram.com/alexrivera",
    youtube: "https://youtube.com/@alexrivera",
    website: "https://alexrivera.com",
  },
  availability: [
    { day: "Mon", date: "18", status: "booked" as const },
    { day: "Tue", date: "19", status: "free" as const },
    { day: "Wed", date: "20", status: "free" as const },
    { day: "Thu", date: "21", status: "free" as const },
    { day: "Fri", date: "22", status: "booked" as const },
    { day: "Sat", date: "23", status: "free" as const },
    { day: "Sun", date: "24", status: "booked" as const },
  ],
  availabilityDates: [
    {
        date: "2026-03-28T18:30:00.000Z",
        status: "occupied",
        opportunities: [],
        message: "personal work"
    },
    {
        date: "2026-04-19T18:30:00.000Z",
        status: "occupied",
        message: "personal work",
        opportunities: [
            {
                _id: "69b397a66fe5646398d22921",
                title: "opportunity title 1",
                location: "Surat",
                status: "open",
            }
        ]
    }
  ],
  portfolio: [
    { uri: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop", isPublic: true },
    { uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", isPublic: true },
    { uri: "https://images.unsplash.com/photo-1516280440502-61b6062f6b8b?w=400&h=400&fit=crop", isPublic: false },
    { uri: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=400&fit=crop", isPublic: true },
    { uri: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop", isPublic: true },
    { uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", isPublic: true },
    { uri: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop", isPublic: false },
    { uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", isPublic: true },
  ],
};
