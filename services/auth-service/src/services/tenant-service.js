import axios from "axios";
import { TENANT_SERVICE_URL } from "../configs/config";

export const createTenant = async (ownerId, name) => {
  try {
    const tenant = await axios.post(TENANT_SERVICE_URL + "/tenant", {
      ownerId,
      name,
    });
    return tenant;
  } catch (err) {
    console.log(err);
  }
};
