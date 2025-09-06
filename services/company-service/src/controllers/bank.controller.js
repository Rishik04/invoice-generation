import { errorResponse, successResponse } from "../response/response";
import { createBankInDB } from "../services/bank.service";

export const createBank = async (req, res) => {
  try {
    const data = req.body;
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
