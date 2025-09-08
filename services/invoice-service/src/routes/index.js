import express from "express";
// import {
//   createInvoice,
//   generateInvoiceNumber,
// } from "../controller/pdf.controller.js";
import { generateInvoice } from "../controller/invoice.controller.js";
import { auth } from "../auth/auth.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("PDF Service running");
});

// router.post("/generate-invoice", createInvoice);
// router.get("/generate-invoice-number", generateInvoiceNumber);

// router.post("/invoice", auth, generateInvoice);

router.post("/save-invoice", auth, generateInvoice);

export default router;
