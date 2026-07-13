import { createAsyncThunk } from '@reduxjs/toolkit';

export const addPolicy = createAsyncThunk(
  'changePermissions/addPolicy',
  async (
    {
      authKey,
      envir,
      subjectType = 'user',
      username,
      clientID,
      policy_name,
      policy_names = []
    },
    { rejectWithValue }
  ) => {
    try {
      const isClient = subjectType === 'client';
      const policies = policy_names.length > 0 ? policy_names : [policy_name];

      const url = isClient
        ? `https://${envir}/user/admin/add_policies_to_client`
        : `https://${envir}/user/admin/add_policy_to_user`;

      const body = isClient
        ? {
            client_id: clientID,
            policy_names: policies
          }
        : {
            username,
            policy_name
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
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
      return rejectWithValue(error?.message || 'Unable to add policies');
    }
  }
);

export const removePolicy = createAsyncThunk(
  'changePermissions/removePolicy',
  async (
    {
      authKey,
      envir,
      subjectType = 'user',
      username,
      clientID,
      policy_names = []
    },
    { rejectWithValue }
  ) => {
    try {
      const isClient = subjectType === 'client';

      const url = isClient
        ? `https://${envir}/user/admin/remove_policies_from_client`
        : `https://${envir}/user/admin/revoke_permission`;

      const body = isClient
        ? {
            client_id: clientID,
            policy_names
          }
        : {
            username,
            policy_names
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
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
      return rejectWithValue(error?.message || 'Unable to remove policies');
    }
  }
);
