import { errorResponse, successResponse } from "../response/response.js";
import { createAddressInDB } from "../services/address.service.js";
import { logger } from "../utils/logger.js";

export const createAddress = async (req, res) => {
  logger.info("Creating the address for tenant");
  try {
    const data = { ...req.body, tenantId: req.user.tenantId };
    const response = await createAddressInDB(data);
    if (response) {
      return successResponse(res, 200, "added address", response);
    } else {
      return errorResponse(res, 400, "unable to add address", {});
    }
  } catch (err) {
    console.log(err);
  }
};
