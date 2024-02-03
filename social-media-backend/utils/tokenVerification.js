const jwt = require("jsonwebtoken");
require("dotenv").config();

const token_User_Verify = (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  try {
    console.log("token_User_Verify");
    if (!token) {
      console.log("null");
      console.log(token);
      // next();
      // return res.json({login:false});
    } else {
      console.log("HI");
      const user = jwt.verify(token, process.env.SECRET_KEY);
      req.user = user;
      console.log(req.user + " USER " + user);
      next();
    }
  } catch (err) {
    console.log("error");
    // res.clearCookie("token");
    return res.redirect("/signup");
  }
};

module.exports = { token_User_Verify };
