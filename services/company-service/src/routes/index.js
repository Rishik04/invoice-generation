import express from "express";
import { auth } from "../auth/auth.js";
import {
  createAddress,
  updateAddress,
} from "../controllers/addresss.controller.js";
import { createBank, updateBank } from "../controllers/bank.controller.js";
import {
  addCompany,
  getCompany,
  updateCompany
} from "../controllers/company.controller.js";
import {
  createProduct,
  getProducts,
  getProductsByType
} from "../controllers/product.controller.js";
const router = express.Router();

//company
router.get("/", auth, getCompany);
router.post("/add", auth, addCompany);
router.put("/update", auth, updateCompany);
// router.get("/:id", auth, getCompanyById);

//address routes
router.post("/create-address", auth, createAddress);
router.put("/update-address/:id", auth, updateAddress);

//bank routes
router.post("/create-bank-details", auth, createBank);
router.put("/update-bank-details/:id", auth, updateBank);

//product routes
router.post("/add-product", auth, createProduct);
router.get("/get-products", auth, getProducts);
router.get("/get-products/:type", auth, getProductsByType);

export default router;
