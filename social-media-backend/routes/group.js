const express = require("express");
const { createGroup } = require("../controller/group");
const { token_User_Verify } = require("../utils/tokenVerification");

const router = express.Router();

router.post("/createGroup", token_User_Verify, createGroup);

module.exports = router;
