const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const { projDb } = require("./db");
const config = require('../config')

const validateEmail = ip =>
  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(ip);

let userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      //unique: true,
      match: [/^[a-zA-Z0-9]+$/, "Username format is invalid"]
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: [
        {
          validator: ip => validateEmail(ip), // These can be array of validators with message
          message: "Invalid email"
        }
      ],
      required: "Email is required" // true or msg to be displayed,
      //unique: true
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 12,
      required: "Password is required"
    },
    role: {
      type: String,
      default: "user",
      enum: ["superadmin", "admin", "user"],
      lowercase: true
    },
    avatar:{
        type:String,
        default:'No avatar found'
    }
  },
  { timestamps: true, select: false }
);

userSchema.methods.toJSON = function() {
  // overriding toJSON and removing unnecessary fields when calling in resp.json
  const user = this;
  const userObj = user.toObject();
  const dispFields = ["email", "username", "role", "_id", 'avatar'];
  for (let key in userObj) {
    if (!dispFields.includes(key)) delete userObj[key];
  }
  return userObj;
};

userSchema.index({ email: 1 });

userSchema.methods.isValidPassword = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    console.log(err, "error occured");
    throw new Error(err);
  }
};

userSchema.pre("save", async function(next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

const Users = projDb.model(config.MODELS.user, userSchema);

module.exports = {
  Users
};
