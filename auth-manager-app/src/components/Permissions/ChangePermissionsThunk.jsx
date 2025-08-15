import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Adds a new policy to a certain user
 * @param {string} authKey - the authentication key, from Login
 * @param {string} username - the username of the user row being clicked, from Users
 * @param {string} envir - the selected environment, from Login
 * @param {string} policy_name - the policy name we want to add to the user
 */
export const addPolicy = createAsyncThunk(
  'changePermissions/addPolicy',
  async ({ authKey, username, envir, policy_name }, { rejectWithValue }) => {
    try {
      const url = `https://${envir}/user/admin/add_policy_to_user`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          policy_name: policy_name,
          username: username
        })
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

/**
 * Removes policies from a certain user
 * @param {string} authKey - the authentication key, from Login
 * @param {string} username - the username of the user row being clicked, from Users
 * @param {string} envir - the selected environment, from Login
 * @param {string[]} policy_names - the policy names we want to add to the user
 */
export const removePolicy = createAsyncThunk(
  'changePermissions/removePolicy',
  async (
    { authKey, username, envir, policy_names = [] },
    { rejectWithValue }
  ) => {
    try {
      const url = `https://${envir}/user/admin/revoke_permission`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          policy_names: [...policy_names]
        })
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
