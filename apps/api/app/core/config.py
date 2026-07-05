from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database: str
    secret_key: str
    frontend_url: str = "http://localhost:3000"
    frontend_urls: str = ""
    cors_origin_regex: str = ""
    environment: str = "development"
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    mongodb_dns_nameservers: str = "1.1.1.1,8.8.8.8"
    mongodb_server_selection_timeout_ms: int = 10000
    mongodb_connect_timeout_ms: int = 5000
    rate_limit_window_seconds: int = 60
    rate_limit_max_requests: int = 120
    auth_rate_limit_max_requests: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins(self) -> List[str]:
        origins = [
            origin.strip().rstrip("/")
            for origin in f"{self.frontend_url},{self.frontend_urls}".split(",")
            if origin.strip()
        ]
        return list(dict.fromkeys([
            *origins,
            "http://localhost:3000",
            "http://localhost:5173",
        ]))

    @property
    def cookie_secure(self) -> bool:
        if self.environment == "production":
            return True
        return any(origin.startswith("https://") for origin in self.allowed_origins)

    @property
    def mongo_dns_nameservers(self) -> list[str]:
        return [
            server.strip()
            for server in self.mongodb_dns_nameservers.split(",")
            if server.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
