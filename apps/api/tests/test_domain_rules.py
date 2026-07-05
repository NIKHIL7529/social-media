import unittest

from app.domains.chat.read_keys import read_receipt_key
from app.domains.media.cloudinary import cloudinary_public_id
from app.domains.users.rules import normalize_username


class DomainRulesTest(unittest.TestCase):
    def test_username_normalization(self) -> None:
        self.assertEqual(normalize_username(" Nikhil.Dev_1 "), "nikhil.dev_1")

    def test_username_rejects_invalid_characters(self) -> None:
        with self.assertRaises(ValueError):
            normalize_username("bad/name")

    def test_read_receipt_key_escapes_mongo_path_characters(self) -> None:
        self.assertEqual(read_receipt_key("john.doe$admin"), "john\uff0edoe\uff04admin")

    def test_cloudinary_public_id_ignores_non_cloudinary_urls(self) -> None:
        url = "https://example.com/postImages/sample.jpg"
        self.assertEqual(cloudinary_public_id(url), "")


if __name__ == "__main__":
    unittest.main()
