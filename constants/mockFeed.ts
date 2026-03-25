/**
 * constants/mockFeed.ts
 * Demo feed and discovery data for UI development.
 * Replace with real API data (getFeed, getDiscoveryProfiles) when backend is connected.
 */

import type { FeedItem } from "@app-types/feed";
import type { DiscoveryProfile } from "@services/queries/feedQueries";

/** Discovery strip — horizontally scrollable creator cards */
export const MOCK_DISCOVERY_PROFILES: DiscoveryProfile[] = [
  { id: 1, name: "Aria Laurent",  role: "Portrait",     location: "Los Angeles", isAvailable: true,  image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop" },
  { id: 2, name: "Kenji Mori",    role: "Street",       location: "Tokyo",       isAvailable: false, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop" },
  { id: 3, name: "Sofia Reyes",   role: "Nature",       location: "Costa Rica",  isAvailable: true,  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop" },
  { id: 4, name: "Marcus",        role: "Architecture", location: "New York",    isAvailable: true,  image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop" },
];

/** Feed timeline — portfolio posts, opportunities, marketplace items */
export const MOCK_FEED: FeedItem[] = [
  {
    id: "p1",
    type: "portfolio",
    name: "Jenny Wilson",
    time: "3 mins ago",
    location: "California",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&fit=crop",
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&fit=crop",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800&fit=crop",
    ],
    tag: "Brother",
    description: "Simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
  },
  {
    id: "o1",
    type: "opportunity",
    name: "Alpha Studios",
    time: "2 hrs ago",
    location: "Remote",
    avatar: "https://images.unsplash.com/photo-1516280440502-61b6062f6b8b?w=200&h=200&fit=crop",
    title: "Need a product photographer for a new sneaker run",
    budget: "$500 - $1,200",
    description: "Looking for an experienced studio photographer available this weekend to shoot our upcoming catalog.",
    category: "Product",
    shootType: "Commercial",
    date: "Nov 12 - 14",
    duration: "3 Days",
  },
  {
    id: "p2",
    type: "portfolio",
    name: "Marcus",
    time: "5 hrs ago",
    location: "New York",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&fit=crop",
    ],
    tag: "Architecture",
    description: "Exploring the brutalist structures of the financial district on a cloudy afternoon.",
  },
  {
    id: "o2",
    type: "opportunity",
    name: "Vogue Weddings",
    time: "1 day ago",
    location: "Paris, FR",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop",
    title: "Second Shooter needed for high-end destination wedding",
    budget: "$1,500/day + flights",
    description: "We are looking for a reliable second shooter comfortable with Sony systems and natural light portraiture to cover the rehearsal and reception.",
    category: "Photography",
    shootType: "Event/Wedding",
    date: "Dec 10 - 12",
    duration: "3 Days",
  },
];

/** Onboarding role options */
export const CREATOR_ROLES = [
  "Photographer",
  "Cinematographer",
  "Videographer",
  "Editor",
];
