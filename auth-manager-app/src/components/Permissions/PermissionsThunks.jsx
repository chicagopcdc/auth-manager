import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * fetches the total available permissions in a certain environment,
 * to be stored in state.displayPermissions.totalPermissions
 * @param {string} authKey - the authentication key, from Login
 * @param {string} envir - the selected environment, from Login
 */
export const fetchTotalPermissions = createAsyncThunk(
  'displayPermissions/fetchTotalPermissions',
  async ({ authKey, envir }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://${envir}/user/admin/list_policies`,
        {
          headers: {
            Authorization: `Bearer ${authKey}`
          },
          signal: AbortSignal.timeout(2500)
        }
      );
      if (!response.ok) {
        rejectWithValue(`Failed to fetch data: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return rejectWithValue(`Expected JSON, got: ${text.substring(0, 100)}`);
      }
      let json = await response.json();
      return json.policies;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

/**
 * fetches the userInfo, which includes a user's selected permissions, to be stored
 * in state.displayPermissions.userInfo
 * @param {string} authKey - the authentication key, from Login
 * @param {string} username - the username of the user row being clicked, from Users
 * @param {string} envir - the selected environment, from Login
 */
export const fetchUserInfo = createAsyncThunk(
  'displayPermissions/fetchUserInfo',
  async ({ authKey, username, envir }, { rejectWithValue }) => {
    try {
      const url = `https://${envir}/user/admin/arborist_user/${username}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authKey}`
        },
        signal: AbortSignal.timeout(2500)
      });
      if (!response.ok) {
        return rejectWithValue(response.status);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return rejectWithValue(`Expected JSON, got: ${text.substring(0, 100)}`);
      }
      let json = await response.json();
      return json;
    } catch (e) {
      return rejectWithValue(e.response?.status);
    }
  }
);
