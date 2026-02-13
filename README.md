# Smart Bookmarks

Minimal bookmark manager with real-time sync. Next.js (App Router) + Supabase + Tailwind.

## Need

- One place to save links across devices
- No clutter: add, edit, delete; no folders or complexity
- Private and synced in real time

## Features

- **Auth:** Google OAuth (Supabase); session in middleware
- **Bookmarks:** Add (URL + optional title), edit (URL/title), delete
- **Real-time:** Supabase Realtime; list updates across tabs
- **Profiles:** Auto-created on sign-up; last sign-in updated on login
- **UI:** Dark theme; animated landing; bookmarks as cards with inline edit

## Implementation

- **Framework:** Next.js 16 (App Router)
- **Backend:** Supabase (Postgres, Auth, Realtime)
- **Styling:** Tailwind CSS (utility-first, no component lib)
- **Auth flow:** `/login` → OAuth → `/auth/callback` (exchange code, upsert profile) → `/`
- **Data:** RLS on `bookmarks` and `profiles`; policies scoped by `auth.uid()`. Realtime subscription filtered by `user_id`.

## Folder structure

```
my-app/
├── app/
│   ├── auth/
│   │   ├── callback/route.ts    # OAuth code → session, profile upsert
│   │   └── auth-code-error/     # Auth error page
│   ├── login/page.tsx           # Sign-in (Google)
│   ├── layout.tsx
│   ├── page.tsx                 # Landing (guest) or bookmarks (user)
│   └── globals.css
├── components/
│   ├── Landing.tsx              # Animated landing (guest)
│   ├── AddBookmark.tsx          # Add form
│   ├── BookmarkList.tsx         # List + inline edit + delete
│   └── LogoutButton.tsx
├── lib/supabase/
│   ├── client.ts                # Browser client
│   ├── server.ts                # Server client (cookies)
│   └── middleware.ts            # Session refresh
├── supabase/migrations/
│   ├── 001_create_bookmarks.sql
│   ├── 002_create_profiles.sql
│   └── 003_bookmarks_update_policy.sql
├── types/
│   └── bookmark.ts
├── middleware.ts                # Next middleware → updateSession
├── .env.local.example
└── .env.local                   # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Best practices

- **Auth:** Server `getUser()` for route-level auth; client Supabase for mutations and Realtime.
- **RLS:** All tables have RLS; policies restrict by `auth.uid()` / `user_id`; no service role in app.
- **Migrations:** Schema and policies in versioned SQL files; run in order (001 → 002 → 003) in Supabase SQL Editor or via CLI.
- **Types:** `Bookmark` in `types/bookmark.ts` matches DB; use for Realtime payloads and list state.
- **URLs:** Normalize on add/edit (prepend `https://` when missing); optional title falls back to hostname or "Link".
- **Errors:** Surface API errors in UI (add form, edit form); avoid silent failures.

## Setup

1. Supabase: create project; run `supabase/migrations/*.sql` in order; enable Google provider and set redirect URLs (including `/auth/callback`).
2. Env: copy `.env.local.example` → `.env.local`; set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Run: `npm install` then `npm run dev`.

Deploy (e.g. Vercel): add same env vars; add production redirect URL in Supabase Auth URL config.
