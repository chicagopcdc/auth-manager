import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Fence renders its errors as an HTML page rather than JSON, so the useful part
 * of a failure — "this role is still used by these policies" — only exists in
 * the markup. Pull the first paragraph out of it so the UI can show the reason
 * instead of a bare status code.
 *
 * Both halves matter and neither substitutes for the other: the message is what
 * a person reads, while the status is how the caller recognises an expired key
 * and sends them back to the login page.
 *
 * @param {Response} response
 * @returns {Promise<{status: number, message: string}>}
 */
const errorFromResponse = async (response) => {
  const fallback = `The change did not go through (${response.status}).`;
  try {
    const text = await response.text();
    // The page shows the error id in the first `introduction` paragraph and the
    // message in the one after the "Error Message:" label, so anchor on the
    // label rather than taking the first paragraph.
    const match = text.match(
      /Error Message:<\/p>\s*<p class="introduction">([^<]+)<\/p>/
    );
    if (match) {
      return { status: response.status, message: decodeEntities(match[1]) };
    }
    const json = JSON.parse(text);
    const detail = json?.error?.message ?? json?.error;
    return {
      status: response.status,
      message: typeof detail === 'string' && detail ? detail : fallback
    };
  } catch {
    return { status: response.status, message: fallback };
  }
};

/** Fence escapes the message for HTML, so "it's" arrives as "it&#39;s". */
const decodeEntities = (html) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value.trim();
};

/**
 * Every call here is the same admin request with a different verb and path, so
 * the shape lives in one place rather than being copied nine times.
 * @param {Object} args
 * @param {string} args.authKey - the authentication key, from Login
 * @param {string} args.envir - the selected environment, from Login
 * @param {string} args.path - path under /user/admin
 * @param {string} [args.method]
 * @param {Object} [args.body]
 */
const adminRequest = async (
  { authKey, envir, path, method = 'GET', body },
  { rejectWithValue }
) => {
  try {
    const response = await fetch(`https://${envir}/user/admin/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${authKey}`,
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      // Only reads are given a deadline. A write that times out may still have
      // been applied, and reporting it as failed invites a duplicate retry.
      // AbortSignal.timeout is missing from older browsers, so check for it.
      ...(method === 'GET' && AbortSignal.timeout
        ? { signal: AbortSignal.timeout(15000) }
        : {})
    });

    if (!response.ok) {
      return rejectWithValue(await errorFromResponse(response));
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {};
    }

    return await response.json();
  } catch (error) {
    // never got an answer, so there is no status to report
    const timedOut = ['TimeoutError', 'AbortError'].includes(error?.name);
    return rejectWithValue({
      status: 0,
      message: timedOut
        ? 'The server did not respond in time. Your authentication key may have expired, or the service may be restarting. Log in again and retry.'
        : error?.message || 'The request could not be sent.'
    });
  }
};

/** Policies, expanded so each one carries its roles rather than just their ids. */
export const fetchPolicies = createAsyncThunk(
  'manage/fetchPolicies',
  ({ authKey, envir }, thunkAPI) =>
    adminRequest(
      { authKey, envir, path: 'list_policies?expand=True' },
      thunkAPI
    )
);

export const fetchRoles = createAsyncThunk(
  'manage/fetchRoles',
  ({ authKey, envir }, thunkAPI) =>
    adminRequest({ authKey, envir, path: 'list_roles' }, thunkAPI)
);

export const fetchResources = createAsyncThunk(
  'manage/fetchResources',
  ({ authKey, envir }, thunkAPI) =>
    adminRequest({ authKey, envir, path: 'list_resources' }, thunkAPI)
);

/**
 * @param {string} id - the policy id, e.g. "services.amanuensis-admin"
 * @param {string} description
 * @param {string[]} resourcePaths - paths the policy applies to
 * @param {string[]} roleIds - roles the policy grants on those paths
 */
export const createPolicy = createAsyncThunk(
  'manage/createPolicy',
  ({ authKey, envir, id, description, resourcePaths, roleIds }, thunkAPI) =>
    adminRequest(
      {
        authKey,
        envir,
        path: 'add_policy',
        method: 'POST',
        body: {
          id,
          description,
          resource_paths: resourcePaths,
          role_ids: roleIds
        }
      },
      thunkAPI
    )
);

export const deletePolicy = createAsyncThunk(
  'manage/deletePolicy',
  ({ authKey, envir, id }, thunkAPI) =>
    adminRequest(
      {
        authKey,
        envir,
        path: `remove_policy/${encodeURIComponent(id)}`,
        method: 'DELETE'
      },
      thunkAPI
    )
);

/**
 * @param {Object[]} permissions - [{ id, action: { service, method } }]
 */
export const createRole = createAsyncThunk(
  'manage/createRole',
  ({ authKey, envir, id, description, permissions }, thunkAPI) =>
    adminRequest(
      {
        authKey,
        envir,
        path: 'add_role',
        method: 'POST',
        body: { id, description, permissions }
      },
      thunkAPI
    )
);

/**
 * @param {boolean} [force] - delete even while policies still name this role
 */
export const deleteRole = createAsyncThunk(
  'manage/deleteRole',
  ({ authKey, envir, id, force = false }, thunkAPI) =>
    adminRequest(
      {
        authKey,
        envir,
        path: `remove_role/${encodeURIComponent(id)}${force ? '?force=true' : ''}`,
        method: 'DELETE'
      },
      thunkAPI
    )
);

export const createResource = createAsyncThunk(
  'manage/createResource',
  ({ authKey, envir, parentPath, name, description }, thunkAPI) =>
    adminRequest(
      {
        authKey,
        envir,
        path: 'add_resource',
        method: 'POST',
        body: { parent_path: parentPath, name, description }
      },
      thunkAPI
    )
);

export const deleteResource = createAsyncThunk(
  'manage/deleteResource',
  ({ authKey, envir, path }, thunkAPI) =>
    adminRequest(
      {
        authKey,
        envir,
        // the path is already absolute and fence matches it with <path:resource>;
        // encode each segment so a name with ?, # or % stays in the path
        path: `remove_resource/${path
          .replace(/^\//, '')
          .split('/')
          .map(encodeURIComponent)
          .join('/')}`,
        method: 'DELETE'
      },
      thunkAPI
    )
);
