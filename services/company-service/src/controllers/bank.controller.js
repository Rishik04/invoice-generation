import { errorResponse, successResponse } from "../response/response.js";
import { createBankInDB } from "../services/bank.service.js";
import { logger } from "../utils/logger.js";

export const createBank = async (req, res) => {
  logger.info("create bank with tenant id");
  try {
    const data = { ...req.body, tenantId: req.user.tenantId };
    const response = await createBankInDB(data);
    if (response) {
      return successResponse(res, 200, "added bank", response);
    } else {
      return errorResponse(res, 400, "unable to add bank", {});
    }
  } catch (err) {
    console.log(err);
  }
};
