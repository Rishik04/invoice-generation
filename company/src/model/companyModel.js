const mongoose = require("mongoose");

// Company Schema
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  address: String,
  gstin: {
    type: String,
    required: true,
    unique: true,
  },
  hallMarkNumner: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: [String],
  state: String,
  stateCode: String,
  bankDetails: {
    name: String,
    branch: String,
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ifsc: String,
  },
  termsConditions: [String],
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
