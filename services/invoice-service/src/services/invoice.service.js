import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import CompanyCacheModel from "../model/company.cache.model.js";
import InvoiceModel from "../model/invoice.model.js";
import ProductCacheModel from "../model/product.cache.model.js";
import { sendCustomerEvent } from "./message.producer.js";

const IMAGE_PATH = path.join(process.cwd(), "src", "public", "images");

const generateHeader = (doc, company) => {
  const IMAGE_WIDTH = 150;
  const PAGE_WIDTH = doc.page.width;
  const MARGIN = 10;
  const IMAGE_HEIGHT = doc.y;
  doc
    .fontSize(10)
    // .font("bold")
    .text(`GSTIN: `, { align: "left", continued: true })
    // .font("normal")
    .text(`${company.gstin}`)
    // .font("bold")
    .text(`CUSTOMER COPY`, doc.x, IMAGE_HEIGHT, {
      align: "right",
      underline: true,
    })
    // .font("normal")
    .text(`${company.phone}`, doc.x, doc.y + 2, { align: "right" })
    // .font("bold")
    .text(`HM.No.: `, doc.x, doc.y - 10, { align: "left", continued: true })
    // .font("normal")
    .text(`${company.hallMarkNumber || ""}`)
    .moveDown();

  //bis and brand logo
  doc
    .image(path.join(IMAGE_PATH, "brand.png"), MARGIN, IMAGE_HEIGHT, {
      width: 130,
      align: "left",
    })
    .image(
      path.join(IMAGE_PATH, "hallmark.png"),
      PAGE_WIDTH - IMAGE_WIDTH - MARGIN,
      IMAGE_HEIGHT,
      { width: 130, align: "right" }
    );

  doc
    .fontSize(25)
    // .font("bold")
    .text(company.name.toUpperCase(), { align: "center", underline: true })
    // .font("normal")
    .fontSize(12)
    .text(company.address.street, { align: "center" })
    .fontSize(10)
    .text(`Email: ${company.email}`, { align: "center" })
    .moveDown(2);
};

const generateItemsTable = (doc, items = null) => {
  const tableConfig = {
    headers: [
      { text: "Type", width: 30, align: "center" },
      { text: "Description", width: 100, align: "center" },
      { text: "HSN Code", width: 40, align: "center" },
      { text: "Purity", width: 50, align: "center" },
      { text: "Gross Wt", width: 50, align: "center" },
      { text: "Rate", width: 50, align: "center" },
      { text: "Value", width: 50, align: "center" },
      { text: "Making Charges", width: 60, align: "center" },
      { text: "Other", width: 50, align: "center" },
      { text: "Amount", width: 80, align: "center" },
    ],
    columnSpacing: 2,
    rowHeight: 20,
    headerHeight: 30,
    margin: { left: 10, top: doc.y, right: 10 },
  };

  // Prepare table rows
  //   tableConfig.rows = items?.map((item) => {
  //     const totalRate = item.rate * item.grossWeight;
  //     const makingCharges = (totalRate * item.makingCharges) / 100;
  //     const totalCharges = makingCharges + (item.otherCharges || 0) + totalRate;

  //     return [
  //       item.type,
  //       item.description,
  //       item.hsnCode,
  //       item.purity,
  //       item.grossWeight.toFixed(3),
  //       formatMoney(item.rate),
  //       formatMoney(totalRate),
  //       formatMoney(makingCharges),
  //       item.otherCharges ? formatMoney(item.otherCharges) : "0.00",
  //       formatMoney(totalCharges),
  //     ];
  //   });

  //   // Calculate totals
  //   const totalAmount = parseFloat(calculateTotal(tableConfig.rows, 9));
  //   const totalWithGST = totalAmount + calculateGST(totalAmount, 1.5) * 2;

  // Draw table
  drawTableWithGrid(doc, tableConfig);

  // Draw totals section
  //   drawTotalsSection(doc, tableConfig, totalAmount, totalWithGST);
};

