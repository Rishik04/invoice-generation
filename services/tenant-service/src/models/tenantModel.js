import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const TenantModel = mongoose.model("Tenant", tenantSchema);

export default TenantModel
