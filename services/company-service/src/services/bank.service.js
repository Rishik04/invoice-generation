import BankModel from "../model/bankModel.js";

//create the bank
export const createBankInDB = async (data) => {
  try {
    return await new BankModel({ data }).save();
  } catch (err) {
    console.log(err);
  }
};
