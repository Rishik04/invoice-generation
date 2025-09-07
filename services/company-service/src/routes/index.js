import express from "express";
import { auth } from "../auth/auth.js";
import {
  addCompany,
  getCompany,
  getCompanyById,
  updateCompany,
} from "../controllers/company.controller.js";
import { createAddress } from "../controllers/addresss.controller.js";
import { createBank } from "../controllers/bank.controller.js";
const router = express.Router();

router.get("/", auth, getCompany);
router.post("/add", auth, addCompany);
router.put("/update/:id", auth, updateCompany);
router.get("/:id", auth, getCompanyById);

router.post("/create-address", auth, createAddress);
router.post("/create-bank-details", auth, createBank);

export default router;
