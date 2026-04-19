const express = require("express");
const {
  all_users,
  signup,
  editProfile,
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
router.post("/editProfile", token_User_Verify, editProfile);
router.post("/login", login);
router.get("/logout", token_User_Verify, logout);
router.post("/search", search);
router.get("/profile", token_User_Verify, profile);
router.post("/user", use);
router.post("/follow", token_User_Verify, follow);

module.exports = router;
