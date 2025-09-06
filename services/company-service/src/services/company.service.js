import CompanyModel from "../model/companyModel.js";

//create company
export const createCompany = async (data) => {
  try {
    const comapany = await new CompanyModel(data).save();
    return comapany;
  } catch (err) {
    console.log(err);
  }
};

export const getCompanyByTenantId = async (tenantId) => {
  return await CompanyModel.findOne({ tenantId: tenantId });
};
