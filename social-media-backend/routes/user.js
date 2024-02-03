const express = require("express");
const {
  all_users,
  signup,
  login,
  logout,
  search,
  profile,
  use,
  follow,
} = require("../controller/user");
const { token_User_Verify } = require("../utils/tokenVerification");

const router = express.Router();

router.get("/", all_users);
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", token_User_Verify, logout);
router.post("/search", token_User_Verify, search);
router.get("/profile", token_User_Verify, profile);
router.post("/user", token_User_Verify, use);
router.post("/follow", token_User_Verify, follow);

module.exports = router;
