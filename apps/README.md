# SocialSphere: Next.js + FastAPI Platform

Production-oriented SocialSphere app built with Next.js, TypeScript, TailwindCSS, FastAPI, Uvicorn, MongoDB, Cloudinary, TanStack Query, and WebSockets.

## Key Features

### Real-Time Communication
- Direct and group chat with authenticated FastAPI WebSockets.
- Online/offline presence tracking.
- Typing indicators.
- Unread counts and read markers.
- Start a direct chat from any user profile, even when no conversation exists yet.
- Optional group names with rename support and member-name fallback.

### Social Core
- Cursor-paginated global feed with infinite scrolling.
- Post creation, deletion, likes, saved posts, sharing, persisted comments, and liked-by lists.
- Public and private profile pages.
- Search and discovery with navigable user results.
- Followers/following list dialogs and follow/unfollow flows.
- Profile editing separated from password updates.

### Production Architecture
- Modular FastAPI routers and services.
- Typed frontend service layer and feature folders.
- HTTP-only JWT cookie authentication.
- Cloudinary uploads and optimized `next/image` rendering.
- TanStack Query cache management.
- Seed script for repeatable dummy data.

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| Web | Next.js 16, React 19.2, TypeScript, TailwindCSS, TanStack Query |
| API | Python 3.13, FastAPI, Uvicorn, WebSockets |
| Database | MongoDB via Motor/PyMongo |
| Media | Cloudinary |
| Runtime | Node 24.18 LTS, Python 3.13.1 |

## Project Structure

```bash
apps/
  api/   # FastAPI service
    app/api/      # HTTP/WebSocket routers
    app/core/     # shared infrastructure
    app/domains/  # posts, users, chat, groups, media modules
    scripts/      # seed and maintenance scripts
  web/   # Next.js App Router client
    src/app/       # routes
    src/components # shared UI controls
    src/features/  # feature modules
    src/lib/       # API/query/time utilities
```

## Local Setup

API:

```powershell
cd apps/api
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Web:

```powershell
cd apps/web
npm install
copy .env.example .env.local
npm run dev
```

Seed dummy data:

```powershell
cd apps/api
.\.venv\Scripts\activate
python scripts\seed.py
```

Docker:

```powershell
cd ..
docker compose up --build
```

The root compose file starts API, Web, and Nginx. Open `http://localhost:8080` to exercise the same reverse-proxy paths used in Kubernetes: `/` for Next.js, `/api` for FastAPI, and `/ws` for WebSockets.

## Migration Parity

All original REST routes are present under compatible paths for users, posts, messages, and groups. The new stack additionally includes direct conversation creation, read markers, group rename, liked-by lists, persisted comments, username profile lookup, and WebSocket realtime chat.
