import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async ({ authKey, envir }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://${envir}/user/admin/clients`, {
        headers: {
          Authorization: `Bearer ${authKey}`
        },
        signal: AbortSignal.timeout(15000)
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

export const fetchFenceClients = createAsyncThunk(
  'clients/fetchFenceClients',
  async ({ authKey, envir }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://${envir}/user/admin/clients/fence`,
        {
          headers: {
            Authorization: `Bearer ${authKey}`
          },
          signal: AbortSignal.timeout(2500)
        }
      );

      if (!response.ok) {
        return rejectWithValue(response.status);
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error?.message || 'Unable to fetch Fence clients');
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async ({ authKey, envir, clientID }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://${envir}/user/admin/clients`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientID,
          policy_names: []
        }),
        signal: AbortSignal.timeout(2500)
      });

      if (!response.ok) {
        return rejectWithValue(response.status);
      }

      return clientID;
    } catch (error) {
      return rejectWithValue(error?.message || 'Unable to create client');
    }
  }
);
