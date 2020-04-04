const path = require('path');
const JWT = require("jsonwebtoken");

const config = require("../config");
const { Users } = require("../models/users");

const signIn = async (req, resp) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    // if no user with email or invalid password
    if (!user || !(await user.isValidPassword(password))) {
      resp.status(401).push(false, "Invalid credentials", {});
    }
    resp.push(true, "User found", user);
  } catch (err) {
    resp.status(400).push(false, err.message, {});
  }
};
const signUp = async (req, resp) => {
  try {
    req.body.avatar = req.avatar ? `${config.AVATARS_PATH}${req.avatar}` : null
    const user = new Users(req.body);
    await user.save();
    // resp.json(user) by default resp.json will call user.toJSON() method so u dont want to want to call explicuty user.toJSON()
    const token = JWT.sign(user.toJSON(), config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRY_TIME
    });
    resp.status(201).push(true, "User created successfully", { user, token });
  } catch (err) {
    resp.status(400).push(false, err.message, {});
  }
};

const getUsers = async (req, resp) => {
  const perPage = req.query.perpage ? parseInt(req.query.perpage) : 10;
  const pageNo = req.query.page ? parseInt(req.query.page) : 1;
  const users = await Users.find({})
    .skip((pageNo - 1) * perPage)
    .limit(perPage)
    .sort({createdAt: 1})
  resp.status(200).push(true, "Success", users);
};

module.exports = {
  signIn,
  signUp,
  getUsers
};
