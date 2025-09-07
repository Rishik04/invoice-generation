import { logger } from "../utils/logger.js";
import ProductModel from "../model/product.model.js";
import CompanyModel from "../model/companyModel.js";

export const createProductInDB = async (product) => {
  logger.info("Create product with data " + product);
  const company = await CompanyModel.findOne({ tenantId: product.tenantId });
  const updatedProduct = { ...product, companyId: company._id };
  return await ProductModel(updatedProduct).save();
};

//get all products of the company
export const getAllProducts = async (data) => {
  logger.info("Get all products for tenant id " + data.id);
  return await ProductModel.find({ tenantId: data.tenantId });
};
