import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTotalPermissions = createAsyncThunk(
  'permissions/fetchTotalPermissions',
  async (authKey, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'https://portal-dev.pedscommons.org/user/admin/list_policies',
        {
          headers: {
            Authorization: `Bearer ${authKey}`
          }
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

export const fetchUserInfo = createAsyncThunk(
  'permissions/fetchUserInfo',
  async ({ authKey, username }, { rejectWithValue }) => {
    try {
      const url = `https://portal-dev.pedscommons.org/user/admin/arborist_user/${username}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authKey}`
        }
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