const drawTableWithGrid = (doc, config) => {
  const { headers, margin, rowHeight, headerHeight, columnSpacing } = config;

  // Calculate total width
  config.totalWidth =
    headers.reduce((sum, header) => sum + header.width + columnSpacing, 0) -
    columnSpacing;

  // Draw customer info box
  doc
    .moveTo(margin.left, margin.top - 120)
    .lineTo(margin.left + config.totalWidth, margin.top - 120)
    .lineTo(margin.left + config.totalWidth, margin.top)
    .lineTo(margin.left, margin.top)
    .lineTo(margin.left, margin.top - 120)
    .stroke();

  // Draw header background and borders
  doc.rect(margin.left, margin.top, config.totalWidth, headerHeight).stroke();

  // Draw header text and vertical lines
  let x = margin.left;
  //   doc.font("bold");

  headers.forEach((header, i) => {
    // Vertical line
    doc
      .moveTo(x, margin.top)
      .lineTo(x, margin.top + headerHeight + 3 * rowHeight)
      .stroke();

    // Header text
    doc.text(header.text, x + 2, margin.top + 5, {
      width: header.width - 4,
      align: header.align,
    });

    x += header.width + columnSpacing;
  });

  // Final vertical line
  doc
    .moveTo(x - columnSpacing, margin.top)
    .lineTo(x - columnSpacing, margin.top + headerHeight + 3 * rowHeight)
    .stroke();

  //   doc.font("normal");

  let row = [1, 2, 3];

  // Draw rows with horizontal lines
  let y = margin.top + headerHeight;
  row.forEach((row) => {
    // Horizontal line
    doc
      .moveTo(margin.left, y)
      .lineTo(margin.left + config.totalWidth, y)
      .stroke();

    // Row content
    x = margin.left;
    // row.forEach((cell, colIndex) => {
    //   doc.text(cell, x + 2, y + 5, {
    //     width: headers[colIndex].width - 4,
    //     align: headers[colIndex].align,
    //   });
    //   x += headers[colIndex].width + columnSpacing;
    // });

    y += rowHeight;
    doc.y = y;
  });

  // Final horizontal line
  doc
    .moveTo(margin.left, y)
    .lineTo(margin.left + config.totalWidth, y)
    .stroke();
};

const drawTotalsSection = (doc, config, totalAmount, totalWithGST) => {
  const { margin, totalWidth, rowHeight } = config;
  let y =
    margin.top +
    config.headerHeight +
    config.rows.length * rowHeight +
    rowHeight;

  // Vertical line
  doc
    .moveTo(margin.left, margin.top)
    .lineTo(margin.left, y + 65)
    .stroke();

  doc
    .moveTo(margin.left + totalWidth, margin.top)
    .lineTo(margin.left + totalWidth, y + 65)
    .stroke();

  doc.font("bold");

  // Total row
  y -= 10;
  doc.text("Total", margin.left + 2, y, { align: "left" });
  doc.text(calculateTotal(config.rows, 4), margin.left + 240, y, {
    align: "left",
  });
  doc.text(calculateTotal(config.rows, 7), margin.left + 395, y, {
    align: "left",
  });
  doc.text(formatMoney(totalAmount), margin.left + totalWidth - 62, y, {
    align: "right",
  });

  // Horizontal line
  doc
    .moveTo(margin.left, y + 15)
    .lineTo(margin.left + totalWidth, y + 15)
    .stroke();

  // Tax breakdown
  y += rowHeight;
  const gstAmount = calculateGST(totalAmount, 1.5);

  doc.text("SGST: 1.50%", margin.left, y, {
    width: totalWidth - 90,
    align: "right",
  });
  doc.text(formatMoney(gstAmount), margin.left + totalWidth - 62, y, {
    align: "right",
  });

  y += rowHeight;
  doc.text("CGST: 1.50%", margin.left, y, {
    width: totalWidth - 90,
    align: "right",
  });

  // vertical line amount with gst
  doc
    .moveTo(margin.left + totalWidth - 80, margin.top)
    .lineTo(margin.left + totalWidth - 80, y + 35)
    .stroke();

  doc.text(formatMoney(gstAmount), margin.left + totalWidth - 62, y, {
    align: "right",
  });

  // Final total with GST
  doc
    .moveTo(margin.left, y + 15)
    .lineTo(margin.left + totalWidth, y + 15)
    .stroke();

  y += rowHeight;
  doc.text("Total Amt. With Tax.", margin.left, y, {
    width: totalWidth - 90,
    align: "right",
  });
  doc.text(formatMoney(totalWithGST), margin.left + totalWidth - 62, y, {
    align: "right",
  });

  // Amount in words
  doc
    .fontSize(8)
    .text(convertAmountToIndianWords(totalWithGST), margin.left + 2, y);

  doc
    .moveTo(margin.left, y + 15)
    .lineTo(margin.left + totalWidth, y + 15)
    .stroke();

  TOTAL_AMOUNT = totalWithGST.toFixed(2);
};

