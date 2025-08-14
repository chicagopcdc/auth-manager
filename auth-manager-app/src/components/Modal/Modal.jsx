import './Modal.css';

function Modal({ errorMsg, onExit }) {
  return (
    <>
      <dialog open className='modal'>
        <h2> Error </h2>
        <p> {errorMsg} </p>
        <form method='dialog'>
          <button type='button' className='g3-button--primary' onClick={onExit}>
            Close X
          </button>
        </form>
      </dialog>
    </>
  );
}
export default Modal;
