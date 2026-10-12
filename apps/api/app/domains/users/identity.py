def identity_query(username: str, *, email: str | None = None) -> dict:
    alternatives = [{"username": username}]
    if email is not None:
        alternatives.append({"email": email})
    return {"$or": alternatives} if email is not None else {"username": username}
