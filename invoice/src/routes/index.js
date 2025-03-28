const express = require("express");
const { createInvoice } = require("../controller/invoiceController");

const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("PDF Service running");
});

router.post("/generate-invoice", createInvoice);

module.exports = router;
