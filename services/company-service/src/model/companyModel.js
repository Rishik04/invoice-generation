import mongoose from "mongoose";

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
  hallMarkNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const CompanyModel = mongoose.model("Company", companySchema);

export default CompanyModel;
