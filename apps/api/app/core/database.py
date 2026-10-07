from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import PyMongoError
import dns.resolver

from app.core.config import get_settings

client: AsyncIOMotorClient | None = None
database_ready = False
database_error: str | None = None


def configure_dns() -> None:
    settings = get_settings()
    if settings.environment == "production" or not settings.mongo_dns_nameservers:
        return

    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = settings.mongo_dns_nameservers
    resolver.lifetime = 10
    resolver.timeout = 5
    dns.resolver.default_resolver = resolver


async def connect_to_mongo() -> None:
    global client, database_ready, database_error
    settings = get_settings()
    configure_dns()
    client = AsyncIOMotorClient(
        settings.database,
        serverSelectionTimeoutMS=settings.mongodb_server_selection_timeout_ms,
        connectTimeoutMS=settings.mongodb_connect_timeout_ms,
    )
    try:
        await client.admin.command("ping")
        database_ready = True
        database_error = None
    except PyMongoError as error:
        database_ready = False
        database_error = str(error)
        raise


async def close_mongo_connection() -> None:
    global client, database_ready
    if client is not None:
        client.close()
        client = None
    database_ready = False


def get_database() -> AsyncIOMotorDatabase:
    if client is None:
        raise RuntimeError("MongoDB has not been initialized")
    settings = get_settings()
    db_name = settings.database.rsplit("/", 1)[-1].split("?")[0]
    return client[db_name]


def get_database_status() -> dict:
    return {
        "ready": database_ready,
        "error": database_error,
    }
