import express from "express";
import { auth } from "../auth/auth.js";
import {
  addCompany,
  getCompanyByEmail,
  getCompanyById,
  updateCompany,
} from "../controllers/companyController.js";
const router = express.Router();

router.get("/", auth, getCompanyByEmail);
router.post("/add", auth, addCompany);
router.put("/update/:id", auth, updateCompany);
router.get("/:id", auth, getCompanyById);

export default router;
