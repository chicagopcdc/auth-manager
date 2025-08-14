import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginActions } from './LoginSlice';
import { fetchUsers } from '../Users/UsersThunk';
import Spinner from '../Spinner/Spinner';
import { setItemWithTimeout } from '../../utils';
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginData = useSelector((state) => state.login);
  const fetchUsersStatus = useSelector((state) => state.users.status);

  /**
   * Checks for empty input in the login. Returns whether or not it is partially empty (bool) and an error/success message (msg).
   * @param {string} authKey - the authentication key, from Login
   * @param {string} envir - the selected environment, from Login
   * @returns {ValidateObject} an object of {bool, msg}
   */
  function isEmptyLogin(authKey, envir) {
    if (!envir)
      return {
        isEmpty: true,
        msg: 'Please select an environment and submit again.'
      };
    if (!authKey.trim())
      return {
        isEmpty: true,
        msg: 'Your authentication key is empty. Please try again.'
      };
    return { isEmpty: false, msg: 'You are successfully authenticated.' };
  }

  /**
   * handles submissions by validating the login of the user
   * @param {string} authKey - the authentication key, from Login
   * @param {string} envir - the selected environment, from Login
   */
  const handleSubmit = async (authKey, envir) => {
    sessionStorage.removeItem('userInfo');
    dispatch(loginActions.setErrorMsg(''));
    const { isEmpty, msg } = isEmptyLogin(authKey, envir);
    if (isEmpty) {
      dispatch(loginActions.setErrorMsg(msg));
      return;
    }
    try {
      const response = await dispatch(fetchUsers({ authKey, envir }));
      if (response && fetchUsers.fulfilled.match(response)) {
        setItemWithTimeout('loginData', { authKey, envir }, 20);
        navigate('/users');
      } else {
        dispatch(
          loginActions.setErrorMsg(
            'Your authentication key is incorrect. Please try again.'
          )
        );
      }
    } catch (e) {
      dispatch(
        loginActions.setErrorMsg('An expected error occured. Please try again.')
      );
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
        {fetchUsersStatus === 'loading' && <Spinner />}
        {loginData.errorMsg !== 'You are successfully authenticated.' && (
          <div>
            <p className='msg' style={{ color: 'red' }}>
              {loginData.errorMsg}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
export default Login;
