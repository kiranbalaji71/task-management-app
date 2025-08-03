import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ currentUser }, { rejectWithValue }) => {
    const res = await api.getTasks(currentUser);
    if (res.status === 200) {
      return res.data;
    }
    return rejectWithValue(res.message);
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ currentUser, task }, { rejectWithValue }) => {
    const res = await api.createTask(currentUser, task);
    if (res.status === 201) {
      return res.data;
    }
    return rejectWithValue(res.message);
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ currentUser, id, task }, { rejectWithValue }) => {
    const res = await api.updateTask(currentUser, id, task);
    if (res.status === 200) {
      return res.data;
    }
    return rejectWithValue(res.message);
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ currentUser, id }, { rejectWithValue }) => {
    const res = await api.deleteTask(currentUser, id);
    if (res.status === 200) {
      return res.id;
    }
    return rejectWithValue(res.message);
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default tasksSlice.reducer;
