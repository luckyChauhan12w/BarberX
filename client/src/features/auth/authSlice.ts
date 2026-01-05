import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from './authAPI';
import type { AuthState, LoginCredentials, RegisterCredentials } from './authTypes';
import { getErrorMessage } from '../../utils/errorHandler';

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(credentials);
            return response;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(credentials);
            return response;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

export const verifyToken = createAsyncThunk(
    'auth/verify',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.verifyToken();
            return response;
        } catch (error: unknown) {
            return rejectWithValue(getErrorMessage(error));
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Verify Token
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
            })
            .addCase(verifyToken.rejected, (state) => {
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;