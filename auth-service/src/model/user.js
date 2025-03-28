const e = require("express");
const mongoose = require("mongoose");

const User = mongoose.Schema({
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company: [{ type: mongoose.Schema.Types.ObjectId, ref: "Company" }],
});

const UserModel = mongoose.model("User", User);
exports.UserModel = UserModel;