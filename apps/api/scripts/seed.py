from datetime import datetime, timezone
from pathlib import Path
import os

import bcrypt
from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

DATABASE = os.environ["DATABASE"]
PASSWORD = "Password123!"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt(rounds=10)).decode("utf-8")


def main() -> None:
    client = MongoClient(DATABASE, serverSelectionTimeoutMS=10000)
    db_name = DATABASE.rsplit("/", 1)[-1].split("?")[0]
    db = client[db_name]
    now = datetime.now(timezone.utc)

    db.users.delete_many({"name": {"$in": ["nikhil", "ananya", "rahul"]}})
    db.posts.delete_many({"topic": {"$regex": "^Seed:"}})
    db.comments.delete_many({"seed": True})
    db.messages.delete_many({"seed": True})
    db.groups.delete_many({"seed": True})
    db.chatmessages.delete_many({"seed": True})

    users = [
        {
            "_id": ObjectId(),
            "name": "nikhil",
            "username": "nikhil",
            "email": "nikhil@example.com",
            "dob": "1998-01-01",
            "gender": "Male",
            "password": hash_password(PASSWORD),
            "city": "Bengaluru",
            "country": "India",
            "description": "Building SocialSphere.",
            "photo": "",
            "followers": ["ananya", "rahul"],
            "followings": ["ananya", "rahul"],
            "saved": [],
            "liked": [],
            "createdAt": now,
            "updatedAt": now,
        },
        {
            "_id": ObjectId(),
            "name": "ananya",
            "username": "ananya",
            "email": "ananya@example.com",
            "dob": "1999-05-10",
            "gender": "Female",
            "password": hash_password(PASSWORD),
            "city": "Mumbai",
            "country": "India",
            "description": "Designer and photographer.",
            "photo": "",
            "followers": ["nikhil"],
            "followings": ["nikhil"],
            "saved": [],
            "liked": [],
            "createdAt": now,
            "updatedAt": now,
        },
        {
            "_id": ObjectId(),
            "name": "rahul",
            "username": "rahul",
            "email": "rahul@example.com",
            "dob": "1997-09-20",
            "gender": "Male",
            "password": hash_password(PASSWORD),
            "city": "Delhi",
            "country": "India",
            "description": "Backend engineer.",
            "photo": "",
            "followers": ["nikhil"],
            "followings": ["nikhil"],
            "saved": [],
            "liked": [],
            "createdAt": now,
            "updatedAt": now,
        },
    ]
    db.users.insert_many(users)
    by_name = {user["name"]: user for user in users}

    post_one_id = ObjectId()
    db.posts.insert_many(
        [
            {
                "_id": post_one_id,
                "topic": "Seed: First SocialSphere post",
                "text": "A seeded post for testing feeds, profile posts, likes, and saved posts.",
                "photo": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                "likes": 0,
                "saved": 0,
                "share": 0,
                "commentable": True,
                "commentCount": 1,
                "user": by_name["nikhil"]["_id"],
                "createdAt": now,
                "updatedAt": now,
            },
            {
                "_id": ObjectId(),
                "topic": "Seed: Weekend photo walk",
                "text": "Testing Cloudinary rendering and responsive image cards.",
                "photo": "https://res.cloudinary.com/demo/image/upload/woman.jpg",
                "likes": 0,
                "saved": 0,
                "share": 0,
                "commentable": True,
                "commentCount": 0,
                "user": by_name["ananya"]["_id"],
                "createdAt": now,
                "updatedAt": now,
            },
        ]
    )
    db.comments.insert_one(
        {
            "_id": ObjectId(),
            "post": post_one_id,
            "sender": "ananya",
            "comment": "Seeded comment for persistence testing.",
            "status": "visible",
            "seed": True,
            "createdAt": now,
            "updatedAt": now,
        }
    )

    conversation_id = ObjectId()
    db.messages.insert_one(
        {
            "_id": conversation_id,
            "participantKey": "ananya:nikhil",
            "users": ["nikhil", "ananya"],
            "group": False,
            "messages": [],
            "readBy": {"nikhil": now, "ananya": now},
            "lastMessage": {"message": "Seed chat is ready.", "sender": "ananya", "createdAt": now},
            "seed": True,
            "createdAt": now,
            "updatedAt": now,
        }
    )
    db.chatmessages.insert_one(
        {
            "conversation": conversation_id,
            "sender": "ananya",
            "message": "Seed chat is ready.",
            "type": "text",
            "seed": True,
            "createdAt": now,
            "updatedAt": now,
        }
    )

    print("Seed complete. Login users: nikhil, ananya, rahul. Password:", PASSWORD)


if __name__ == "__main__":
    main()
