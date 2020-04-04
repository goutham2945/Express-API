const JWT = require("jsonwebtoken");

const config = require("../config");
const { Users } = require("../models/users");

// To write own middlewares in es6 
// https://gist.github.com/Curtis017/ce072208f5160e8c24b77cc662f10fec
// https://www.youtube.com/watch?v=RADJjGLsi6I

const loginRequired = async (req, resp, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      resp.status(401).push(false, "Authentication required", null);
    }
    const token = authorization.split(/\s+/).pop() || "";
    const decToken = JWT.verify(token, config.JWT_SECRET);
    const user = await Users.findOne({ email: decToken.email });
    req.user = user;
    next();
  } catch (err) {
    resp.status(401).push(false, err.message || "Invalid credentials", null);
  }
};

const checkPermissions = roles => {
  return (req, resp, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      resp.status(403).push(false, "Unnauthorised permissions", null);
    }
  };
};

module.exports = {
    loginRequired,
    checkPermissions
}
