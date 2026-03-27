const jwt = require("jsonwebtoken");
const env = require("../config/env");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid authorization header." });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.auth = { userId: payload.userId, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
