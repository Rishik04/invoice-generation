import TenantModel from "../models/tenantModel.js";
import { emitTenantCreated } from "../services/message-producer.js";

export const saveTenant = async (req, res) => {
  console.log("in save tenant");

  try {
    const { name } = req.body;
    const slug = createSlug(name);
    const response = await new TenantModel({ slug, name }).save();
    await emitTenantCreated(response);
    return res.send({ response });
  } catch (error) {
    console.log(error);
  }
};

export const createSlug = (companyName) => {
  if (!companyName) return "";

  // Words to remove
  const stopWords = ["pvt", "ltd", "co", "llp", "private", "limited", "&"];

  // Split, filter, lowercase, and join with "-"
  const slug = companyName
    .toString()
    .split(/\s+/) // Split by spaces
    .filter((word) => !stopWords.includes(word.toLowerCase())) // Remove stop words
    .map((word) => word.toLowerCase()) // Lowercase remaining
    .join("-"); // Join with dash

  return slug;
};

export const getTenanyBySlug = async (req, res) => {
  try {
    const tenant = await TenantModel.findOne({ slug: req.params.slug });
    res.send({ tenantId: tenant._id });
  } catch (err) {
    console.log(err);
  }
};

//only owner can update slug
