import mongoose from "mongoose";

// customer Schema
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    unique: true,
  },
  email: {
    type: String,
  },
  //later if required
  // profiles: [
  //   {
  //     name: {
  //       type: String,
  //       required: true,
  //     },
  //     address: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CustomerModel = mongoose.model("Customer", customerSchema);

export default CustomerModel;
