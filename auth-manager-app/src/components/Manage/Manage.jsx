import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '../Spinner/Spinner';
import Modal from '../Modal/Modal';
import ConfirmModal from '../Modal/ConfirmModal';
import PolicyForm from './PolicyForm';
import RoleForm from './RoleForm';
import ResourceForm from './ResourceForm';
import { loginActions } from '../Login/LoginSlice';
import { manageActions } from './ManageSlice';
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
import { authExpire, getItemWithTimeout } from '../../utils';
import './Manage.css';

const TABS = [
  { key: 'policies', label: 'Permissions' },
  { key: 'roles', label: 'Roles' },
  { key: 'resources', label: 'Resources' }
];

/** Fetch one list, and send the person back to login if the key has expired. */
const load = (dispatch, navigate, thunk, credentials) =>
  dispatch(thunk(credentials)).then((result) => {
    if (
      thunk.rejected.match(result) &&
      [401, 403].includes(result.payload?.status)
    ) {
      authExpire(dispatch, navigate);
    }
  });

function Manage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authKey = useSelector((state) => state.login.authKey);
  const envir = useSelector((state) => state.login.envir);
  const {
    policies,
    roles,
    resources,
    policiesStatus,
    rolesStatus,
    resourcesStatus,
    writeStatus,
    saveMsg,
    errorMsg
  } = useSelector((state) => state.manage);

  const [tab, setTab] = useState('policies');
  const [showForm, setShowForm] = useState(false);
  /** { kind, id, label } for the row awaiting confirmation, or null */
  const [pendingDelete, setPendingDelete] = useState(null);
  /** set when a role delete came back refused, to offer the forced retry */
  const [forceRolePrompt, setForceRolePrompt] = useState(null);

  const busy = writeStatus === 'loading';
  const loading =
    policiesStatus === 'loading' ||
    rolesStatus === 'loading' ||
    resourcesStatus === 'loading';

  /** Everything is cross-referenced, so reload all three after any change. */
  const reloadAll = (credentials) => {
    load(dispatch, navigate, fetchPolicies, credentials);
    load(dispatch, navigate, fetchRoles, credentials);
    load(dispatch, navigate, fetchResources, credentials);
  };

  const loadFailed = [policiesStatus, rolesStatus, resourcesStatus].includes(
    'failed'
  );

  useEffect(() => {
    const loginData = getItemWithTimeout('loginData');

    if (!loginData?.authKey || !loginData?.envir) {
      authExpire(dispatch, navigate);
      return;
    }

    dispatch(loginActions.setAuth(loginData.authKey));
    dispatch(loginActions.setEnvir(loginData.envir));

    const credentials = {
      authKey: loginData.authKey,
      envir: loginData.envir
    };
    if (policiesStatus === 'idle') {
      load(dispatch, navigate, fetchPolicies, credentials);
    }
    if (rolesStatus === 'idle') {
      load(dispatch, navigate, fetchRoles, credentials);
    }
    if (resourcesStatus === 'idle') {
      load(dispatch, navigate, fetchResources, credentials);
    }
  }, [dispatch, navigate, policiesStatus, rolesStatus, resourcesStatus]);

  /** Run a create, and only close the form and refresh if it actually worked. */
  const runWrite = async (thunk, args, successMsg) => {
    const result = await dispatch(thunk({ authKey, envir, ...args }));

    if (thunk.rejected.match(result)) {
      if ([401, 403].includes(result.payload?.status)) {
        authExpire(dispatch, navigate);
      }
      return false;
    }

    setShowForm(false);
    dispatch(manageActions.setSaveMsg(successMsg));
    reloadAll({ authKey, envir });
    return true;
  };

  const confirmDelete = async () => {
    const { kind, id } = pendingDelete;
    const thunks = {
      policy: deletePolicy,
      role: deleteRole,
      resource: deleteResource
    };
    const args = kind === 'resource' ? { path: id } : { id };

    const result = await dispatch(thunks[kind]({ authKey, envir, ...args }));
    setPendingDelete(null);

    if (thunks[kind].rejected.match(result)) {
      if ([401, 403].includes(result.payload?.status)) {
        authExpire(dispatch, navigate);
        return;
      }
      // fence refuses a role that policies still name; offer the forced retry
      // rather than making someone go and unpick every policy by hand. This is
      // a prompt, not a failure, so drop the error modal that would otherwise
      // sit on top of it saying the same thing twice.
      if (kind === 'role' && result.payload?.message?.includes('still used by')) {
        dispatch(manageActions.setErrorMsg(''));
        setForceRolePrompt({ id, reason: result.payload.message });
      }
      return;
    }

    dispatch(manageActions.setSaveMsg(`Deleted ${kind} ${id}.`));
    reloadAll({ authKey, envir });
  };

  const forceDeleteRole = async () => {
    const { id } = forceRolePrompt;
    const result = await dispatch(
      deleteRole({ authKey, envir, id, force: true })
    );
    setForceRolePrompt(null);

    if (deleteRole.rejected.match(result)) {
      if ([401, 403].includes(result.payload?.status)) {
        authExpire(dispatch, navigate);
      }
      return;
    }

    if (deleteRole.fulfilled.match(result)) {
      dispatch(
        manageActions.setSaveMsg(
          `Deleted role ${id}. Any policy that named it no longer grants it.`
        )
      );
      reloadAll({ authKey, envir });
    }
  };

  const rows = {
    policies: policies.map((policy) => ({
      id: policy.id,
      cells: [
        policy.id,
        policy.description || '—',
        (policy.roles || []).map((role) => role.id).join(', ') ||
          (policy.role_ids || []).join(', ') ||
          '—',
        (policy.resource_paths || []).join(', ') || '—'
      ]
    })),
    roles: roles.map((role) => ({
      id: role.id,
      cells: [
        role.id,
        role.description || '—',
        (role.permissions || [])
          .map(
            (permission) =>
              `${permission.action?.service}:${permission.action?.method}`
          )
          .join(', ') || '—'
      ]
    })),
    resources: resources.map((resource) => ({
      id: resource.path,
      cells: [resource.path, resource.name, resource.description || '—']
    }))
  };

  const headers = {
    policies: ['Name', 'Description', 'Roles', 'Resources'],
    roles: ['Name', 'Description', 'Actions'],
    resources: ['Path', 'Name', 'Description']
  };

  const deleteKind = { policies: 'policy', roles: 'role', resources: 'resource' };

  const createLabel = {
    policies: 'Create Permission',
    roles: 'Create Role',
    resources: 'Create Resource'
  };

  return (
    <>
      <h1>Authentication Manager</h1>
      <h2>Manage Permissions</h2>
      <p>
        Define what access exists in <strong>{envir}</strong>. Assigning it to a
        person happens on the Users page.
      </p>

      {errorMsg && (
        <Modal
          errorMsg={errorMsg}
          onExit={() => dispatch(manageActions.setErrorMsg(''))}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title={`Delete ${pendingDelete.kind} ${pendingDelete.id}?`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}>
          <p>{pendingDelete.warning}</p>
          <p>This cannot be undone.</p>
        </ConfirmModal>
      )}

      {forceRolePrompt && (
        <ConfirmModal
          title={`Delete role ${forceRolePrompt.id} anyway?`}
          confirmLabel='Delete anyway'
          busy={busy}
          onConfirm={forceDeleteRole}
          onCancel={() => setForceRolePrompt(null)}>
          <p>{forceRolePrompt.reason}</p>
          <p>
            If you go ahead, the role is removed from those policies. A policy
            left with no roles grants nothing, and anyone holding it loses that
            access.
          </p>
        </ConfirmModal>
      )}

      <nav className='manage-tabs'>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={
              tab === key ? 'manage-tabs__tab manage-tabs__tab--active' : 'manage-tabs__tab'
            }
            onClick={() => {
              setTab(key);
              setShowForm(false);
              dispatch(manageActions.clearMessages());
            }}>
            {label}
          </button>
        ))}
      </nav>

      {saveMsg && <p className='manage-save-msg'>{saveMsg}</p>}

      <button
        className='g3-button--primary'
        onClick={() => {
          dispatch(manageActions.clearMessages());
          setShowForm((open) => !open);
        }}>
        {showForm ? 'Close' : createLabel[tab]}
      </button>

      {showForm && tab === 'policies' && (
        <PolicyForm
          roles={roles}
          resources={resources}
          busy={busy}
          onCancel={() => setShowForm(false)}
          onCreate={(values) =>
            runWrite(createPolicy, values, `Created permission ${values.id}.`)
          }
        />
      )}
      {showForm && tab === 'roles' && (
        <RoleForm
          busy={busy}
          onCancel={() => setShowForm(false)}
          onCreate={(values) =>
            runWrite(createRole, values, `Created role ${values.id}.`)
          }
        />
      )}
      {showForm && tab === 'resources' && (
        <ResourceForm
          resources={resources}
          busy={busy}
          onCancel={() => setShowForm(false)}
          onCreate={(values) =>
            runWrite(
              createResource,
              values,
              `Created resource ${values.name}.`
            )
          }
        />
      )}

      {loading && <Spinner />}

      {!loading && loadFailed && (
        <p>
          Some of this could not be loaded, so what is shown may be incomplete.{' '}
          <button onClick={() => reloadAll({ authKey, envir })}>Retry</button>
        </p>
      )}

      {!loading && !loadFailed && rows[tab].length === 0 && (
        <p>Nothing has been defined here yet.</p>
      )}

      {rows[tab].length > 0 && (
        <div className='base-table'>
          <table className='base-table__body'>
            <thead className='base-table__head'>
              <tr>
                {headers[tab].map((header) => (
                  <th className='base-table__column-head' key={header}>
                    {header}
                  </th>
                ))}
                <th className='base-table__column-head'>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {rows[tab].map((row) => (
                <tr
                  className='base-table__row base-table__row--stripe-color'
                  key={row.id}>
                  {row.cells.map((cell, i) => (
                    <td className='base-table__cell' key={i}>
                      {cell}
                    </td>
                  ))}
                  <td className='base-table__cell'>
                    <button
                      className='manage-delete'
                      disabled={busy}
                      onClick={() =>
                        setPendingDelete({
                          kind: deleteKind[tab],
                          id: row.id,
                          warning: {
                            policies:
                              'Every user and client that holds this permission loses it.',
                            roles:
                              'Policies that grant this role will stop granting it.',
                            resources:
                              'Policies scoped to this resource will stop applying to it.'
                          }[tab]
                        })
                      }>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className='line-break'>
        <Link to='/users'>
          <button>Back to Users</button>
        </Link>
        <Link to='/clients'>
          <button>View Clients</button>
        </Link>
      </div>
    </>
  );
}

export default Manage;
