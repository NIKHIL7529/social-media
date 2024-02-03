const express = require("express");
const {
  all_posts,
  addPost,
  deletePost,
  signedUserPosts,
  userPosts,
  saved,
  liked,
} = require("../controller/post");
const { token_User_Verify } = require("../utils/tokenVerification");

const router = express.Router();

router.get("/", token_User_Verify, all_posts);
router.post("/addPost", token_User_Verify, addPost);
router.post("/deletePost", token_User_Verify, deletePost);
router.get("/signedUserPosts", token_User_Verify, signedUserPosts);
router.post("/userPosts", token_User_Verify, userPosts);
router.post("/saved", token_User_Verify, saved);
router.post("/liked", token_User_Verify, liked);

module.exports = router;