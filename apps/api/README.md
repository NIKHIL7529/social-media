# SocialSphere API

FastAPI backend using Python 3.13 and native async PyMongo. Dependencies are listed in `requirements.txt`.

## Local setup

Run from `apps/api`, with MongoDB available:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure `.env`:

| Variable                                                               | Purpose                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| `DATABASE`                                                             | MongoDB URI including the database name                 |
| `SECRET_KEY`                                                           | Secret for signing session and socket tokens            |
| `FRONTEND_URL`                                                         | Web application's origin                                |
| `FRONTEND_URLS`                                                        | Additional comma-separated permitted origins, if needed |
| `ENVIRONMENT`                                                          | `development` locally; `production` on Render           |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image upload credentials                                |

The example also documents optional CORS, development DNS overrides, connection timeouts, and rate limits. Keep credentials out of Git.

```powershell
uvicorn app.main:app --reload --port 8000
```

API documentation: `http://localhost:8000/docs` and `/redoc`. Readiness details: `/api/health`. Startup requires a working database connection and permission to create query indexes.

## Render deployment

Set the service root to `apps/api`, install `requirements.txt`, and start with:

```sh
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Configure the variables above in Render, with `ENVIRONMENT=production` and `FRONTEND_URL` set to the Vercel origin. Configure Atlas network access for the API service. This deployment does not require Docker.

## Authentication and realtime

Sessions use an HTTP-only JWT cookie. Production cookies are secure; browser HTTP requests are proxied through the frontend origin. Permitted frontend origins are configured explicitly.

Chat obtains a 60-second, purpose-limited ticket from authenticated `POST /api/message/socketTicket`, then connects to `/ws/chat` using the ticket. A socket ticket cannot authenticate ordinary HTTP endpoints. Deploy corresponding frontend and API changes together.

Presence, connections, and rate-limit counters are held in process memory. Run one API process/instance with the current implementation; multiple workers or replicas do not share that state.

## Account rules

Display names default to `Anonymous`, accept 3-20 letters with spaces, and may repeat. Usernames and emails are unique. Search trims surrounding whitespace, rejects blank input, and treats the remaining text literally.

Signup and profile updates require a valid birth date at least 18 years before the current UTC date. Login also checks eligibility. Future birth dates are rejected. These checks use shared backend validation rather than relying on the browser calendar.

## Database indexes

Startup creates non-unique query indexes from `app/core/indexes.py`. Create the following identity/conversation indexes separately in Atlas or Compass:

| Collection | Keys                    | Options                                             |
| ---------- | ----------------------- | --------------------------------------------------- |
| `users`    | `{"username": 1}`       | Unique; collation `{"locale": "en", "strength": 2}` |
| `users`    | `{"email": 1}`          | Unique; same collation as the username index        |
| `messages` | `{"participantKey": 1}` | Unique; sparse                                      |

Group conversations omit `participantKey`. Keep MongoDB's automatic `_id_` indexes. Deleting documents preserves indexes; dropping collections requires recreating them.

## Development seed

```powershell
python scripts\seed.py
```

This deletes **all documents** in `users`, `posts`, `comments`, `messages`, `groups`, and `chatmessages` in the configured database, then creates current-schema dummy data. It also removes unique display-name indexes. It uses application validation and document builders; no legacy-record compatibility is required.

Seed login usernames: `nikhil`, `ananya`, `rahul`. Password for all three: `SocialSphere123!`.

## Implementation and verification

- `app/api`: HTTP/WebSocket handlers; `app/domains`: domain commands, queries, and request schemas.
- `app/core`: configuration, database lifecycle, security, validation, and UTC time helpers; `app/schemas`: serialization; `scripts`: seed tooling.
- Reuse one async database client per process. Keep bcrypt and Cloudinary SDK work in the thread pool. Do not globally cache private account responses.
- Feed queries use ID cursors and batch author lookup. Chat messages use timestamp-and-ID pagination. Comments and chat messages have separate collections.
- Surface database failures and log failed media cleanup.

After dependency changes, reinstall requirements and restart. Check Python compilation from this directory:

```powershell
python -m compileall app scripts
```
