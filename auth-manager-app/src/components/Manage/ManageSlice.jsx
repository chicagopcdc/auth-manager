import { createSlice } from '@reduxjs/toolkit';
import { fetchPolicies, fetchResources, fetchRoles } from './ManageThunks';

const initialState = {
  policies: [],
  roles: [],
  resources: [],
  policiesStatus: 'idle',
  rolesStatus: 'idle',
  resourcesStatus: 'idle',
  /** the create/delete currently in flight, so only one button shows a spinner */
  writeStatus: 'idle',
  saveMsg: '',
  errorMsg: ''
};

const manageSlice = createSlice({
  name: 'manage',
  initialState,
  reducers: {
    setSaveMsg(state, action) {
      state.saveMsg = action.payload;
    },
    setErrorMsg(state, action) {
      state.errorMsg = action.payload;
    },
    clearMessages(state) {
      state.saveMsg = '';
      state.errorMsg = '';
    },
    /** after logout, or when switching environment, none of this still applies */
    reset() {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicies.pending, (state) => {
        state.policiesStatus = 'loading';
      })
      .addCase(fetchPolicies.rejected, (state) => {
        state.policiesStatus = 'failed';
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.policiesStatus = 'success';
        state.policies = action.payload?.policies || [];
      })
      .addCase(fetchRoles.pending, (state) => {
        state.rolesStatus = 'loading';
      })
      .addCase(fetchRoles.rejected, (state) => {
        state.rolesStatus = 'failed';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesStatus = 'success';
        state.roles = action.payload?.roles || [];
      })
      .addCase(fetchResources.pending, (state) => {
        state.resourcesStatus = 'loading';
      })
      .addCase(fetchResources.rejected, (state) => {
        state.resourcesStatus = 'failed';
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resourcesStatus = 'success';
        state.resources = action.payload?.resources || [];
      });

    // every write shares the same three outcomes, so match them by prefix
    // instead of listing six thunks times three cases
    builder
      .addMatcher(
        (action) =>
          action.type.startsWith('manage/') &&
          !action.type.startsWith('manage/fetch') &&
          action.type.endsWith('/pending'),
        (state) => {
          state.writeStatus = 'loading';
          state.saveMsg = '';
          state.errorMsg = '';
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('manage/') &&
          !action.type.startsWith('manage/fetch') &&
          action.type.endsWith('/fulfilled'),
        (state) => {
          state.writeStatus = 'success';
        }
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('manage/') &&
          !action.type.startsWith('manage/fetch') &&
          action.type.endsWith('/rejected'),
        (state, action) => {
          state.writeStatus = 'failed';
          state.errorMsg =
            action.payload?.message || 'The change did not go through.';
        }
      );
  }
});

export const manageActions = manageSlice.actions;
export default manageSlice.reducer;
