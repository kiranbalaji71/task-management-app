import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchLoginDetails = createAsyncThunk(
  'login/getUserDetails',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.login(payload);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Something went wrong');
    }
  }
);

const loginSlice = createSlice({
  name: 'login',
  initialState: {
    role: null,
    userId: null,
    userName: null,
    userdetails: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUserRole: (state, action) => {
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoginDetails.pending, (state) => {
        state.userdetails = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoginDetails.fulfilled, (state, action) => {
        state.userdetails = action.payload;
        state.loading = false;
      })
      .addCase(fetchLoginDetails.rejected, (state, action) => {
        state.userdetails = null;
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });
  },
});

export const { setUserRole } = loginSlice.actions;

export default loginSlice.reducer;
