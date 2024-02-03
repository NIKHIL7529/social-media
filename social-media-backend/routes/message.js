const express = require("express");
const {
  allChats,
  addMessage,
  messages,
  followings,
} = require("../controller/message");
const { token_User_Verify } = require("../utils/tokenVerification");

const router = express.Router();

router.get("/allChats", token_User_Verify, allChats);
router.post("/sendMessage", token_User_Verify, addMessage);
router.post("/messages", token_User_Verify, messages);
router.get("/followings", token_User_Verify, followings);

module.exports = router;
