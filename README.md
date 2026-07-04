# SocialSphere

SocialSphere is a full-stack social media application built on a production-oriented Next.js and FastAPI foundation. The application code lives in `apps/`.

## Current Stack

| Layer | Technology |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS, TanStack Query |
| API | Python 3.13, FastAPI, Uvicorn, Pydantic |
| Realtime | Authenticated native WebSockets |
| Database | MongoDB |
| Media | Cloudinary |
| Auth | JWT in httpOnly cookies |

## Features

- Auth, signup, logout, protected sessions, edit profile, and separate password change.
- Cursor-paginated feed with Instagram-style infinite loading.
- Cloudinary image upload and optimized Next image rendering.
- Likes, saved posts, persisted comments, post deletion, and post liker lists.
- User search, public profiles, followers/following views, and follow/unfollow.
- Direct chats, group chats, optional group names, group rename, unread counts, read marks, typing, presence, and resilient WebSocket reconnects.
- Responsive layouts for feed, profile, search, settings, upload, and chat.
- Seed script for repeatable local dummy data.

## Project Structure

```text
apps/
  api/      FastAPI backend
  web/      Next.js frontend
  README.md
  docker-compose.yml
```

## Local Development

### API

```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Web

```bash
cd apps/web
npm install
copy .env.example .env.local
npm run dev
```

The web app runs at `http://localhost:3000` and expects the API at `http://localhost:8000`.

## Seed Data

```bash
cd apps/api
.venv\Scripts\activate
python scripts/seed.py
```

Seeded accounts use the password `password123`.

## Docker

From the repository root:

```bash
docker compose up --build
```

You can also run the compose file from `apps/`:

```bash
cd apps
docker compose up --build
```

## Verification

```bash
cd apps/api
python -m compileall app scripts

cd ../web
npm run typecheck
npm run build
```

Developed by [Nikhil Gupta](https://github.com/Nikhil7529).
