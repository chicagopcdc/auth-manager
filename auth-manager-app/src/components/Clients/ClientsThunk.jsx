import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async ({ authKey, envir }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://${envir}/user/admin/clients`, {
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
        return rejectWithValue(
          `Expected JSON, got: ${text.substring(0, 100)}`
        );
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error?.message || 'Unable to fetch clients');
    }
  }
);
