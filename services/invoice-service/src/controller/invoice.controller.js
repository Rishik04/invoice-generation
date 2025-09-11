import { errorResponse } from "../response/response.js";
import {
  generateInvoicePDF,
  saveInvoiceInDB,
} from "../services/invoice.service.js";
import { createPDF } from "../services/pdf.service.js";

export const generateInvoice = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const invoice = await saveInvoiceInDB(tenantId, req.body);
    if (invoice) {
      const { filePath, fileName } = await createPDF(invoice);
      res.download(filePath, fileName);
      // res.send({ data: invoice });
    }
  } catch (err) {
    console.log(err);
    return errorResponse(res, 400, "unable to generate invoice", err);
  }
};
