import { useRef } from 'react';
import './SimpleInputField.css';

/**
 * @typedef {Object} SimpleInputFieldProps
 * @property {?{ isError: boolean; message: string }} [error]
 * @property {JSX.Element} input
 * @property {string | JSX.Element} label
 * @property {string} [className]
 * @property {boolean} [hideLabel]
 */

/** @param {SimpleInputFieldProps} props */
function SimpleInputField({ error, input, label, className, hideLabel }) {
  const inputEl = useRef(input);
  const inputId =
    // id for native input elements, inputId for react-select
    inputEl.current?.props?.id ?? inputEl.current?.props?.inputId ?? undefined;

  return (
    <div className={`simple-input-field__container ${className}`}>
      <label
        className={`simple-input-field__label ${
          hideLabel ? 'label-screen-reader-only' : ''
        }`}
        htmlFor={inputId}>
        {label}
      </label>
      <div
        className={`simple-input-field__input${
          error && error.isError ? ' simple-input-field__input--error' : ''
        }`}>
        {input}
      </div>
      {error && error.isError && (
        <div className='simple-input-field__error-message'>{error.message}</div>
      )}
    </div>
  );
}

export default SimpleInputField;
