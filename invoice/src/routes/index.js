const express = require("express");
const { createInvoice } = require("../controller/invoiceController");

const router = require("express").Router();

router.post("/generate-invoice", createInvoice);

module.exports = router;
