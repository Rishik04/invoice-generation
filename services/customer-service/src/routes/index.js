import express from "express";
import { auth } from "../auth/auth.js";

const router = express.Router();

//company
router.get("/", auth, getCompany);
router.post("/add", auth, addCompany);
router.put("/update", auth, updateCompany);

export default router;
