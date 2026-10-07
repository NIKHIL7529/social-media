from contextlib import asynccontextmanager
from time import monotonic

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError

from app.api import groups, messages, posts, realtime, users
from app.core.config import get_settings
from app.core.database import close_mongo_connection, connect_to_mongo, get_database_status
from app.core.rate_limit import RateLimitMiddleware
from app.models.indexes import ensure_indexes
from app.domains.media import configure_cloudinary

started_at = monotonic()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_cloudinary()
    await connect_to_mongo()
    if get_database_status()["ready"]:
        await ensure_indexes()
    yield
    await close_mongo_connection()


settings = get_settings()
app = FastAPI(title="SocialSphere API", version="2.0.0", lifespan=lifespan)

app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/user", tags=["users"])
app.include_router(posts.router, prefix="/api/post", tags=["posts"])
app.include_router(messages.router, prefix="/api/message", tags=["messages"])
app.include_router(groups.router, prefix="/api/group", tags=["groups"])
app.include_router(realtime.router, tags=["realtime"])


@app.exception_handler(PyMongoError)
async def mongo_exception_handler(request, exc: PyMongoError):
    return JSONResponse(
        status_code=503,
        content={
            "status": 503,
            "message": "Database unavailable. Check MongoDB connection, Atlas network access, and DNS.",
            "detail": str(exc),
        },
    )


@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "OK",
        "message": "API is healthy!",
        "uptime": monotonic() - started_at,
        "database": get_database_status(),
    }
