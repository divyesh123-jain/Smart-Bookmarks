# Smart Bookmark App

A beautiful, minimalistic bookmark manager built with Next.js, Supabase, and Tailwind CSS. Features real-time synchronization across all your devices and tabs.

## Features

- 🔐 **Google OAuth Authentication** - Sign in securely with your Google account
- 📌 **Bookmark Management** - Add and delete bookmarks with ease
- 🔒 **Private & Secure** - Your bookmarks are private to you
- ⚡ **Real-time Updates** - Changes sync instantly across all tabs and devices
- 🎨 **Beautiful UI** - Clean, minimalistic design that's a joy to use

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the following migration:

```sql
-- Create bookmarks table
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table bookmarks enable row level security;

-- Create policy: Users can only see their own bookmarks
create policy "Users can view own bookmarks"
  on bookmarks for select
  using (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
  on bookmarks for insert
  with check (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table bookmarks;
```

3. Run the profiles migration (tracks who signed up / signed in):

```sql
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_signed_in_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, last_signed_in_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    now()
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

4. **Enable Google OAuth Provider:**
   - Go to Authentication > Providers in your Supabase dashboard
   - Find "Google" in the list and click to enable it
   - You'll need Google OAuth credentials (see step 4)

5. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" > "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - You can find your project ref in Supabase Project Settings > API
   - Copy the Client ID and Client Secret

6. **Configure Google OAuth in Supabase:**
   - Go back to Supabase > Authentication > Providers > Google
   - Paste your Google Client ID and Client Secret
   - Save the changes

7. **Add Redirect URLs:**
   - In Supabase, go to Authentication > URL Configuration
   - Add `http://localhost:3000/auth/callback` to Redirect URLs (for local development)
   - Add `https://your-vercel-app.vercel.app/auth/callback` (for production)

### 2. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Found in Project Settings > API
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Found in Project Settings > API

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Viewing who signed up / signed in

- In Supabase go to **Table Editor** and open the **profiles** table.
- Each row is a user who has signed in; `created_at` is first sign-up, `last_signed_in_at` is their latest login.
- Columns: `id`, `email`, `full_name`, `avatar_url`, `created_at`, `last_signed_in_at`.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Update Supabase redirect URLs to include your Vercel URL
5. Deploy!

## Development Notes

### Problems Encountered & Solutions

1. **Real-time Updates Not Working**
   - **Problem:** Bookmarks weren't updating in real-time across tabs
   - **Solution:** Implemented Supabase Realtime subscriptions using `postgres_changes` event listener. The channel subscribes to all changes (INSERT, DELETE, UPDATE) filtered by user_id to ensure privacy.

2. **Authentication Redirect Issues**
   - **Problem:** OAuth callback wasn't working properly
   - **Solution:** Created a dedicated `/auth/callback` route handler that exchanges the code for a session and redirects appropriately.

3. **Row Level Security**
   - **Problem:** Needed to ensure users can only access their own bookmarks
   - **Solution:** Implemented RLS policies in Supabase that filter all queries by `auth.uid() = user_id`, ensuring complete data isolation between users.

4. **TypeScript Type Safety**
   - **Problem:** Needed type definitions for bookmarks
   - **Solution:** Created a `types/bookmark.ts` file with the Bookmark interface matching the database schema.

5. **Google OAuth "Provider Not Enabled" Error**
   - **Problem:** Getting error "Unsupported provider: provider is not enabled" when trying to sign in
   - **Solution:** 
     - Make sure Google OAuth is enabled in Supabase Dashboard > Authentication > Providers
     - Verify Google Client ID and Client Secret are correctly entered
     - Ensure the redirect URI in Google Cloud Console matches: `https://[your-project-ref].supabase.co/auth/v1/callback`
     - Check that redirect URLs are added in Supabase > Authentication > URL Configuration

## Project Structure

```
my-app/
├── app/
│   ├── auth/
│   │   ├── callback/          # OAuth callback handler
│   │   └── auth-code-error/   # Error page
│   ├── login/                 # Login page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main bookmarks page
│   └── globals.css           # Global styles
├── components/
│   ├── AddBookmark.tsx       # Add bookmark form
│   ├── BookmarkList.tsx      # Bookmark list with real-time
│   └── LogoutButton.tsx      # Logout functionality
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       ├── server.ts         # Server Supabase client
│       └── middleware.ts     # Auth middleware
├── types/
│   └── bookmark.ts           # TypeScript types
└── middleware.ts             # Next.js middleware
```
