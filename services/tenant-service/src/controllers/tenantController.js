import TenantModel from "../models/tenantModel.js";

export const saveTenant = async (req, res) => {
  try {
    const { name } = req.body;
    const response = await new TenantModel(body).save();
    return response;
  } catch (error) {
    console.log(error);
  }
};
