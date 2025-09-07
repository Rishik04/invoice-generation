import BankModel from "../model/bankModel.js";
import CompanyModel from "../model/companyModel.js";
import { logger } from "../utils/logger.js";

//create the bank
export const createBankInDB = async (data) => {
  logger.info("creating bank deatils with tenant id " + data.tenantId);
  try {
    const bank = await new BankModel(data).save();
    logger.info("updating company deatils with bank id " + bank._id);
    await CompanyModel.findOneAndUpdate(
      { tenantId: data.tenantId },
      { bank: bank._id }
    );
    return bank;
  } catch (err) {
    console.log(err);
  }
};

//update bank details
export const updateBankInDB = async (id, data) => {
  logger.info("updating bank details with id " + id);
  return await BankModel.findByIdAndUpdate(id, data);
};
