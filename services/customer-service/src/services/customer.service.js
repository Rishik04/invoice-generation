import CustomerModel from "../model/customer.model.js";
import { logger } from "../utils/logger.js";
import { sendCustomerEvent } from "./message.producer.js";

export const createCustomerInDB = async (data) => {
  logger.info("Create customer with data " + data.toString());
  // const profiles = await getCustomerProfilesByNumber(data);
  const { invoiceNumber } = data;
  data = {
    ...data,
    createdAt: Date.now(),
  };
  const customer = await new CustomerModel(data).save();
  const updatedData = { _id: customer._id, invoiceNumber };
  await sendCustomerEvent("customer.created", updatedData);
  return customer;
};

//later is required
// const getCustomerProfilesByNumber = async (data) => {
//   logger.info("Create customer profile with data " + data.toString());
//   const { number, address, name } = data;
//   const customer = await CustomerModel.findOne({ phoneNumber: number });
//   if (!customer) {
//     return [{ name, address }];
//   }
//   const profiles = customer.profiles;

//   let existingProfile = profiles.find(
//     (item) => item.name === name && item.address === address
//   );

//   if (!existingProfile) {
//     const newProfile = { name, address };
//     profiles.push(newProfile);
//     existingProfile = newProfile;
//   }
//   return profiles;
// };

//get all products of the company
// export const getAllProductsFromDB = async (data) => {
//   logger.info("Get all products for tenant id " + data.id);
//   return await ProductModel.find({ tenantId: data.tenantId });
// };

// //get all products by the type
// export const getProductsByTypeFromDB = async ({ tenantId, type }) => {
//   logger.info("Get products for category " + type);
//   return await ProductModel.find({ tenantId: tenantId, type: type });
// };
