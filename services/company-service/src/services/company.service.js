import CompanyModel from "../model/companyModel.js";
import { logger } from "../utils/logger.js";

//create company
export const createCompany = async (data) => {
  logger.info("creating company details with data " + data);
  try {
    const comapany = await new CompanyModel(data).save();
    return comapany;
  } catch (err) {
    console.log(err);
  }
};

export const getCompanyByTenantId = async (tenantId) => {
  logger.info("Get company details with tenant id " + tenantId);
  return await CompanyModel.findOne({ tenantId: tenantId }).populate("address").populate("bank");
};

export const updateCompanyDetails = async (data) => {
  logger.info("updating company details with data" + data);
  return await CompanyModel.findOneAndUpdate({ tenantId: data.tenantId }, data);
};
