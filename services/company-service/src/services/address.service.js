import AddressModel from "../model/addressModel.js";
import CompanyModel from "../model/companyModel.js";
import { logger } from "../utils/logger.js";
import { sendCompanyEvent } from "./message.producer.js";

//create the address
export const createAddressInDB = async (data) => {
  logger.info("create address with tenant id" + data.tenantId);
  try {
    const address = await new AddressModel(data).save();
    logger.info("update company with address id" + address._id);
    await CompanyModel.findOneAndUpdate(
      { tenantId: data.tenantId },
      { address: address._id }
    );
    return address;
  } catch (err) {
    console.log(err);
  }
};

//update address details
export const updateAddressInDB = async (id, data) => {
  logger.info("updating address details with id " + id);
  const address = await AddressModel.findByIdAndUpdate(id, data, { new: true });
  const company = await CompanyModel.findOne({ address: address._id })
    .populate("address")
    .populate("bank");
  await sendCompanyEvent("company.updated", company.toObject());
  return address;
};
