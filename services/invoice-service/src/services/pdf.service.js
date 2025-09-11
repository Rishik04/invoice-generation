import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import CompanyCacheModel from "../model/company.cache.model.js";
import { convertAmountToIndianWords } from "../utils/converision.js";

const IMAGE_PATH = path.join(process.cwd(), "src", "public", "images");
let TOTAL_AMOUNT;

const DEFAULT_FONTS = {
  Normal: path.join(process.cwd(), "src", "public", "fonts", "arial.ttf"),
  Bold: path.join(process.cwd(), "src", "public", "fonts", "ARIALBD.ttf"),
};

const generateHeader = (doc, company) => {
  const IMAGE_WIDTH = 150;
  const PAGE_WIDTH = doc.page.width;
  const MARGIN = 10;
  const IMAGE_HEIGHT = doc.y;
  doc
    .fontSize(10)
    .font("bold")
    .text(`GSTIN: `, { align: "left", continued: true })
    .font("normal")
    .text(`${company.gstin}`)
    .font("bold")
    .text(`CUSTOMER COPY`, doc.x, IMAGE_HEIGHT, {
      align: "right",
      underline: true,
    })
    .font("normal")
    .text(`${company.phone}`, doc.x, doc.y + 2, { align: "right" })
    .font("bold")
    .text(`HM.No.: `, doc.x, doc.y - 10, { align: "left", continued: true })
    .font("normal")
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
    .font("bold")
    .text(company.name.toUpperCase(), { align: "center", underline: true })
    .font("normal")
    .fontSize(12)
    .text(company.address.street, { align: "center" })
    .fontSize(10)
    .text(`Email: ${company.email}`, { align: "center" })
    .moveDown(2);
};


const generateCustomerInfo = (doc, customer, date) => {
  const COLUMN_HEIGHT = doc.y - 2;

  doc
    .font("bold")
    .fontSize(10)
    .text("Customer Name & Address:", 12, doc.y - 5, { underline: true })
    .moveDown()
    .text(customer.name, 12, doc.y)
    .font("normal")
    .text(customer.address, 12, doc.y)
    .text(`Ph # ${customer.phone}`, 12, doc.y)
    .moveDown(2)
    .text(`State: ${customer.state}`)
    .text(`Code: ${customer.stateCode}`)
    .moveDown();

  //generate invoice number and date
  doc
    .moveTo(320, COLUMN_HEIGHT - 10)
    .lineTo(320, doc.y - 5)
    .stroke();

  // Set your fonts (ensure they are registered correctly if custom)

  // Y position to align the first row
  const infoY = COLUMN_HEIGHT;

  // Bill No
  doc
    .font("bold")
    .text("Bill No: ", 325, infoY, { continued: true })
    .font("normal")
    .text("123");

  // Date (below Bill No)
  doc
    .font("bold")
    .text("Date: ", 450, doc.y - 10, { continued: true })
    .font("normal")
    .text(date);

  // YEAR (below Date)
  const year = new Date(date).getFullYear();
  doc
    .font("bold")
    .text("YEAR: ", 325, doc.y + 5, { continued: true })
    .font("normal")
    .text(`${year}-${year + 1}`);

  doc
    .moveTo(320, doc.y + 5)
    .lineTo(doc.page.width - 7, doc.y + 5)
    .stroke();

  // Consignee Details
  doc.font("bold").text("Consignee Details :", 325, doc.y + 6);

  doc
    .moveTo(320, doc.y + 2)
    .lineTo(doc.page.width - 7, doc.y + 2)
    .stroke();

  // Customer details
  doc
    .font("bold")
    .text(`${customer.name}`, 325, doc.y + 5)
    .font("normal")
    .text(`${customer.address}`, 325, doc.y + 10)
    .text(`Ph # ${customer.phone}`, 325, doc.y + 10);

  doc.y = COLUMN_HEIGHT + 110; // Adjust y position for the table
};

const generateItemsTable = (doc, items) => {
  const tableConfig = {
    headers: [
      { text: "Type", width: 30, align: "center" },
      { text: "Description", width: 100, align: "center" },
      { text: "HSN Code", width: 40, align: "center" },
      { text: "Purity", width: 40, align: "center" },
      { text: "Gross Wt", width: 40, align: "center" },
      { text: "Rate", width: 60, align: "center" },
      { text: "Value", width: 60, align: "center" },
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
  tableConfig.rows = items?.map((item) => {
    const totalRate = item.rate/10 * item.weight;
    const makingCharges = (totalRate * item.makingCharges) / 100;
    const totalCharges = makingCharges + (item.otherCharges || 0) + totalRate;

    return [
      item.category,
      item.name,
      item.hsnNumber,
      item.karat,
      item.weight.toFixed(3),
      formatMoney(item.rate),
      formatMoney(totalRate),
      formatMoney(makingCharges),
      item.otherCharges ? formatMoney(item.otherCharges) : "0.00",
      formatMoney(totalCharges),
    ];
  });

  // Calculate totals
  const totalAmount = parseFloat(calculateTotal(tableConfig.rows, 9));
  const totalWithGST = totalAmount + calculateGST(totalAmount, 1.5) * 2;

  // Draw table
  drawTableWithGrid(doc, tableConfig);

  // Draw totals section
  drawTotalsSection(doc, tableConfig, totalAmount, totalWithGST);
};

const drawTableWithGrid = (doc, config) => {
  const { headers, margin, rowHeight, headerHeight, rows, columnSpacing } =
    config;

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
  doc.font("bold");

  headers.forEach((header, i) => {
    // Vertical line
    doc
      .moveTo(x, margin.top)
      .lineTo(x, margin.top + headerHeight + rows.length  * rowHeight)
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
    .lineTo(x - columnSpacing, margin.top + headerHeight + rows.length * rowHeight)
    .stroke();

  doc.font("normal");

  // Draw rows with horizontal lines
  let y = margin.top + headerHeight;
  rows.forEach((row) => {
    // Horizontal line
    doc
      .moveTo(margin.left, y)
      .lineTo(margin.left + config.totalWidth, y)
      .stroke();

    // Row content
    x = margin.left;
    row.forEach((cell, colIndex) => {
      doc.text(cell, x + 2, y + 5, {
        width: headers[colIndex].width - 4,
        align: headers[colIndex].align,
      });
      x += headers[colIndex].width + columnSpacing;
    });

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
  const { margin, totalWidth, rowHeight, rows } = config;
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

const formatMoney = (value) => {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

const calculateGST = (value, gstPercentage) => (value * gstPercentage) / 100;

const calculateTotal = (rows, columnIndex) => {
  return rows
    .reduce((sum, row) => sum + parseFloat(row[columnIndex]), 0)
    .toFixed(2);
};

export const createPDF = async (invoice) => {
  const company = await CompanyCacheModel.findById(invoice.companyId).lean();

  if (!company) {
    throw new Error("Company not found");
  }
  const doc = new PDFDocument({ size: "A4", margin: 10, layout: "portrait" });

  doc.registerFont("normal", DEFAULT_FONTS.Normal);
  doc.registerFont("bold", DEFAULT_FONTS.Bold);

  // File name & path
  const fileName = `${invoice.invoiceNumber}.pdf`;
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
  generateCustomerInfo(doc, invoice.customer, Date.now())
  generateItemsTable(doc, invoice.items);
  generateFooter(doc, company);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve({ filePath, fileName }));
    stream.on("error", reject);
  });
};

// export const createPDF = (invoice) => {};
