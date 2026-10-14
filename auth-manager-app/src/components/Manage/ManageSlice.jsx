import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import {
  createPolicy,
  createResource,
  createRole,
  deletePolicy,
  deleteResource,
  deleteRole,
  fetchPolicies,
  fetchResources,
  fetchRoles
} from './ManageThunks';

const writeThunks = [
  createPolicy,
  createRole,
  createResource,
  deletePolicy,
  deleteRole,
  deleteResource
];

/**
 * A failed read is reported unless it is an expired key, which Manage answers by
 * sending the person back to login instead of showing a modal first.
 */
const readFailureMessage = (label, action) => {
  if ([401, 403].includes(action.payload?.status)) {
    return '';
  }
  return `Could not load ${label}: ${
    action.payload?.message || 'the request failed.'
  }`;
};

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
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.policiesStatus = 'failed';
        state.errorMsg =
          readFailureMessage('permissions', action) || state.errorMsg;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.policiesStatus = 'success';
        state.policies = action.payload?.policies || [];
      })
      .addCase(fetchRoles.pending, (state) => {
        state.rolesStatus = 'loading';
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.rolesStatus = 'failed';
        state.errorMsg =
          readFailureMessage('roles', action) || state.errorMsg;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.rolesStatus = 'success';
        state.roles = action.payload?.roles || [];
      })
      .addCase(fetchResources.pending, (state) => {
        state.resourcesStatus = 'loading';
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.resourcesStatus = 'failed';
        state.errorMsg =
          readFailureMessage('resources', action) || state.errorMsg;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.resourcesStatus = 'success';
        state.resources = action.payload?.resources || [];
      });

    // every write shares the same three outcomes, so match them as a group
    // instead of listing six thunks times three cases
    builder
      .addMatcher(
        isAnyOf(...writeThunks.map((thunk) => thunk.pending)),
        (state) => {
          state.writeStatus = 'loading';
          state.saveMsg = '';
          state.errorMsg = '';
        }
      )
      .addMatcher(
        isAnyOf(...writeThunks.map((thunk) => thunk.fulfilled)),
        (state) => {
          state.writeStatus = 'success';
        }
      )
      .addMatcher(
        isAnyOf(...writeThunks.map((thunk) => thunk.rejected)),
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
