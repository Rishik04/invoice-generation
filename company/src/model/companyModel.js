const mongoose = require("mongoose");

// Company Schema
const companySchema = new mongoose.Schema({
  name: String,
  address: String,
  gstin: String,
  email: String,
  phone: [String],
  state: String,
  stateCode: String,
  bankDetails: {
    name: String,
    branch: String,
    accountNumber: String,
    ifsc: String,
  },
  termsConditions: [String],
});

const Company = mongoose.model("Company", companySchema);
module.exports = Company;
