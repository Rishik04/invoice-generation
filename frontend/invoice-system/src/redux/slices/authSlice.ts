import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios'; // Import axios

// 1. Define Interfaces for Auth State and Payloads
interface User {
  id: string;
  name: string;
  email: string;
  username: string;
}

interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  token: string | null; // In a real app, you'd store JWT or similar
  error: string | null;
  successMessage: string | null; // For registration success confirmation
}

// Payloads for the async thunks
interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
}

// Define the response structure for login and registration
interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

// 2. Define Initial State
const initialState: AuthState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
  successMessage: null,
};

// 3. Create Async Thunks for API Calls using Axios

// API Base URL (adjust if your backend is on a different host/port)
const API_BASE_URL = 'http://localhost:3003';

// Async Thunk for Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, credentials);
      const data = response.data; // Axios wraps the response in a `data` property
      console.log('Login response:', data); // Debugging log

      if (!data.success) {
        // If the backend indicates failure but returns 200 OK, reject with its message
        return rejectWithValue(data.message || 'Login failed.');
      }

      // In a real app, you would typically store the token here (e.g., localStorage)
      // localStorage.setItem('authToken', data.token || '');

      return data; // This payload goes to the fulfilled action
    } catch (error: any) {
      // Axios error handling: error.response contains details for HTTP errors
      if (axios.isAxiosError(error) && error.response) {
        // Backend sent an error response (e.g., 400, 401, 404, 500)
        return rejectWithValue(error.response.data.message || 'An error occurred during login.');
      } else {
        // Network error or other unexpected error
        return rejectWithValue(error.message || 'Network error or unexpected issue during login.');
      }
    }
  }
);

// Async Thunk for Registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post<RegisterResponse>(`${API_BASE_URL}/register`, userData);
      const data = response.data; // Axios wraps the response in a `data` property

      if (!data.success) {
        // If the backend indicates failure but returns 200 OK, reject with its message
        return rejectWithValue(data.message || 'Registration failed.');
      }

      return data; // This payload goes to the fulfilled action
    } catch (error: any) {
      // Axios error handling
      if (axios.isAxiosError(error) && error.response) {
        // Backend sent an error response
        return rejectWithValue(error.response.data.message || 'An error occurred during registration.');
      } else {
        // Network error or other unexpected error
        return rejectWithValue(error.message || 'Network error or unexpected issue during registration.');
      }
    }
  }
);

// 4. Create Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer to clear errors or messages if needed (e.g., when switching tabs)
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    // Reducer for logout (not directly used in this component, but good practice)
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.successMessage = null;
      // localStorage.removeItem('authToken'); // Clear token from storage
    }
  },
  extraReducers: (builder) => {
    builder
      // Login Thunk Reducers
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true; // Set isAuthenticated to true on successful login
        state.user = action.payload.user || null;
        state.token = action.payload.token || null;
        state.error = null;
        state.successMessage = action.payload.message;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string; // `rejectWithValue` sends a string here
        state.successMessage = null;
      })
      // Register Thunk Reducers
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<RegisterResponse>) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message; // Set success message
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // `rejectWithValue` sends a string here
        state.successMessage = null;
      });
  },
});

export const { clearAuthMessages, logout } = authSlice.actions;

export default authSlice.reducer;