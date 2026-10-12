import asyncio

from pymongo import IndexModel


async def ensure_query_indexes(db) -> None:
    """Create non-unique indexes for existing query patterns; preserve identity indexes."""
    await asyncio.gather(
        db.posts.create_indexes([IndexModel([("user", 1), ("_id", -1)])]),
        db.comments.create_indexes([IndexModel([("post", 1), ("status", 1), ("createdAt", 1)])]),
        db.chatmessages.create_indexes([IndexModel([("conversation", 1), ("createdAt", -1), ("_id", -1)])]),
        db.messages.create_indexes([IndexModel([("users", 1), ("group", 1), ("updatedAt", -1)])]),
        db.groups.create_indexes([IndexModel([("users", 1), ("updatedAt", -1)])]),
    )
