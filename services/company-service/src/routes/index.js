import express from "express";
import { auth } from "../auth/auth.js";
import {
  addCompany,
  getCompany,
  getCompanyById,
  updateCompany,
} from "../controllers/company.controller.js";
const router = express.Router();

router.get("/", auth, getCompany);
router.post("/add", auth, addCompany);
router.put("/update/:id", auth, updateCompany);
router.get("/:id", auth, getCompanyById);

export default router;
