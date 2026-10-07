import asyncio
from pathlib import Path
import sys

from bson import ObjectId

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.core.time import utc_now
from app.domains.chat.identity import participant_key
from app.domains.chat.read_keys import read_receipt_key
from app.domains.users.account import build_user_document
from app.domains.users.schemas import SignupPayload
from dotenv import load_dotenv

load_dotenv(ROOT / ".env")

PASSWORD = "SocialSphere123!"
USER_PROFILES = [
    {
        "username": "nikhil",
        "email": "nikhil@example.com",
        "dob": "1998-01-01",
        "gender": "Male",
        "city": "Bengaluru",
        "country": "India",
        "description": "Building SocialSphere.",
        "followers": ["ananya", "rahul"],
        "followings": ["ananya", "rahul"],
    },
    {
        "username": "ananya",
        "email": "ananya@example.com",
        "dob": "1999-05-10",
        "gender": "Female",
        "city": "Mumbai",
        "country": "India",
        "description": "Designer and photographer.",
        "followers": ["nikhil"],
        "followings": ["nikhil"],
    },
    {
        "username": "rahul",
        "email": "rahul@example.com",
        "dob": "1997-09-20",
        "gender": "Male",
        "city": "Delhi",
        "country": "India",
        "description": "Backend engineer.",
        "followers": ["nikhil"],
        "followings": ["nikhil"],
    },
]


async def build_seed_users() -> list[dict]:
    # Validate every profile before replacing any seeded records.
    profiles = [SignupPayload.model_validate({**profile, "password": PASSWORD}) for profile in USER_PROFILES]
    users = []
    for profile, relationships in zip(profiles, USER_PROFILES, strict=True):
        user = await build_user_document(profile.model_dump())
        user.update({
            "_id": ObjectId(),
            "seed": True,
            "followers": relationships["followers"],
            "followings": relationships["followings"],
        })
        users.append(user)
    return users


async def seed_data() -> None:
    users = await build_seed_users()

    db = get_database()
    for collection in (db.users, db.posts, db.comments, db.messages, db.groups, db.chatmessages):
        await collection.delete_many({"seed": True})

    await db.users.insert_many(users)
    by_name = {user["name"]: user for user in users}
    now = utc_now()
    post_one_id = ObjectId()
    await db.posts.insert_many([
        {
            "_id": post_one_id,
            "topic": "Seed: First SocialSphere post",
            "text": "A seeded post for feeds, profile posts, likes, and saved posts.",
            "photo": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
            "likes": 0,
            "saved": 0,
            "share": 0,
            "commentable": True,
            "commentCount": 1,
            "user": by_name["nikhil"]["_id"],
            "seed": True,
            "createdAt": now,
            "updatedAt": now,
        },
        {
            "_id": ObjectId(),
            "topic": "Seed: Weekend photo walk",
            "text": "Cloudinary rendering and responsive image cards.",
            "photo": "https://res.cloudinary.com/demo/image/upload/woman.jpg",
            "likes": 0,
            "saved": 0,
            "share": 0,
            "commentable": True,
            "commentCount": 0,
            "user": by_name["ananya"]["_id"],
            "seed": True,
            "createdAt": now,
            "updatedAt": now,
        },
    ])
    await db.comments.insert_one({
        "_id": ObjectId(),
        "post": post_one_id,
        "sender": "ananya",
        "comment": "Seeded comment for persistence.",
        "status": "visible",
        "seed": True,
        "createdAt": now,
        "updatedAt": now,
    })

    conversation_id = ObjectId()
    participants = ["nikhil", "ananya"]
    await db.messages.insert_one({
        "_id": conversation_id,
        "participantKey": participant_key(participants),
        "users": participants,
        "group": False,
        "messages": [],
        "readBy": {read_receipt_key(name): now for name in participants},
        "lastMessage": {"message": "Seed chat is ready.", "sender": "ananya", "createdAt": now},
        "seed": True,
        "createdAt": now,
        "updatedAt": now,
    })
    await db.chatmessages.insert_one({
        "conversation": conversation_id,
        "sender": "ananya",
        "message": "Seed chat is ready.",
        "type": "text",
        "seed": True,
        "createdAt": now,
        "updatedAt": now,
    })

    print("Seed complete. Login users:", ", ".join(by_name), "Password:", PASSWORD)


async def main() -> None:
    try:
        await connect_to_mongo()
        await seed_data()
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
