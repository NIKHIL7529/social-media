USERNAME_ALLOWED_MESSAGE = "Username can contain letters, numbers, dots, and underscores"


def normalize_username(value: str) -> str:
    normalized = value.strip().lower()
    if not normalized.replace("_", "").replace(".", "").isalnum():
        raise ValueError(USERNAME_ALLOWED_MESSAGE)
    return normalized
