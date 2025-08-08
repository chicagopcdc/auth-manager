import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginActions } from './LoginSlice';
import { fetchUsers } from '../Users/UsersThunk';
import './Login.css';

/**
 * @typedef {Object} ValidateObject
 * @property {bool} bool
 * @property {string} msg
 */

function Login() {
  const ENVIRONMENTS = [
    'portal.pedscommons.org',
    'gearbox.pedscommons.org',
    'portal-dev.pedscommons.org',
    'gearbox-dev.pedscommons.org'
  ];
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginData = useSelector((state) => state.loginSlice);

  /**
   * Validates the login. Returns whether or not it is valid (bool) and an error/success message (msg).
   * @param {string} authKey
   * @param {string} envir
   * @returns {ValidateObject} an object of {bool, msg}
   */
  function validateLogin(authKey, envir) {
    if (envir === '') {
      return {
        isValid: false,
        msg: 'Please select an environment and submit again.'
      };
    }
    if (authKey.trim() === '') {
      return {
        isValid: false,
        msg: 'Your authentication key is empty. Please try again.'
      };
    }

    return {
      isValid: true,
      msg: 'You are successfully authenticated.'
    };
  }

  const handleSubmit = async (authKey, envir) => {
    const { isValid, msg } = validateLogin(authKey, envir);
    if (!isValid) {
      setErrorMsg(msg);
      return;
    }
    try {
      const response = await dispatch(fetchUsers(authKey));
      if (response && fetchUsers.fulfilled.match(response)) {
        navigate('/users');
      } else {
        setErrorMsg('Your authentication key is incorrect. Please try again.');
      }
    } catch (e) {
      setErrorMsg('An expected error occured. Please try again.');
    }
  };

  return (
    <>
      <h1>Authentication Manager </h1>
      <h2>Login</h2>
      <p> Select the environment and use your authentication key to login.</p>
      <br />
      <div className='left-down-margin'>
        <p>
          Environment:
          <select
            className='space-out'
            value={loginData.envir}
            onChange={(e) => dispatch(loginActions.setEnvir(e.target.value))}>
            <option value=''> - Select an environment - </option>
            {ENVIRONMENTS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </p>
      </div>
      <div className='left-down-margin'>
        <p>
          Authentication key:
          <textarea
            className='space-out'
            value={loginData.authKey}
            onChange={(e) => dispatch(loginActions.setAuth(e.target.value))}
          />
        </p>
      </div>
      <div>
        <button
          className='g3-button--primary'
          onClick={() => handleSubmit(loginData.authKey, loginData.envir)}>
          Submit
        </button>
        {errorMsg !== 'You are successfully authenticated.' && (
          <div>
            <p className='error-msg'>{errorMsg}</p>
          </div>
        )}
      </div>
    </>
  );
}
export default Login;
