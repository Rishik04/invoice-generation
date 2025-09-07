import { errorResponse, successResponse } from "../response/response.js";
import { createProductInDB, getAllProducts } from "../services/product.service.js";
import { logger } from "../utils/logger.js";

export const createProduct = async (req, res) => {
  logger.info("create product with tenant id");
  try {
    const data = { ...req.body, tenantId: req.user.tenantId };
    const response = await createProductInDB(data);
    if (response) {
      return successResponse(res, 200, "added product", response);
    } else {
      return errorResponse(res, 400, "unable to add product", {});
    }
  } catch (err) {
    console.log(err);
  }
};

export const getProducts = async (req, res) => {
  logger.info("create product with tenant id");
  try {
    const data = { ...req.body, tenantId: req.user.tenantId };
    const response = await getAllProducts(data);
    if (response) {
      return successResponse(res, 200, "fetched product", response);
    } else {
      return errorResponse(res, 400, "unable to fetch product", {});
    }
  } catch (err) {
    console.log(err);
  }
};

