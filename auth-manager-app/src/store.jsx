import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './components/Login/LoginSlice';
import usersReducer from './components/Users/UsersSlice';
import permissionsReducer from './components/Permissions/PermissionsSlice';

const store = configureStore({
  reducer: {
    loginSlice: loginReducer,
    usersSlice: usersReducer,
    permissionsSlice: permissionsReducer
  }
});
export default store;
