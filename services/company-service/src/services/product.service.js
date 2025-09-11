import { logger } from "../utils/logger.js";
import ProductModel from "../model/product.model.js";
import CompanyModel from "../model/companyModel.js";
import { sendProductEvent } from "./message.producer.js";

export const createProductInDB = async (product) => {
  logger.info("Create product with data " + product);
  const company = await CompanyModel.findOne({ tenantId: product.tenantId });
  const updatedProduct = { ...product, companyId: company._id };
  const productFromDB = await ProductModel(updatedProduct).save();
  await sendProductEvent("product.created", productFromDB.toObject());
  return productFromDB;
};

//get all products of the company
export const getAllProductsFromDB = async (data) => {
  logger.info("Get all products for tenant id " + data.id);
  return await ProductModel.find({ tenantId: data.tenantId });
};

//get all products by the type
export const getProductsByTypeFromDB = async ({ tenantId, type }) => {
  logger.info("Get products for category " + type);
  return await ProductModel.find({ tenantId: tenantId, type: type });
};
