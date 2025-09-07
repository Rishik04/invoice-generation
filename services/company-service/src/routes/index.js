import express from "express";
import { auth } from "../auth/auth.js";
import {
  addCompany,
  getCompany,
  getCompanyById,
  updateCompany,
} from "../controllers/company.controller.js";
import { createAddress, updateAddress } from "../controllers/addresss.controller.js";
import { createBank, updateBank } from "../controllers/bank.controller.js";
const router = express.Router();

//company
router.get("/", auth, getCompany);
router.post("/add", auth, addCompany);
router.put("/update", auth, updateCompany);
router.get("/:id", auth, getCompanyById);

//address routes
router.post("/create-address", auth, createAddress);
router.put("/update-address/:id", auth, updateAddress);

//bank routes
router.post("/create-bank-details", auth, createBank);
router.put("/update-bank-details/:id", auth, updateBank);

export default router;
