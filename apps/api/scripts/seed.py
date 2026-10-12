"""Replace all development collection contents with data for the current schema."""

import asyncio
from pathlib import Path
import sys

from bson import ObjectId

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.domains.users.account import build_user_document
from app.domains.users.schemas import SignupPayload
from app.domains.posts.commands import build_post_document
from app.domains.posts.comments import create_comment
from app.domains.posts.reactions import toggle_liked, toggle_saved
from app.domains.chat.message_commands import send_message
from app.domains.groups.service import create_group
from dotenv import load_dotenv

load_dotenv(ROOT / ".env")

PASSWORD = "SocialSphere123!"
USER_PROFILES = [
    {
        "name": "Anonymous",
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
        "name": "Anonymous",
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
        "name": "Rahul",
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
    # Validate and hash accounts before clearing development collections.
    profiles = [SignupPayload.model_validate({**profile, "password": PASSWORD}) for profile in USER_PROFILES]
    users = []
    for profile, relationships in zip(profiles, USER_PROFILES, strict=True):
        user = await build_user_document(profile.model_dump())
        user.update({
            "_id": ObjectId(),
            "followers": relationships["followers"],
            "followings": relationships["followings"],
        })
        users.append(user)
    return users


async def seed_data() -> None:
    users = await build_seed_users()

    db = get_database()
    print("Resetting all development users, posts, comments, conversations, groups, and chat messages.")
    for collection in (db.users, db.posts, db.comments, db.messages, db.groups, db.chatmessages):
        await collection.delete_many({})

    async with await db.users.list_indexes() as indexes:
        async for index in indexes:
            if index.get("unique") and dict(index["key"]) == {"name": 1}:
                await db.users.drop_index(index["name"])

    await db.users.insert_many(users)
    by_name = {user["username"]: user for user in users}
    posts = [
        build_post_document(
            {"topic": "An evening worth sharing", "text": "A little time outdoors with good company.", "commentable": True},
            by_name["nikhil"],
            "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        ),
        build_post_document(
            {"topic": "Weekend photo walk", "text": "Finding something new around every corner.", "commentable": True},
            by_name["ananya"],
            "https://res.cloudinary.com/demo/image/upload/woman.jpg",
        ),
    ]
    result = await db.posts.insert_many(posts)
    first_post_id = str(result.inserted_ids[0])
    await create_comment(first_post_id, "What a lovely moment!", by_name["ananya"])
    await toggle_liked(first_post_id, by_name["ananya"])
    await toggle_saved(first_post_id, by_name["nikhil"])

    await send_message(["ananya"], "Any plans for the weekend?", None, by_name["nikhil"])
    group = await create_group("Weekend plans", ["ananya", "rahul"], by_name["nikhil"])
    await send_message([], "Let's go on a photo walk!", group["addGroup"]["chatId"], by_name["ananya"])

    print("Seed complete. Login users:", ", ".join(by_name), "Password:", PASSWORD)


async def main() -> None:
    try:
        await connect_to_mongo()
        await seed_data()
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
