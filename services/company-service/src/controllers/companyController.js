import CompanyModel from "../model/companyModel.js";
import { errorResponse, successResponse } from "../response/response.js";

// Check if the user is authorized to access this company
const userAuthorized = (req) => {
  const authorizedUser = req.user.email;
  return CompanyModel.findOne({
    _id: req.params.id,
    email: authorizedUser,
  });
};

export const getCompanyByEmail = async (req, res) => {
  try {
    const company = await CompanyModel.find({ email: req.user.email });
    if (!company || company.length === 0) {
      return successResponse(res, 200, "No Company found", {});
    }
    return successResponse(res, 200, "Successfully found company", company);
  } catch (error) {
    console.log(error)
    return errorResponse(res, 403, "Unauthorized to access this company", {});
  }
};

// Add a new company (connects to DB only when called)
export const addCompany = async (req, res) => {
  try {
    await db.connect(); // Connect only when needed
    req.body.email = req.user.email;

    // Check if the company already exists
    const existingCompany = await CompanyModel.findOne({
      $or: [
        { gstin: req.body.gstin },
        { name: req.body.name },
        { hallMarkNumber: req.body.hallMarkNumber },
      ],
    });

    if (existingCompany) {
      return errorResponse(res, 400, "Company/email already exists", {});
    }
    // Validate the required fields
    const company = new CompanyModel(req.body);
    company.user = req.user.userId;
    await company.save();
    return successResponse(res, 200, "Successfully added company", company);
  } catch (error) {
    if (error.code === 11000) {
      console.log(error);
      return errorResponse(res, 400, "Company already exists", {});
    }
    return errorResponse(res, 400, "Error adding company", error);
  } finally {
    await db.disconnect();
  }
};

// Get company by ID (connects only when called)
export const getCompanyById = async (req, res) => {
  try {
    await db.connect(); // Connect only when needed
    // Check if the ID is valid
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, "Invalid ID format", {});
    }

    if (!userAuthorized(req)) {
      return errorResponse(res, 403, "Unauthorized to access this company", {});
    }
    const company = await CompanyModel.findById(req.params.id);
    if (!company) return errorResponse(res, 404, "Company not found", {});
    return successResponse(res, 200, "Founded company", company);
  } catch (error) {
    console.log(error);
    return errorResponse(res, 400, "Error getting company", error);
  } finally {
    await db.disconnect();
  }
};

// Update company (connects only when called)
export const updateCompany = async (req, res) => {
  try {
    await db.connect(); // Connect only when needed

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, "Invalid ID format", {});
    }

    if (!userAuthorized(req)) {
      return errorResponse(res, 403, "Unauthorized to access this company", {});
    }

    const company = await CompanyModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!company) return errorResponse(res, 404, "Company not found", {});
    return successResponse(res, 200, "successfully updated company", company);
  } catch (error) {
    return errorResponse(res, 400, "Error updating company", error);
  } finally {
    await db.disconnect();
  }
};

// const deleteC
