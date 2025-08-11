import { useState } from 'react';
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

function Users() {
  const userTableHeaders = [
    'Username',
    'First name',
    'Last name',
    'Institution'
  ];
  const userData = useSelector((state) => state.usersSlice.users);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authKey = useSelector((state) => state.loginSlice.authKey);

  async function handleClickRow(row) {
    const userInfo = {
      username: row[0],
      first_name: row[1],
      last_name: row[2],
      institution: row[3]
    };

    dispatch(usersSliceActions.setClickedUser(userInfo));
    dispatch(fetchTotalPermissions(authKey));

    const resultAction = await dispatch(
      fetchUserInfo({ authKey, username: row[0] })
    );
    if (fetchUserInfo.fulfilled.match(resultAction)) {
      navigate('/permissions');
    } else if (fetchUserInfo.rejected.match(resultAction)) {
      const status = resultAction.payload;
      console.log('Request rejected with status:', status);
      if (status === 404) {
        setErrorMsg('This user could not be found in our database');
      } else if (status === 401) {
        dispatch(
          loginActions.setErrorMsg(
            'Your authentication key has expired. Please try again.'
          )
        );
        navigate('/');
      }
    }
  }

  return (
    <>
      <h1>Authentication Manager </h1>
      <h2> Users </h2>
      <strong> You are logged in. </strong>
      {errorMsg.length > 0 && (
        <Modal errorMsg={errorMsg} setErrorMsg={setErrorMsg} />
      )}
      <br />
      {userData.length == 0 && <p> Loading users...</p>}
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
        <button> Back to Login </button>
      </Link>
    </>
  );
}
export default Users;
