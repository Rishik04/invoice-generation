const e = require("express");
const mongoose = require("mongoose");

const User = mongoose.Schema({
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const UserModel = mongoose.model("User", User);
exports.UserModel = UserModel;