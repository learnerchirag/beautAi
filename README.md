# BeautAi

A personalised beauty profile app built with **Expo SDK 54**, featuring user authentication, a gamified onboarding flow, a curated home feed, and an AI-powered beauty advisor chat.

**Target platform:** iOS (Expo Go & development builds)

---

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Architecture Decisions](#architecture-decisions)
- [Time Breakdown by Feature](#time-breakdown-by-feature)
- [Limitations](#known-limitations)

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node)
- **Expo CLI** — installed globally or via `npx`
- **Xcode** with iOS Simulator (for local iOS builds)
- **Expo Go** app on a physical device (for QR-code testing)

### 1. Clone & Install

```bash
git clone <repo-url>
cd beautAi
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root with the following keys:

```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
GROQ_API_KEY=<your-groq-api-key>
GROQ_BASE_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.1-8b-instant
```

### 3. Run the App

```bash
# Start Expo dev server — scan the QR code with Expo Go
npx expo start

# Or run directly on the iOS simulator
npm run ios
```

### 4. Supabase Tables

The app expects the following tables in your Supabase project:

| Table | Key Columns |
|---|---|
| `profiles` | `id` (UUID, FK to auth.users), `email`, `name`, `onboarding_complete`, `beauty_vibe`, `favorite_brands`, `routine_time`, `xp_points` |
| `posts` | `id`, `title`, `image_url`, `author_name`, `category`, `tags`, `like_count`, `price`, `brand`, `created_at` |
| `user_likes` | `id`, `user_id`, `post_id`, `created_at` |
| `messages` | `id`, `user_id`, `role`, `content`, `created_at` |

---

## Architecture Decisions

### Project Structure

```
beautAi/
├── app/                        # Expo Router – file-based routing
│   ├── _layout.tsx             # Root layout (providers, auth gating)
│   ├── (auth)/                 # Auth group: login & signup screens
│   ├── (onboarding)/           # Onboarding group: steps + completion
│   └── (tabs)/                 # Main tab navigator (Home, Search, Saved, Chat)
├── components/                 # Reusable UI components
│   ├── buttons/                # PrimaryButton, SecondaryButton, TextButton, ActionButton
│   ├── chat/                   # ChatBubble, ChatInput, ChatListView, SuggestedQuestions
│   ├── feed/                   # FeedGrid, HeroCard, ContentCard, ProductCard, FilterChips
│   ├── inputs/                 # TextInput
│   ├── nav/                    # Custom TabBar with animated theme transitions
│   ├── onboarding/             # BubbleCluster, CircularSlider, VibeCards, XPBadge, etc.
│   └── ui/                     # Shared UI primitives
├── lib/                        # Business logic & API layer
│   ├── supabase.ts             # Supabase client, DB queries (posts, likes, profiles)
│   ├── groq.ts                 # Groq AI helpers (non-streaming + SSE streaming via XHR)
│   ├── chat.ts                 # Chat message CRUD + TanStack Query hooks
│   ├── posts.ts                # Feed queries, scoring algorithm, like mutations
│   ├── profile.ts              # User profile fetching
│   ├── queryClient.ts          # TanStack Query client instance
│   └── types.ts                # Shared TypeScript interfaces
├── store/
│   └── appStore.ts             # Zustand global store (auth, profile, messages, UI)
├── hooks/                      # Custom React hooks (useAuth, useColorScheme, etc.)
├── constants/                  # Theme colours & fonts
└── assets/                     # Icons (SVG components), images, Lottie animations, vibe images
```

### Auth & Routing Flow

The root `_layout.tsx` acts as an auth gate:

1. On launch, `useAuth` reads `userId` and `onboardingComplete` flags from AsyncStorage for instant identification of regular user.
2. Based on the result, the app is redirected to one of three route groups:
   - **No user** → `/(auth)/login`
   - **User but onboarding incomplete** → `/(onboarding)`
   - **Fully onboarded** → `/(tabs)` (Home, Search, Saved, Chat)

### Feed Scoring Algorithm

The "For You" feed uses a weighted scoring formula:

```
score = relevance × 0.5 + recency × 0.3 + popularity × 0.2
```

- **Relevance (50%)** — Does the post match the user's beauty vibe or favourite brands?
- **Recency (30%)** — Newer posts score higher (decays over 168 hours).
- **Popularity (20%)** — Normalized like count relative to the most-liked post.

### State Management Split

- **Zustand** → Client-only state: auth flags, cached user profile, in-memory chat messages, UI loading flags.
- **TanStack Query** → Server state: feed posts, user likes, message history. Handles caching, deduplication, and background refetches.
- **AsyncStorage** → Persistence layer: `userId`, `onboardingComplete`, and serialised user profile survive app restarts.

---

## Time Breakdown by Feature

Development spanned **4 days** (Feb 18 – Feb 22, 2026). Below is the breakdown derived from the Git commit history:

| Date | Duration | Feature | Key Commits |
|---|---|---|---|
| **Feb 18** | ~1 hr | **Project Setup** | Initialised Expo project, configured TypeScript, NativeWind, Tailwind, Babel, Metro. |
| **Feb 19** | ~5 hrs | **Onboarding UI/UX** | Built 3-step onboarding flow: BubbleCluster (brand selection), CircularSlider (routine time), VibeCards (aesthetic picker). Progress bar, XP badge, swipe navigation via Gesture Handler. |
| **Feb 20** | ~4 hrs | **Onboarding Completion + Home Feed + Navigation** | Onboarding completion screen with Lottie confetti, profile save to Supabase. Home feed layout with HeroCard, ContentCard, ProductCard, FilterChips. Custom animated bottom TabBar. |
| **Feb 21** | ~4 hrs | **Authentication + State Management** | Supabase email/password login & signup. Auth persistence with AsyncStorage. Zustand store for global state. Auth-gated routing in root layout. Profile fetch & cache on login. |
| **Feb 22 (early)** | ~4 hrs | **AI Chat with Streaming** | Chat screen with Groq AI integration. Streaming responses via XHR + SSE parsing. System prompt built from user's beauty profile. Chat history stored in Supabase `messages` table. Optimistic message handling. Suggested questions, ChatListView, spill animation. |
| **Feb 22 (mid)** | ~3 hrs | **UI/UX Enhancements + Likes** | Post like/unlike with optimistic updates. d3-force bubble cluster physics layout with shake-to-shuffle. Input field text clipping fix. |
| **Feb 22 (late)** | ~2 hrs | **Polish & Env Config** | UI refinements across screens. Extracted hardcoded credentials into environment variables. Final design tweaks. |

**Estimated total: ~23 hours**

---

## Known Limitations

1. **No conversation threads** — Messages are stored flat per user (`user_id` + `created_at`). In the future, messages should be grouped within threads/conversations to support multiple independent chat sessions.

2. **No real-time subscription** — The feed and likes rely on polling (TanStack Query stale times) rather than Supabase Realtime subscriptions. Posts liked on another device won't appear instantly.

3. **Chat history not paginated** — All messages for a user are fetched in a single query. This will degrade performance as conversation history grows; cursor-based pagination should be added.

4. **Apple Sign-In not functional** — The "Continue with Apple" button on the login screen is a placeholder (no-op). Only email/password auth is implemented.

5. **No image upload** — Post images are served from URLs stored in Supabase. There is no user-facing image upload or profile picture functionality yet.

6. **iOS-only** — The app targets iOS via Expo Go. Android and web are not tested and may have layout or functionality issues (e.g. `KeyboardAvoidingView` behaviour differences, platform-specific shadow styles).

7. **Search & Saved tabs are stubs** — The bottom navigation includes Search and Saved tabs, but they do not have full implementations yet.

8. **No offline support** — The app requires an active network connection. There is no offline message queue or cached feed fallback beyond TanStack Query's in-memory cache.

9. **XHR streaming limitation** — The Groq streaming chat uses `XMLHttpRequest` due to React Native's lack of `ReadableStream` support in `fetch`. This works but prevents using modern streaming APIs like `AbortController` signal propagation for cancellation.

10. **Environment variables not validated at startup** — If `.env` keys are missing, the app will silently fail on Supabase or Groq calls rather than showing a clear configuration error.
