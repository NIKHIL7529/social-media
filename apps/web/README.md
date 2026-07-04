# SocialSphere Web

Next.js App Router replacement for the original Vite frontend. Targets Node `24.18.0` LTS with Next.js 16 and React 19.2.

## Features

- Responsive feed with infinite scroll and loading skeletons.
- Cloudinary optimized image rendering through `next/image`.
- Login, signup, logout, profile, edit profile, and password change flows.
- Search and public user profiles.
- Followers/following dialogs.
- Post likes, saves, delete, share, liked-by lists, and persisted comments.
- Saved posts page.
- Realtime chat with direct messages, groups, unread counts, typing, and online presence.
- Mobile-aware shell with bottom navigation and independent chat scrolling.

## Key Directories

```bash
src/app/       # Next.js routes
src/components # shared shell/layout components
src/features/  # auth, chat, feed, users
src/lib/       # API client, Cloudinary loader, utilities
src/types/     # shared TypeScript models
```

## Environment

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Run

```powershell
npm install
npm run dev
```

## Production

```powershell
npm run typecheck
npm run build
npm run start
```

## Docker

From `apps/`:

```powershell
docker compose up --build
```
