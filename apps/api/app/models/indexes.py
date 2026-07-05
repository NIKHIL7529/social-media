from app.core.database import get_database


async def ensure_indexes() -> None:
    db = get_database()
    await db.users.create_index("name", unique=True)
    await db.users.create_index("username", unique=True, sparse=True)
    await db.users.create_index("email", unique=True, sparse=True)
    await db.users.create_index("createdAt")
    await db.posts.create_index([("createdAt", -1), ("_id", -1)])
    await db.posts.create_index([("user", 1), ("createdAt", -1)])
    await db.comments.create_index([("post", 1), ("createdAt", -1)])
    await db.comments.create_index([("sender", 1), ("createdAt", -1)])
    await db.messages.create_index([("users", 1), ("updatedAt", -1)])
    await db.messages.create_index("participantKey", unique=True, sparse=True)
    await db.groups.create_index([("users", 1), ("updatedAt", -1)])
    await db.chatmessages.create_index([("conversation", 1), ("createdAt", -1)])
