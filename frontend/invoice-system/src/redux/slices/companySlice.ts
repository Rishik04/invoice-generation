import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store"; // Import RootState to access other parts of the store

// Define the API base URLs
const COMPANY_API_BASE_URL = "http://localhost:3001";
const INVOICE_API_BASE_URL = "http://localhost:3004"; // New API for invoice generation

// 1. Define Interfaces to match Mongoose Schema
export interface BankDetails {
  name: string;
  branch: string;
  accountNumber: string;
  ifsc: string;
}

export interface Company {
  _id: string; // Mongoose uses _id for document ID
  name: string;
  address: string;
  gstin: string;
  hallMarkNumber: string;
  email: string;
  phone: string[];
  state: string;
  bankDetails: BankDetails;
  termsConditions: string[];
}

// Interfaces for Invoice Data (matching the provided JSON structure)
export interface InvoiceItem {
  type: "S" | "G";
  description: string;
  hsnCode: string;
  purity: string;
  grossWeight: number;
  netWeight: number;
  rate: number;
  makingCharges: number;
  otherCharges: number;
}

export interface InvoiceCustomer {
  name: string;
  address: string;
  phone: string;
  state: string;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  sgst: number;
  cgst: number;
  total: number;
  amountInWords: string;
  customer: InvoiceCustomer;
}

export interface GenerateInvoicePayload {
  invoice: InvoiceDetails;
  company: Omit<Company, "_id"> & Company; // Adjust company details for invoice payload
}

interface CompanyState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  selectedCompany: Company | null;
  invoiceLoading: boolean; // New loading state for invoice generation
  invoiceError: string | null; // New error state for invoice generation
  invoiceSuccess: string | null; // New success message for invoice generation
}

// 2. Initial State
const initialState: CompanyState = {
  companies: [],
  loading: false,
  error: null,
  selectedCompany: null,
  invoiceLoading: false,
  invoiceError: null,
  invoiceSuccess: null,
};

// 3. Async Thunks for CRUD Operations with Axios and JWT Token

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Fetch all companies
export const fetchCompanies = createAsyncThunk(
  "company/fetchCompanies",
  async (_, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;

    if (!token) {
      return rejectWithValue("Authentication token not found. Please log in.");
    }

    try {
      // Assuming backend response is { data: Company[], message: string }
      const response = await axios.get<{ data: Company[]; message: string }>(
        `${COMPANY_API_BASE_URL}/`, // Assuming '/' for listing companies
        getAuthHeaders(token)
      );
      console.log("Fetched companies:", response.data.data); // Debugging log
      return response.data.data; // Return the actual array of companies
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch companies."
        );
      }
      return rejectWithValue(
        error.message || "Network error fetching companies."
      );
    }
  }
);

// Add a new company
export const addCompany = createAsyncThunk(
  "company/addCompany",
  async (
    newCompanyData: Omit<Company, "_id">,
    { rejectWithValue, getState }
  ) => {
    const token = (getState() as RootState).auth.token;

    if (!token) {
      return rejectWithValue("Authentication token not found. Please log in.");
    }

    try {
      const response = await axios.post<Company>(
        `${COMPANY_API_BASE_URL}/add`,
        newCompanyData,
        getAuthHeaders(token)
      );
      return response.data; // Backend should return the newly created company with _id
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to add company."
        );
      }
      return rejectWithValue(error.message || "Network error adding company.");
    }
  }
);

// Update an existing company
export const updateCompany = createAsyncThunk(
  "company/updateCompany",
  async (updatedCompany: Company, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;

    if (!token) {
      return rejectWithValue("Authentication token not found. Please log in.");
    }

    try {
      // Destructure to remove _id before sending, as it's in the URL
      const { _id, ...dataToUpdate } = updatedCompany;
      const response = await axios.put<Company>(
        `${COMPANY_API_BASE_URL}/update/${_id}`,
        dataToUpdate,
        getAuthHeaders(token)
      );
      return response.data; // Backend should return the updated company
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to update company."
        );
      }
      return rejectWithValue(
        error.message || "Network error updating company."
      );
    }
  }
);

// Delete a company
export const deleteCompany = createAsyncThunk(
  "company/deleteCompany",
  async (companyId: string, { rejectWithValue, getState }) => {
    const token = (getState() as RootState).auth.token;

    if (!token) {
      return rejectWithValue("Authentication token not found. Please log in.");
    }

    try {
      await axios.delete(
        `${COMPANY_API_BASE_URL}/${companyId}`, // Assuming /:id for delete
        getAuthHeaders(token)
      );
      return companyId; // Return the ID of the deleted company
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to delete company."
        );
      }
      return rejectWithValue(
        error.message || "Network error deleting company."
      );
    }
  }
);

// New Async Thunk for Generating Invoice
export const generateInvoice = createAsyncThunk(
  "company/generateInvoice",
  async (
    invoiceData: GenerateInvoicePayload,
    { rejectWithValue, getState }
  ) => {
    const token = (getState() as RootState).auth.token;

    if (!token) {
      return rejectWithValue("Authentication token not found. Please log in.");
    }

    try {
      const response = await axios.post(
        `${INVOICE_API_BASE_URL}/generate-invoice`,
        invoiceData,
        {
          ...getAuthHeaders(token),
          responseType: "blob", // Set response type to blob for file download
        }
      );
      // Assuming the backend returns a success message or URL to the generated invoice
      return (response) || "Invoice generated successfully!";
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to generate invoice."
        );
      }
      return rejectWithValue(
        error.message || "Network error generating invoice."
      );
    }
  }
);

// 4. Create Company Slice
const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanyMessages: (state) => {
      state.error = null;
      state.invoiceError = null;
      state.invoiceSuccess = null;
    },
    setSelectedCompany: (state, action: PayloadAction<Company | null>) => {
      state.selectedCompany = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCompanies.fulfilled,
        (state, action: PayloadAction<Company[]>) => {
          state.loading = false;
          state.companies = action.payload;
        }
      )
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Company
      .addCase(addCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCompany.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Generate Invoice
      .addCase(generateInvoice.pending, (state) => {
        state.invoiceLoading = true;
        state.invoiceError = null;
        state.invoiceSuccess = null;
      })
      .addCase(generateInvoice.rejected, (state, action) => {
        state.invoiceLoading = false;
        state.invoiceError = action.payload as string;
        state.invoiceSuccess = null;
      });
  },
});

export const { clearCompanyMessages, setSelectedCompany } =
  companySlice.actions;

export default companySlice.reducer;
