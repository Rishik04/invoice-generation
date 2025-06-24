const express = require("express");
const { createInvoice, generateInvoiceNumber } = require("../controller/pdfController");

const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("PDF Service running");
});

router.post("/generate-invoice", createInvoice);
router.get("/generate-invoice-number", generateInvoiceNumber);

module.exports = router;
