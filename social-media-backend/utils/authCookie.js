const getAuthCookieOptions = (req) => {
  const forwardedProtocol = req.get("x-forwarded-proto");
  const secure = req.secure || forwardedProtocol === "https";

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
  };
};

module.exports = { getAuthCookieOptions };
