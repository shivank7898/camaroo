# Camaroo App Design & Architecture Documentation

## Core Identity
Camaroo is a visually driven photography community application focusing on presenting media beautifully through seamless transitions, "fade perfection," and immersive layouts.

## Global Design System

### 1. Color Palette
The app leverages a deep, premium dark theme accented with vivid brand colors:
- **Primary Background**: `#060D1A` (Deep Space Blue - used as the foundation for the entire app avoiding harsh blacks).
- **Primary Accent 1**: `#6A11CB` (Vibrant Purple).
- **Primary Accent 2**: `#7ECEFE` (Light Blue - used for highlights and specific element borders).
- **Secondary Action**: `#0EA5E9` (Sky Blue - used for prominent CTAs like the 'Create' button).
- **Text & Icons**: `#FFFFFF` (White) and `#4A5568` (Muted Slate for inactive/secondary text).

### 2. Typography
A modern, geometric sans-serif typeface is applied tracking-tight for a sleek app feel:
- **Font Family**: Outfit (`font-outfit`, `font-outfit-medium`, `font-outfit-bold`).

---

## Technical Implementations & UI/UX Refinements

### Perfect Fades (Gradient Masking)
A major design philosophy in Camaroo is "fade perfection"—ensuring images transition flawlessly into the background without harsh lines. This is achieved using precise multi-stop React Native `LinearGradient` components instead of utility classes for cross-platform rendering reliability.
- **Implementation**: The gradients exclusively use the exact background hex (`#060D1A`) at the `0.9` and `1.0` locations to guarantee an invisible seam.
- **Applied on**: Welcome Screen background, Auth (Login/Signup) background layers, and the scrolling Home Feed header masking.

### Custom Modular Tab Bar
The default Expo Router `Tabs` layout was replaced with a fully custom React Native layout (`CustomTabBar` in `app/(tabs)/_layout.tsx`) to match the desired floating aesthetic.
- **Structure**: 4 completely disconnected floating buttons instead of a single container wrapping all tabs.
- **Layout**: Left (Chat), Center-Left (Home), Center-Right (Create with prominent styling), Right (Profile).
- **Active State**: Inactive tabs are simple circles. When a tab becomes active, it expands into an elongated pill shape containing both the icon and the text label.

### Home / Discovery Feed Layout
The Home screen serves as the core content discovery engine.
- **Header Structure**: Clean typography (left-aligned "Home" text), no burger menus. Features right-aligned floating dynamic white action buttons (`shadow-sm`) for Notifications and Search.
- **Top Fade**: A deep purple-to-dark-blue (`#5b8fbc` -> `#060D1A`) gradient overlay starts at the top of the header area, smoothly graduating into the main body background, masking scrollable content seamlessly.
- **Featured Creators**: A horizontally scrolling list of prominent users rendered as tall vertical cards (`w-32 h-44`) with embedded background photography, overlapping avatars, and gradient fades to ensure text legibility.
- **Feed Posts**: Edge-to-edge images within rounded cards (`rounded-[28px]`), prominent avatars, and modern unified action bars (Like/Comment bubbles) inside the primary dark content container wrapper.

### Authentication & Onboarding
The entry flow for Camaroo is designed to be highly visual, leveraging full-bleed photography and structured steps.
- **Welcome Screen**: Features full-bleed background photography layered with a bottom-heavy gradient fade (`transparent` -> `rgba` -> `#060D1A`). Uses a gradient primary CTA button (`#6A11CB` -> `#2575FC`).
- **Authentication (Login/Signup)**: Clean, forms-based screens utilizing custom `Input` components with floating labels/icons and reusable `SocialButton` components for third-party auth. Includes deep blur layers and gradient masks.
- **Onboarding Flow**: A multi-step structured flow to capture user preferences:
  - **Role Selection (`role.tsx`)**: Users identify as Photographers, Enthusiasts, etc., using large selectable cards.
  - **Details (`details.tsx`)**: Captures basic profile information.
  - **Optional Preferences (`optional.tsx`)**: Allows selection of photography styles/genres using custom `SelectPill` components.

### Shared UI Components
A library of modular components (`components/`) enforces design consistency:
- **`Avatar`**: Reusable profile picture circles with varying sizes.
- **`Button` & `SocialButton`**: Standardized tap targets with primary, secondary, and gradient support.
- **`Card`**: Surface containers for content display.
- **`Input`**: Text entry fields with integrated icons and consistent deep-theme bordering.
- **`SelectPill`**: Interactive toggle pills for multi-selection within onboarding and discovery.
