import { useState } from 'react';

/**
 * A policy is the thing the rest of this app calls a permission: it grants a
 * set of roles on a set of resource paths. Both lists come from the
 * environment, so the form can only ever build a policy arborist will accept.
 *
 * @param {Object} props
 * @param {Object[]} props.roles - from list_roles
 * @param {Object[]} props.resources - from list_resources, without the subtrees in config/resources.js
 * @param {boolean} props.busy
 * @param {function} props.onCreate - ({ id, description, resourcePaths, roleIds })
 * @param {function} props.onCancel
 */
function PolicyForm({ roles, resources, busy, onCreate, onCancel }) {
  const [id, setId] = useState('');
  const [description, setDescription] = useState('');
  const [roleIds, setRoleIds] = useState([]);
  const [resourcePaths, setResourcePaths] = useState([]);

  const canSubmit =
    id.trim() && roleIds.length > 0 && resourcePaths.length > 0 && !busy;

  const toggle = (list, setList, value) =>
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );

  return (
    <div className='manage-form'>
      <h3>New permission</h3>

      <label htmlFor='policy-id'>
        Name
        <input
          id='policy-id'
          type='text'
          value={id}
          placeholder='services.amanuensis-admin'
          onChange={(event) => setId(event.target.value)}
        />
      </label>
      <p className='manage-form__hint'>
        The convention is <code>service.what-it-allows</code>, for example{' '}
        <code>services.amanuensis-admin</code>.
      </p>

      <label htmlFor='policy-description'>
        Description
        <input
          id='policy-description'
          type='text'
          value={description}
          placeholder='admin access to amanuensis'
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <fieldset className='manage-form__group'>
        <legend>Roles granted</legend>
        {roles.length === 0 ? (
          <p>No roles exist yet. Create one on the Roles tab first.</p>
        ) : (
          roles.map((role) => (
            <label key={role.id} className='manage-form__check'>
              <input
                type='checkbox'
                checked={roleIds.includes(role.id)}
                onChange={() => toggle(roleIds, setRoleIds, role.id)}
              />
              {role.id}
              {role.description ? ` — ${role.description}` : ''}
            </label>
          ))
        )}
      </fieldset>

      <fieldset className='manage-form__group'>
        <legend>Resources it applies to</legend>
        {resources.length === 0 ? (
          <p>No resources exist yet. Create one on the Resources tab first.</p>
        ) : (
          resources.map((resource) => (
            <label key={resource.path} className='manage-form__check'>
              <input
                type='checkbox'
                checked={resourcePaths.includes(resource.path)}
                onChange={() =>
                  toggle(resourcePaths, setResourcePaths, resource.path)
                }
              />
              {resource.path}
            </label>
          ))
        )}
      </fieldset>

      <button
        className='g3-button--primary'
        disabled={!canSubmit}
        onClick={() =>
          onCreate({
            id: id.trim(),
            description: description.trim(),
            roleIds,
            resourcePaths
          })
        }>
        {busy ? 'Creating…' : 'Create permission'}
      </button>
      <button disabled={busy} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export default PolicyForm;
