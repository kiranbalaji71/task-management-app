import { combineReducers } from '@reduxjs/toolkit';
import loginReducer from './slice/loginSlice';
import tasksReducer from './slice/tasksSlice';
import usersReducer from './slice/usersSlice';

const appReducer = combineReducers({
  loginReducer,
  tasksReducer,
  usersReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_STORE') {
    localStorage.clear();
    localStorage.removeItem('persist:root');
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export default rootReducer;
