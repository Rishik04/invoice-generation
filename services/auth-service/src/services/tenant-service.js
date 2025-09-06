import axios from "axios";
import { TENANT_SERVICE_URL } from "../configs/config.js";

export const createTenant = async (name) => {
  try {
    const tenant = await axios.post(TENANT_SERVICE_URL + "/tenant", {
      name,
    });
    console.log(tenant.data);
    return tenant.data;
  } catch (err) {
    console.log(err);
  }
};

export const getTenantId = async (slug) => {
  try {
    const tenant = await axios.get(TENANT_SERVICE_URL + `/tenant/${slug}`);
    console.log(tenant.data);
    return tenant.data;
  } catch (err) {
    console.log(err);
  }
};
