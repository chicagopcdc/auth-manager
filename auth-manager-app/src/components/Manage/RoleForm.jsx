import { useState } from 'react';

const emptyPermission = () => ({ id: '', service: '', method: '' });

/**
 * A role is a named bundle of permissions, where a permission is one action:
 * a service plus a method on it. `*` means every method.
 *
 * @param {Object} props
 * @param {boolean} props.busy
 * @param {function} props.onCreate - ({ id, description, permissions })
 * @param {function} props.onCancel
 */
function RoleForm({ busy, onCreate, onCancel }) {
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState([emptyPermission()]);

  const filledPermissions = permissions.filter(
    (permission) => permission.id.trim() && permission.service.trim() && permission.method.trim()
  );
  const canSubmit = id.trim() && filledPermissions.length > 0 && !busy;

  const updatePermission = (index, field, value) =>
    setPermissions(
      permissions.map((permission, i) =>
        i === index ? { ...permission, [field]: value } : permission
      )
    );

  return (
    <div className='manage-form'>
      <h3>New role</h3>

      <label htmlFor='role-id'>
        Name
        <input
          id='role-id'
          type='text'
          value={id}
          placeholder='amanuensis_admin'
          onChange={(event) => setId(event.target.value)}
        />
      </label>

      <label htmlFor='role-description'>
        Description
        <input
          id='role-description'
          type='text'
          value={description}
          placeholder='can do admin work on data requests'
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <fieldset className='manage-form__group'>
        <legend>Actions this role allows</legend>
        {permissions.map((permission, index) => (
          <div className='manage-form__row' key={index}>
            <input
              type='text'
              aria-label='Action name'
              value={permission.id}
              placeholder='amanuensis_admin_action'
              onChange={(event) =>
                updatePermission(index, 'id', event.target.value)
              }
            />
            <input
              type='text'
              aria-label='Service'
              value={permission.service}
              placeholder='amanuensis'
              onChange={(event) =>
                updatePermission(index, 'service', event.target.value)
              }
            />
            <input
              type='text'
              aria-label='Method'
              value={permission.method}
              placeholder='*'
              onChange={(event) =>
                updatePermission(index, 'method', event.target.value)
              }
            />
            {permissions.length > 1 && (
              <button
                onClick={() =>
                  setPermissions(permissions.filter((_, i) => i !== index))
                }>
                Remove
              </button>
            )}
          </div>
        ))}
        <p className='manage-form__hint'>
          Name, then the service and the method on it. Use <code>*</code> for
          every method.
        </p>
        <button
          onClick={() => setPermissions([...permissions, emptyPermission()])}>
          Add another action
        </button>
      </fieldset>

      <button
        className='g3-button--primary'
        disabled={!canSubmit}
        onClick={() =>
          onCreate({
            id: id.trim(),
            description: description.trim(),
            permissions: filledPermissions.map((permission) => ({
              id: permission.id.trim(),
              action: {
                service: permission.service.trim(),
                method: permission.method.trim()
              }
            }))
          })
        }>
        {busy ? 'Creating…' : 'Create role'}
      </button>
      <button disabled={busy} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export default RoleForm;
