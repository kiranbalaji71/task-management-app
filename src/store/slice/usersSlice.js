import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ currentUser }, { rejectWithValue }) => {
    const res = await api.getUsers(currentUser);
    if (res.status === 200) {
      return res.data;
    }
    return rejectWithValue(res.message);
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async ({ currentUser, user }, { rejectWithValue }) => {
    const res = await api.createUser(currentUser, user);
    if (res.status === 201) {
      return res.data;
    }
    return rejectWithValue(res.message);
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ currentUser, id, user }, { rejectWithValue }) => {
    const res = await api.updateUser(currentUser, id, user);
    if (res.status === 200) {
      return res.data;
    }
    return rejectWithValue(res.message);
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async ({ currentUser, id }, { rejectWithValue }) => {
    const res = await api.deleteUser(currentUser, id);
    if (res.status === 200) {
      return res.id;
    }
    return rejectWithValue(res.message);
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((user) => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
