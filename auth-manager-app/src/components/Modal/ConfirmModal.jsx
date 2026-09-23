import './Modal.css';

/**
 * Deleting a policy or a role takes access away from people, and nothing here
 * is undoable, so say plainly what is about to happen before it does.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {React.ReactNode} props.children - what the deletion will affect
 * @param {string} [props.confirmLabel]
 * @param {boolean} [props.busy]
 * @param {function} props.onConfirm
 * @param {function} props.onCancel
 */
function ConfirmModal({
  title,
  children,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel
}) {
  return (
    <dialog open className='modal'>
      <h2>{title}</h2>
      <div>{children}</div>
      <form method='dialog'>
        <button
          type='button'
          className='g3-button--primary'
          disabled={busy}
          onClick={onConfirm}>
          {busy ? 'Working…' : confirmLabel}
        </button>
        <button type='button' disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </form>
    </dialog>
  );
}

export default ConfirmModal;
