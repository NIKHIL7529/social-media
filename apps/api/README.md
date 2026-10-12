# SocialSphere API

FastAPI backend using native async PyMongo. Use Python 3.13.1 and follow the [shared development conventions](../README.md).

## Local setup

Run commands from `apps/api` with MongoDB available:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env`: set `DATABASE` to the intended database, replace `SECRET_KEY`, and set `FRONTEND_URL` to the frontend origin. The example contains additional origins, DNS/timeouts, rate limits, and Cloudinary settings. Configure Cloudinary credentials for media uploads. Keep real credentials out of Git.

```powershell
uvicorn app.main:app --reload --port 8000
```

HTTP documentation is available at `http://localhost:8000/docs` and `/redoc`. Health uses `/api/health`; chat realtime uses `/ws/chat`.

After dependency changes, reinstall `requirements.txt` and restart the API. Check compilation with:

```powershell
python -m compileall app scripts
```

## Database indexes

Connection startup creates query indexes defined in `app/core/indexes.py`; the database account needs index creation permission. Configure these unique indexes manually in Atlas or Compass before account or concurrent direct-chat creation:

| Collection | Keys | Options |
| --- | --- | --- |
| `users` | `{"username": 1}` | Unique; collation `{"locale": "en", "strength": 2}` |
| `users` | `{"email": 1}` | Unique; collation `{"locale": "en", "strength": 2}` |
| `messages` | `{"participantKey": 1}` | Unique; Sparse |

Select the database named in `DATABASE`, open each collection's Indexes tab, and create one index per row with the listed options. `participantKey` is sparse because group conversations omit it. Keep MongoDB's automatic `_id_` indexes. Clearing documents preserves indexes; dropping collections or the database requires recreating them.

## Development seed

```powershell
python scripts\seed.py
```

The seed removes unique display-name indexes so names can repeat; usernames and emails remain unique. Names default to `Anonymous` and accept 3?20 letters with spaces between words.

This clears **all documents** from `users`, `posts`, `comments`, `messages`, `groups`, and `chatmessages`, then creates current-schema accounts, posts, reactions, comments, and direct/group conversations. It uses application validation, password hashing, document builders, and domain commands.

Login usernames: `nikhil`, `ananya`, `rahul`. Password for all three: `SocialSphere123!`.

## Implementation conventions

- `app/api` contains thin HTTP/WebSocket handlers. `app/domains` owns users, posts, chat, groups, and media behavior, including domain request schemas. Import domains through their package boundaries.
- `app/core` owns configuration, database lifecycle, security, validation, and time helpers. `app/schemas` contains serialization helpers; `scripts` contains seed tooling.
- Application lifespan opens and closes one async database client. Await aggregation before consuming its cursor and close cursors when finished. Use UTC dates consistently.
- Keep blocking bcrypt and Cloudinary SDK work in the thread pool. Reuse authenticated documents within a request; do not globally cache private account data or personalized responses.
- Comments and chat messages have separate collections. Message pagination uses timestamp-and-ID cursors to distinguish simultaneous messages. Search treats input as literal text.
- Surface database failures as actionable errors and log media cleanup failures. Startup requires a working database connection.

Authentication uses an HTTP-only JWT cookie. Configure permitted frontend origins explicitly for deployment. Realtime presence and connections are in memory, so the current WebSocket implementation is intended for a single API instance.

References: [FastAPI async](https://fastapi.tiangolo.com/async/), [lifespan](https://fastapi.tiangolo.com/advanced/events/), and [PyMongo indexes](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/indexes/).
