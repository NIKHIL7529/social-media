const jwt = require("jsonwebtoken");
require("dotenv").config();

const token_User_Verify = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Token:", token);

  try {
    console.log("Verifying token...");
    if (!token) {
      console.log("Token is missing.");
      return res.status(401).json({ status: 401 }); // Redirect to login if token is missing
    }

    const user = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Token verified successfully.");
    req.user = user;
    next(); // Proceed to the next middleware
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.clearCookie("token"); // Clear invalid token from cookies
    return res.status(401).json({ status: 401 }); // Redirect to login if token verification fails
  }
};

module.exports = { token_User_Verify };
