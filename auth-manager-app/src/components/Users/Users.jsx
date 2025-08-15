import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usersSliceActions } from '../Users/UsersSlice';
import { loginActions } from '../Login/LoginSlice';
import {
  fetchTotalPermissions,
  fetchUserInfo
} from '../Permissions/PermissionsThunks';
import Table from '../Table/Table';
import Modal from '../Modal/Modal';
import './Users.css';
import { displayPermissionsActions } from '../Permissions/PermissionsSlice';
import { fetchUsers } from './UsersThunk';
import Spinner from '../Spinner/Spinner';
import {
  setItemWithTimeout,
  getItemWithTimeout,
  authExpire
} from '../../utils';

function Users() {
  const userTableHeaders = [
    'Username',
    'First name',
    'Last name',
    'Institution'
  ];
  const userData = useSelector((state) => state.users.users);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authKey = useSelector((state) => state.login.authKey);
  const envir = useSelector((state) => state.login.envir);
  const status = useSelector((state) => state.users.status);

  /** Clears the login error message in the Login page */
  function clearLoginError() {
    dispatch(loginActions.setErrorMsg(''));
  }

  /**
   * Handles when a user row is clicked: dispatches the fetchUserInfo thunk and
   * navigates to '/permissions' if the user can be found in the arborist database,
   * else displays an error
   * @param {String[]} row - an array that contains username, first_name, last_name, and institution
   * */
  async function handleClickRow(row) {
    const userInfo = {
      username: row[0],
      first_name: row[1],
      last_name: row[2],
      institution: row[3]
    };
    setItemWithTimeout('userInfo', userInfo, 20);
    dispatch(displayPermissionsActions.setSaveMsg(''));
    dispatch(usersSliceActions.setClickedUser(userInfo));
    dispatch(fetchTotalPermissions({ authKey, envir }));

    const resultAction = await dispatch(
      fetchUserInfo({ authKey, username: row[0], envir })
    );
    if (fetchUserInfo.fulfilled.match(resultAction)) {
      navigate('/permissions');
    } else if (fetchUserInfo.rejected.match(resultAction)) {
      const userInfoStatus = resultAction.payload;
      if (userInfoStatus === 404) {
        // calls up error modal
        setErrorMsg('This user could not be found in our arborist database');
      } else {
        // redirects back to login
        authExpire(dispatch, navigate);
      }
    }
  }

  useEffect(() => {
    console.log(status);
    if (userData.length === 0 && status == 'idle') {
      const loginData = getItemWithTimeout('loginData');
      if (!loginData || !loginData.authKey || !loginData.envir) {
        authExpire(dispatch, navigate);
      }
      dispatch(loginActions.setAuth(loginData.authKey));
      dispatch(loginActions.setEnvir(loginData.envir));
      dispatch(
        fetchUsers({ authKey: loginData.authKey, envir: loginData.envir })
      ).then((result) => {
        if (fetchUsers.rejected.match(result)) {
          authExpire(dispatch, navigate);
        }
      });
    }
  }, [userData, status]);

  return (
    <>
      <h1>Authentication Manager </h1>
      <h2> Users </h2>
      <strong> You are logged in. </strong>
      {errorMsg.length > 0 && (
        <Modal errorMsg={errorMsg} onExit={() => setErrorMsg('')} />
      )}
      <br />
      {status === 'loading' && userData.length == 0 && <Spinner />}
      {userData.length > 0 && (
        <>
          <p> To set permisions for a particular user, click on that row. </p>
          <br />
          <Table
            header={userTableHeaders}
            data={userData.map((user) => [
              user.username,
              user.first_name,
              user.last_name,
              user.institution
            ])}
            handleClickRow={handleClickRow}
          />
        </>
      )}
      <Link to='/'>
        <button onClick={clearLoginError}> Back to Login </button>
      </Link>
    </>
  );
}
export default Users;
