import { configureStore } from '@reduxjs/toolkit';
import loginReducer from './components/Login/LoginSlice';
import usersReducer from './components/Users/UsersSlice';
import permissionsReducer from './components/Permissions/PermissionsSlice';
import changePermissionsReducer from './components/Permissions/ChangePermissionsSlice';

const store = configureStore({
  reducer: {
    login: loginReducer,
    users: usersReducer,
    displayPermissions: permissionsReducer,
    changePermissions: changePermissionsReducer
  }
});
export default store;
