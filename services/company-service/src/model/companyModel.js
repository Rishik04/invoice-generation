import mongoose from "mongoose";

// Company Schema
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bank",
  },
  gstin: {
    type: String,
    unique: true,
    sparse: true,
  },
  hallMarkNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
  },
  phone: [String],
  termsConditions: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
});

const CompanyModel = mongoose.model("Company", companySchema);

export default CompanyModel;
