import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

const COMPANY_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/company`;

// Interfaces
export interface BankDetails {
  _id: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  ifsc: string;
}

export interface Address {
  _id: string;
  street: string;
  city: string;
  landmark?: string;
  state: string;
  statecode?: string;
  pincode: number;
}

export interface Company {
  _id: string;
  name: string;
  address: Address;
  gstin: string;
  hallMarkNumber: string;
  email: string;
  phone: string[];
  bank: BankDetails;
  termsConditions: string[];
  tenantId?: string;
  createdAt?: string;
}

// Slice State
interface CompanyState {
  company: Company | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CompanyState = {
  company: null,
  loading: false,
  error: null,
  successMessage: null,
};

// Helper for auth headers
const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// Async Thunks
export const fetchCompany = createAsyncThunk<
  Company,
  void,
  { rejectValue: string; state: RootState }
>("company/fetchCompany", async (_, { rejectWithValue, getState }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue("Authentication token not found.");

  console.log(token)

  try {
    const response = await axios.get<{
      status: string;
      message: string;
      data: Company;
    }>(`${COMPANY_API_BASE_URL}/`, getAuthHeaders(token));
    console.log(response)

    return response.data.data;
  } catch (err: any) {
     console.log(err)
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue(err.response.data.message || "Failed to fetch company.");
    }
    return rejectWithValue(err.message || "Network error fetching company.");
  }
});

export const updateCompany = createAsyncThunk<
  Company,
  Company,
  { rejectValue: string; state: RootState }
>("company/updateCompany", async (companyData, { rejectWithValue, getState }) => {
  const token = getState().auth.token;
  if (!token) return rejectWithValue("Authentication token not found.");

  try {
    const { _id, ...dataToUpdate } = companyData;
    const response = await axios.put<{
      status: string;
      message: string;
      data: Company;
    }>(`${COMPANY_API_BASE_URL}/update/${_id}`, dataToUpdate, getAuthHeaders(token));

    return response.data.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      return rejectWithValue(err.response.data.message || "Failed to update company.");
    }
    return rejectWithValue(err.message || "Network error updating company.");
  }
});

// Slice
const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanyMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompany.fulfilled, (state, action: PayloadAction<Company>) => {
        state.loading = false;
        state.company = action.payload;
      })
      .addCase(fetchCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch company.";
      })
      // Update
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCompany.fulfilled, (state, action: PayloadAction<Company>) => {
        state.loading = false;
        state.company = action.payload;
        state.successMessage = "Company updated successfully!";
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update company.";
      });
  },
});

export const { clearCompanyMessages } = companySlice.actions;
export default companySlice.reducer;
