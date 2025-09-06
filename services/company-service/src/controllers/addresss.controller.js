import { errorResponse, successResponse } from "../response/response";
import { createAddressInDB } from "../services/address.service";

export const createAddress = async (req, res) => {
  try {
    const data = req.body;
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