const generateFooter = (doc, company) => {
  // Terms and conditions
  doc.x = 10;
  let y = 0;
  doc.moveDown(2).fontSize(8).text("Terms & Conditions:", { underline: true });
  company.termsConditions.forEach((term, index) => {
    doc.text(`${index + 1}. ${term}`);
    y += 2;
  });

  doc.y += y;
  // Authorized signatory
  doc
    .moveDown(2)
    .text(`FOR ${company.name.toUpperCase()}`, { align: "right" })
    .moveDown(1)
    .text("Authorized Signatory", { align: "right" });

  // Add logo if exists
  const logoPath = path.join(IMAGE_PATH, "logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 490, doc.y - 70, { width: 100, align: "center" });
  }

  // Bank details
  if (company.bank) {
    const HEIGHT = doc.y + 15;
    const LEFT = doc.x;

    doc
      .moveTo(LEFT, HEIGHT)
      .lineTo(LEFT + 200, HEIGHT)
      .lineTo(LEFT + 200, HEIGHT + 70)
      .lineTo(LEFT, HEIGHT + 70)
      .lineTo(LEFT, HEIGHT)
      .stroke();

    doc
      .moveTo(15, HEIGHT)
      .moveDown(2)
      .fontSize(8)
      .text("Bank Details:", LEFT + 70, HEIGHT + 10, { underline: true })
      .text(`Bank Name: ${company.bank.bankName}`, LEFT + 10, HEIGHT + 22)
      .text(`Branch: ${company.bank.branch}`)
      .text(`A/c No: ${company.bank.accountNumber}`)
      .text(`IFSC Code: ${company.bank.ifsc}`);
  }

  // Final footer
  doc
    .moveDown(2)
    .fontSize(10)
    .text('"MOST TRUSTED JEWELLERS"', { align: "center" })
    .text("THANK YOU, VISIT AGAIN", { align: "center" });
};

export const generateInvoicePDF = async (tenantId) => {
  const company = await CompanyCacheModel.findOne({ tenantId }).lean();

  if (!company) {
    throw new Error("Company not found");
  }
  const doc = new PDFDocument({ size: "A4", margin: 10, layout: "portrait" });

  // File name & path
  const fileName = `invoice_${Date.now()}.pdf`;
  const filePath = path.join(
    process.cwd(),
    "src",
    "public",
    "invoices",
    fileName
  );

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  generateHeader(doc, company);
  generateItemsTable(doc);
  generateFooter(doc, company);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve({ filePath, fileName }));
    stream.on("error", reject);
  });
};

//save invoice in db
export const saveInvoiceInDB = async (tenantId, data) => {
  const company = await CompanyCacheModel.findOne({ tenantId: tenantId });
  const products = await ProductCacheModel.find({ tenantId: tenantId });

  const { items, customer } = data;
  const invoiceNumber = await createInvoiceNumber();

  const customerData = {
    ...customer,
    tenantId,
    companyId: company._id,
    invoiceNumber: invoiceNumber,
  };

  await sendCustomerEvent("customer.create.command", customerData);

  const invoiceItems = items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    return {
      productId: product._id,
      name: product.name,
      category: product.category,
      karat: product.karat,
      hsnNumber: product.hsnNumber,
      weight: item.weight,
      quantity: item.quantity,
      rate: item.rate,
      total: item.weight * item.quantity * item.rate,
    };
  });

  const updatedData = {
    ...data,
    companyId: company._id,
    tenantId,
    total: 106702,
    tax: 2,
    invoiceNumber: invoiceNumber,
    items: invoiceItems,
  };
  const invoice = await InvoiceModel(updatedData).save();
  return invoice;
};

const createInvoiceNumber = async () => {
  const invoiceNumber = await InvoiceModel.countDocuments();
  const index = invoiceNumber + 1;
  return `INV_${index}`;
};

export const updateCustomerData = async (data) => {
  console.log(data)
  const { invoiceNumber, _id } = data;
  const invoice = await InvoiceModel.findOneAndUpdate(
    { invoiceNumber },
    { $set: { "customer._id": _id } },
    { new: true }
  );
  return invoice;
};
