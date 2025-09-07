import express from "express";
import {
  createInvoice,
  generateInvoiceNumber,
} from "../controller/pdf.controller.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("PDF Service running");
});

router.post("/generate-invoice", createInvoice);
router.get("/generate-invoice-number", generateInvoiceNumber);

export default router;
