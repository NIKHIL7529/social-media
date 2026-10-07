from pymongo.collation import Collation

IDENTITY_COLLATION = Collation(locale="en", strength=2)

PUBLIC_USER_PROJECTION = {"password": 0, "email": 0}
