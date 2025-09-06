import AddressModel from "../model/addressModel.js";

//create the address
export const createAddressInDB = async (data) => {
  try {
    return await new AddressModel({ data }).save();
  } catch (err) {
    console.log(err);
  }
};
