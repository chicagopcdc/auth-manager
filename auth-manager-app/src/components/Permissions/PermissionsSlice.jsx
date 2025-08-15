import { createSlice } from '@reduxjs/toolkit';
import { fetchTotalPermissions, fetchUserInfo } from './PermissionsThunks';

const DisplayPermissionsSlice = createSlice({
  name: 'displayPermissions',
  initialState: {
    totalPermissions: [],
    userInfo: {},
    permissionsStatus: 'idle',
    userInfoStatus: 'idle',
    saveMsg: ''
  },
  reducers: {
    setSaveMsg(state, action) {
      state.saveMsg = action.payload;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalPermissions.pending, (state) => {
        state.permissionsStatus = 'loading';
      })
      .addCase(fetchTotalPermissions.rejected, (state) => {
        state.permissionsStatus = 'failed';
      })
      .addCase(fetchTotalPermissions.fulfilled, (state, action) => {
        state.permissionsStatus = 'success';
        state.totalPermissions = action.payload;
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.userInfoStatus = 'loading';
      })
      .addCase(fetchUserInfo.rejected, (state) => {
        state.userInfoStatus = 'failed';
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.userInfoStatus = 'success';
        state.userInfo = action.payload;
      });
  }
});

export default DisplayPermissionsSlice.reducer;
export const displayPermissionsActions = DisplayPermissionsSlice.actions;
