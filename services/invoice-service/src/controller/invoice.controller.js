import { errorResponse } from "../response/response.js";
import {
  generateInvoicePDF,
  saveInvoiceInDB,
} from "../services/invoice.template.service.js";

export const generatePDF = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { filePath, fileName } = await generateInvoicePDF(tenantId);
    res.download(filePath, fileName);
  } catch (err) {
    console.log(err);
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const invoice = await saveInvoiceInDB(tenantId, req.body);
    if (invoice) {
      res.send({ data: invoice });
    }
  } catch (err) {
    console.log(err)
    return errorResponse(res, 400, "unable to generate invoice", err);
  }
};
