from bson import ObjectId
from fastapi import HTTPException


def object_id_or_400(value: str | None, detail: str) -> ObjectId:
    if not value or not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail=detail)
    return ObjectId(value)
