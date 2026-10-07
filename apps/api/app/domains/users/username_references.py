from app.core.database import get_database
from app.domains.chat.identity import participant_key
from app.domains.chat.read_keys import read_receipt_key


async def update_username_references(previous_username: str, next_username: str) -> None:
    db = get_database()
    await db.users.update_many({"followers": previous_username}, {"$set": {"followers.$": next_username}})
    await db.users.update_many({"followings": previous_username}, {"$set": {"followings.$": next_username}})
    conversations = await db.messages.find(
        {"users": previous_username, "group": False}, {"users": 1},
    ).to_list(length=None)
    for conversation in conversations:
        users = [next_username if name == previous_username else name for name in conversation["users"]]
        await db.messages.update_one(
            {"_id": conversation["_id"], "users": previous_username},
            {"$set": {"users": users, "participantKey": participant_key(users)}},
        )
    await db.messages.update_many(
        {"users": previous_username, "group": True}, {"$set": {"users.$": next_username}},
    )
    await db.messages.update_many(
        {"lastMessage.sender": previous_username}, {"$set": {"lastMessage.sender": next_username}},
    )
    await db.messages.update_many(
        {f"readBy.{read_receipt_key(previous_username)}": {"$exists": True}},
        {"$rename": {f"readBy.{read_receipt_key(previous_username)}": f"readBy.{read_receipt_key(next_username)}"}},
    )
    await db.groups.update_many({"users": previous_username}, {"$set": {"users.$": next_username}})
    await db.groups.update_many({"creator": previous_username}, {"$set": {"creator": next_username}})
    await db.groups.update_many(
        {"lastMessage.sender": previous_username}, {"$set": {"lastMessage.sender": next_username}},
    )
    await db.chatmessages.update_many({"sender": previous_username}, {"$set": {"sender": next_username}})
    await db.comments.update_many({"sender": previous_username}, {"$set": {"sender": next_username}})
    await db.posts.update_many(
        {"comments.sender": previous_username},
        {"$set": {"comments.$[comment].sender": next_username}},
        array_filters=[{"comment.sender": previous_username}],
    )
