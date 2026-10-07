# SocialSphere API

FastAPI replacement for the original Express backend. Targets Python `3.13.1`.

## Features

- JWT authentication using HTTP-only cookies.
- Case-insensitive unique usernames and emails, with whitespace rejected.
- Strong passwords for signup and password changes; existing passwords remain valid for login.
- Basic API rate limiting with tighter login/signup limits.
- MongoDB persistence with Motor/PyMongo.
- Cloudinary image uploads with size/type validation and best-effort cleanup.
- Feed, posts, users, followers, saved posts, likes, liked-by, and persisted comments.
- Direct and group chat REST contracts.
- Authenticated WebSocket realtime layer for live messages, typing, and presence.
- Graceful database-unavailable responses for local development.
- Seed script for dummy users, posts, and chats.

## Key Directories

```bash
app/api/       # FastAPI routers; HTTP/WebSocket boundary only
app/core/      # config, database, security, validation, time
app/domains/   # business modules grouped by domain
app/models/    # database indexes and model setup
app/schemas/   # serialization helpers
scripts/       # seed and maintenance scripts
```

## Domain Modules

The API is organized by business capability instead of one flat service layer.

```bash
app/domains/
  chat/     # identity, direct chat, listing, message commands/queries, read state, realtime
  groups/   # group creation and rename rules
  media/    # Cloudinary integration
  posts/    # post lifecycle, comments, reactions/share, request schemas
  users/    # account/profile, public queries, follow graph, username rules, request schemas
```

Routers import each domain through its package boundary, for example `app.domains.posts`, not by reaching into unrelated modules. Keep new business behavior in its domain folder, put request DTOs in that domain's `schemas.py`, keep reusable policy in small rules/constants modules, and keep `app/api` handlers thin.

## Environment

Create `.env` from `.env.example`.

```env
DATABASE=mongodb://127.0.0.1:27017/SocialMediaDB
SECRET_KEY=change-me
FRONTEND_URL=http://localhost:3000
FRONTEND_URLS=
CORS_ORIGIN_REGEX=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ENVIRONMENT=development
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=120
AUTH_RATE_LIMIT_MAX_REQUESTS=20
```

For Render + Vercel production, set:

```env
ENVIRONMENT=production
FRONTEND_URL=https://your-vercel-domain.vercel.app
FRONTEND_URLS=https://your-custom-domain.com,https://your-preview-domain.vercel.app
SECRET_KEY=a-long-stable-random-value
```

The API issues an HTTP-only JWT cookie. Cross-site Vercel-to-Render requests require the frontend origin to be allowed by CORS and the cookie to be sent as `Secure; SameSite=None`. The API enables that automatically for HTTPS frontend origins, but keeping `ENVIRONMENT=production` explicit on Render is still recommended. Do not change `SECRET_KEY` after users log in unless you want all existing sessions to expire.

Realtime is intentionally single-instance and in-memory for this Mongo-only commit. When you later add Redis, the WebSocket manager can be swapped to a Pub/Sub adapter without changing the route contract.

## Containers and Kubernetes

The API image runs as UID `10001`, exposes port `8000`, and includes a `/api/health` container health check. Kubernetes config lives at the repository root in `k8s/`, `ingress.yaml`, `network-policy.yaml`, and `role.yaml`.

Do not commit real Kubernetes secrets. Use `k8s/api-secret.example.yaml` as the shape for your cluster secret and keep real values outside git.

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Checks

```powershell
python -m unittest discover tests
python -m compileall app scripts
```

## Seed Data

```powershell
python scripts\seed.py
```


## API Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/user/login` | POST | Login and set auth cookie |
| `/api/user/logout` | POST | Clear auth cookie |
| `/api/user/profile` | GET | Current user profile |
| `/api/user/search` | POST | Search users |
| `/api/user/follow` | POST | Follow or unfollow |
| `/api/post` | POST | Cursor-paginated feed |
| `/api/post/addPost` | POST | Create post |
| `/api/post/comment` | POST | Persist comment |
| `/api/post/likedBy` | POST | List post likers |
| `/api/message/allChats` | GET | Chat list |
| `/api/message/direct` | POST | Get or create direct chat |
| `/api/message/markRead` | POST | Mark chat read |
| `/api/group/createGroup` | POST | Create group |
| `/api/group/renameGroup` | POST | Rename group |
| `/ws/chat` | WebSocket | Live messages, typing, presence |
