import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * fetches users based on the selected environment and login
 * @param {string} authKey - the authentication key, from Login
 * @param {string} envir - the selected environment, from Login
 */
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ authKey, envir }, {}) => {
    try {
      const url = `https://${envir}/user/admin/users`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authKey}`
        },
        signal: AbortSignal.timeout(2500)
      });
      if (!response.ok) {
        console.error(`Error: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(`Expected JSON, got: ${text.substring(0, 100)}`);
      }
      const json = await response.json();
      return json.users;
    } catch (e) {
      console.error(`Error: ${response.status}`);
    }
  }
);
