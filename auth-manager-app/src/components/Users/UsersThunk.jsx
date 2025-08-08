import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async function getUsers(authKey) {
    try {
      const response = await fetch(
        'https://portal-dev.pedscommons.org/user/admin/users',
        {
          headers: {
            Authorization: `Bearer ${authKey}`
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      return json.users;
    } catch (e) {
      throw new Error('Fetch error:', e);
    }
  }
);
