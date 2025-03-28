const Company = require("../model/companyModel");
const db = require("../db/db");
const { errorResponse, successResponse } = require("../response/response");

// Check if the user is authorized to access this company
const userAuthorized = (req) => {
  const authorizedUser = req.user.email;
  return Company.findOne({
    _id: req.params.id,
    email: authorizedUser,
  });
};

// Add a new company (connects to DB only when called)
const addCompany = async (req, res) => {
  try {
    await db.connect(); // Connect only when needed
    req.body.email = req.user.email;

    // Check if the company already exists
    const existingCompany = await Company.findOne({
      $or: [{ email: req.body.email }, { name: req.body.name }],
    });

    if (existingCompany) {
      return errorResponse(res, 400, "Company/email already exists", {});
    }
    // Validate the required fields
    const company = new Company(req.body);
    await company.save();
    return successResponse(res, 200, "Successfully added company", company);
  } catch (error) {
    if(error.code === 11000) {
      return errorResponse(res, 400, "Company already exists", {});
    }
    return errorResponse(res, 400, "Error adding company", error);
  } finally {
    await db.disconnect();
  }
};

// Get company by ID (connects only when called)
const getCompanyById = async (req, res) => {
  try {
    await db.connect(); // Connect only when needed
    // Check if the ID is valid
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, "Invalid ID format", {});
    }

    if (!userAuthorized(req)) {
      return errorResponse(res, 403, "Unauthorized to access this company", {});
    }
    const company = await Company.findById(req.params.id);
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
const updateCompany = async (req, res) => {
  try {
    await db.connect(); // Connect only when needed

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, "Invalid ID format", {});
    }

    if (!userAuthorized(req)) {
      return errorResponse(res, 403, "Unauthorized to access this company", {});
    }

    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!company) return errorResponse(res, 404, "Company not found", {});
    return successResponse(res, 200, "successfully updated company", company);
  } catch (error) {
    return errorResponse(res, 400, "Error updating company", error);
  } finally {
    await db.disconnect();
  }
};

module.exports = {
  addCompany,
  getCompanyById,
  updateCompany,
};
