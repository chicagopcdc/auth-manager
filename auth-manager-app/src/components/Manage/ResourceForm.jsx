import { useState } from 'react';

/**
 * Resources form a tree, so a new one is a name plus the path it hangs under.
 * The parent comes from the resources that already exist — arborist rejects a
 * parent it has never heard of.
 *
 * @param {Object} props
 * @param {Object[]} props.resources - from list_resources, without the subtrees in config/resources.js
 * @param {boolean} props.busy
 * @param {function} props.onCreate - ({ parentPath, name, description })
 * @param {function} props.onCancel
 */
function ResourceForm({ resources, busy, onCreate, onCancel }) {
  const [parentPath, setParentPath] = useState('/');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const canSubmit = name.trim() && !busy;

  return (
    <div className='manage-form'>
      <h3>New resource</h3>

      <label htmlFor='resource-parent'>
        Parent
        <select
          id='resource-parent'
          value={parentPath}
          onChange={(event) => setParentPath(event.target.value)}>
          <option value='/'>/ (top level)</option>
          {resources.map((resource) => (
            <option key={resource.path} value={resource.path}>
              {resource.path}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor='resource-name'>
        Name
        <input
          id='resource-name'
          type='text'
          value={name}
          placeholder='amanuensis'
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label htmlFor='resource-description'>
        Description
        <input
          id='resource-description'
          type='text'
          value={description}
          placeholder='Amanuensis admin resource'
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <p className='manage-form__hint'>
        This will create{' '}
        <code>
          {`${parentPath === '/' ? '' : parentPath}/${name.trim() || '…'}`}
        </code>
        .
      </p>

      <button
        className='g3-button--primary'
        disabled={!canSubmit}
        onClick={() =>
          onCreate({
            parentPath,
            name: name.trim(),
            description: description.trim()
          })
        }>
        {busy ? 'Creating…' : 'Create resource'}
      </button>
      <button disabled={busy} onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}

export default ResourceForm;
