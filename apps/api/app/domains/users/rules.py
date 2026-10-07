from email_validator import validate_email

from app.core.security import MAX_BCRYPT_BYTES

USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 30
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 40
USERNAME_ALLOWED_MESSAGE = "Use letters, numbers, dots, or underscores, including at least one letter or number."
USERNAME_LENGTH_MESSAGE = f"Choose a username with {USERNAME_MIN_LENGTH} to {USERNAME_MAX_LENGTH} characters."
PASSWORD_LENGTH_MESSAGE = f"Choose a password with {PASSWORD_MIN_LENGTH} to {PASSWORD_MAX_LENGTH} characters."
PASSWORD_REQUIREMENTS = f"Use {PASSWORD_MIN_LENGTH} to {PASSWORD_MAX_LENGTH} characters, with a capital letter, a lowercase letter, a number, and a symbol (such as ! or @)."
PASSWORD_ENCODING_MESSAGE = "This password contains too many special characters. Try fewer emojis or accented letters."


def normalize_username(value: str) -> str:
    normalized = value.strip().lower()
    if not normalized.replace("_", "").replace(".", "").isalnum():
        raise ValueError(USERNAME_ALLOWED_MESSAGE)
    return normalized


def without_whitespace(value: str) -> str:
    if not isinstance(value, str) or any(character.isspace() for character in value):
        raise ValueError("Please remove spaces from your username or email address.")
    return value


def validate_username(value: str) -> str:
    if not USERNAME_MIN_LENGTH <= len(value) <= USERNAME_MAX_LENGTH:
        raise ValueError(USERNAME_LENGTH_MESSAGE)
    return normalize_username(without_whitespace(value))


def normalize_email(value: str) -> str:
    return validate_email(without_whitespace(value), check_deliverability=False).normalized.lower()


def normalize_login_identifier(value: str) -> str:
    value = without_whitespace(value)
    return normalize_email(value) if "@" in value else value.lower()


def validate_password(value: str) -> str:
    if not PASSWORD_MIN_LENGTH <= len(value) <= PASSWORD_MAX_LENGTH:
        raise ValueError(PASSWORD_LENGTH_MESSAGE)
    if (
        not any("A" <= character <= "Z" for character in value)
        or not any("a" <= character <= "z" for character in value)
        or not any("0" <= character <= "9" for character in value)
        or not any(not character.isalnum() and not character.isspace() for character in value)
    ):
        raise ValueError(PASSWORD_REQUIREMENTS)
    if len(value.encode("utf-8")) > MAX_BCRYPT_BYTES:
        raise ValueError(PASSWORD_ENCODING_MESSAGE)
    return value
