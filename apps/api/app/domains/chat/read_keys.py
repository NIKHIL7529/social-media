def read_receipt_key(user_name: str) -> str:
    return user_name.replace(".", "\uff0e").replace("$", "\uff04")
