import * as db from "../db/db.js";
import TenantModel from "../models/tenantModel.js";

export const saveTenant = async (req, res) => {
  console.log("in save tenant");

  try {
    await db.connect();
    console.log(req.body);
    const { ownerId, name } = req.body;
    const response = await new TenantModel({ ownerId, name }).save();
    return res.send({ response });
  } catch (error) {
    console.log(error);
  } finally {
    await db.disconnect();
  }
};
