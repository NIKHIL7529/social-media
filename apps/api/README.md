# SocialSphere API

FastAPI replacement for the original Express backend. Targets Python `3.13.1`.

## Features

- JWT authentication using secure HTTP-only cookies.
- MongoDB persistence with Motor/PyMongo.
- Cloudinary image uploads.
- Feed, posts, users, followers, saved posts, likes, liked-by, and persisted comments.
- Direct and group chat REST contracts.
- Authenticated WebSocket realtime layer for live messages, typing, and presence.
- Graceful database-unavailable responses for local development.
- Seed script for dummy users, posts, and chats.

## Key Directories

```bash
app/api/       # FastAPI routers
app/core/      # config, database, security
app/services/  # Cloudinary and realtime services
app/schemas/   # serialization helpers
scripts/       # seed and maintenance scripts
```

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
```

For Render + Vercel production, set:

```env
ENVIRONMENT=production
FRONTEND_URL=https://your-vercel-domain.vercel.app
FRONTEND_URLS=https://your-custom-domain.com,https://your-preview-domain.vercel.app
SECRET_KEY=a-long-stable-random-value
```

The API issues an HTTP-only JWT cookie. Cross-site Vercel-to-Render requests require the frontend origin to be allowed by CORS and the cookie to be sent as `Secure; SameSite=None`. The API enables that automatically for HTTPS frontend origins, but keeping `ENVIRONMENT=production` explicit on Render is still recommended. Do not change `SECRET_KEY` after users log in unless you want all existing sessions to expire.

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Seed Data

```powershell
python scripts\seed.py
```


## API Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/user/login` | POST | Login and set auth cookie |
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
