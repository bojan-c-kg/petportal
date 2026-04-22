import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  getMe,
  postLogin,
  postLogout,
  postSignup,
  updateMe as updateMeApi,
  type LoginPayload,
  type SignupPayload,
  type UpdateMePayload,
} from '../../api/endpoints';
import { normaliseError, type FieldErrors } from '../../api/errors';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthError {
  message: string;
  fieldErrors?: FieldErrors;
}

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: AuthError | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const fetchMe = createAsyncThunk<AuthUser | null, void, { rejectValue: AuthError }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await getMe();
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      return rejectWithValue(normaliseError(error, 'Unable to load profile.'));
    }
  },
);

export const login = createAsyncThunk<AuthUser, LoginPayload, { rejectValue: AuthError }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      await postLogin(payload);
      return await getMe();
    } catch (error: unknown) {
      return rejectWithValue(normaliseError(error, 'Invalid email or password.'));
    }
  },
);

export const signup = createAsyncThunk<AuthUser, SignupPayload, { rejectValue: AuthError }>(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      await postSignup(payload);
      return await getMe();
    } catch (error: unknown) {
      return rejectWithValue(normaliseError(error, 'Unable to create account.'));
    }
  },
);

export const logout = createAsyncThunk<void, void, { rejectValue: AuthError }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await postLogout();
    } catch (error: unknown) {
      return rejectWithValue(normaliseError(error, 'Logout failed.'));
    }
  },
);

export const updateMe = createAsyncThunk<AuthUser, UpdateMePayload, { rejectValue: AuthError }>(
  'auth/updateMe',
  async (payload, { rejectWithValue }) => {
    try {
      return await updateMeApi(payload);
    } catch (error: unknown) {
      return rejectWithValue(normaliseError(error, 'Unable to save account.'));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    clear(state) {
      state.user = null;
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.user = null;
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Unable to load profile.' };
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Login failed.' };
      })
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(signup.rejected, (state, action) => {
        state.user = null;
        state.status = 'failed';
        state.error = action.payload ?? { message: 'Signup failed.' };
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateMe.rejected, (state, action) => {
        state.error = action.payload ?? { message: 'Unable to save account.' };
      });
  },
});

export const { setUser, clearError, clear } = authSlice.actions;
export default authSlice.reducer;
