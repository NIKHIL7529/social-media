def identity_query(username: str, *, email: str | None = None) -> dict:
    """Match both current usernames and the legacy name field."""
    alternatives = [{"name": username}, {"username": username}]
    if email is not None:
        alternatives.append({"email": email})
    return {"$or": alternatives}
