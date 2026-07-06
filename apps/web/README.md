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
- Notifications page for likes, comments, follows, and messages.
- Realtime chat with direct messages, groups, unread counts, typing, and online presence.
- Mobile-aware shell with bottom navigation and independent chat scrolling.

## Key Directories

```bash
src/app/       # Next.js routes
src/components # shared shell/layout/form/media components
src/features/  # auth, chat, feed, notifications, users, shared social cache utilities
src/lib/       # API client, Cloudinary loader, utilities
src/types/     # shared TypeScript models
```

Feature folders own their service calls, hooks, cache rules, and presentational components for that feature. Shared cache mechanics live under `features/social/cache-utils.ts`, while domain actions such as post reactions and follow state stay in `features/feed` and `features/users`. Route files should stay thin and compose feature hooks/components.

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

From the repository root:

```powershell
docker compose up --build
```

For Kubernetes behind the provided same-origin ingress, build the web image with `NEXT_PUBLIC_API_URL=/` so browser requests use `/api` and `/ws` on the same host. For local direct API access, keep `NEXT_PUBLIC_API_URL=http://localhost:8000`.
