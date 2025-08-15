import { createSlice } from '@reduxjs/toolkit';
import { addPolicy, removePolicy } from './ChangePermissionsThunk';

const changePermissionsSlice = createSlice({
  name: 'changePermissions',
  initialState: {
    addPolicyStatus: 'idle',
    removePolicyStatus: 'idle',
    status: 'idle'
  },
  reducers: {
    setStatus(state, action) {
      state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addPolicy.fulfilled, (state) => {
        state.addPolicyStatus = 'success';
      })
      .addCase(addPolicy.rejected, (state) => {
        state.addPolicyStatus = 'failed';
      })
      .addCase(addPolicy.pending, (state) => {
        state.addPolicyStatus = 'loading';
      })
      .addCase(removePolicy.fulfilled, (state) => {
        state.removePolicyStatus = 'success';
      })
      .addCase(removePolicy.rejected, (state) => {
        state.removePolicyStatus = 'failed';
      })
      .addCase(removePolicy.pending, (state) => {
        state.removePolicyStatus = 'loading';
      });
  }
});
export default changePermissionsSlice.reducer;
export const changePermissionsActions = changePermissionsSlice.actions;
