import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TransferList from '../TransferList/TransferList';
import Spinner from '../Spinner/Spinner';
import { loginActions } from '../Login/LoginSlice';
import { usersSliceActions } from '../Users/UsersSlice';
import { clientsSliceActions } from '../Clients/ClientsSlice';
import {
  fetchTotalPermissions,
  fetchUserInfo
} from './PermissionsThunks';
import { getItemWithTimeout, authExpire } from '../../utils';
import './Permissions.css';

function Permissions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const permissionsStatus = useSelector(
    (state) => state.displayPermissions.permissionsStatus
  );
  const userInfoStatus = useSelector(
    (state) => state.displayPermissions.userInfoStatus
  );
  const totalPermissions = useSelector(
    (state) => state.displayPermissions.totalPermissions
  );
  const userInfo = useSelector((state) => state.displayPermissions.userInfo);
  const clickedUser = useSelector((state) => state.users.clickedUser);
  const clickedClient = useSelector((state) => state.clients.clickedClient);
  const saveMsg = useSelector((state) => state.displayPermissions.saveMsg);
  const addPolicyStatus = useSelector(
    (state) => state.changePermissions.addPolicyStatus
  );
  const removePolicyStatus = useSelector(
    (state) => state.changePermissions.removePolicyStatus
  );
  const changePermStatus = useSelector(
    (state) => state.changePermissions.status
  );

  const storedPermissionSubject = getItemWithTimeout('permissionSubject');

  const subjectType =
    storedPermissionSubject?.subjectType ||
    (clickedClient.clientID ? 'client' : 'user');

  const selectedSubject =
    subjectType === 'client'
      ? clickedClient.clientID
        ? clickedClient
        : storedPermissionSubject?.subject || {}
      : clickedUser.username
        ? clickedUser
        : storedPermissionSubject?.subject || {};

  const subjectIdentifier =
    subjectType === 'client'
      ? selectedSubject.clientID
      : selectedSubject.username;

  const statusSuccess =
    permissionsStatus === 'success' &&
    (subjectType === 'client' || userInfoStatus === 'success');

  let policiesList = {
    firstList: [],
    secondList: []
  };

  if (statusSuccess) {
    const subjectPolicies =
      subjectType === 'client'
        ? selectedSubject.policies || []
        : userInfo.policies || [];

    const selectedPolicies = subjectPolicies
      .map((policy) =>
        typeof policy === 'string' ? policy : policy.policy
      )
      .filter(Boolean);

    const allPolicies = totalPermissions.map((permission) => permission.id);

    policiesList = {
      firstList: allPolicies.filter(
        (policy) => !selectedPolicies.includes(policy)
      ),
      secondList: selectedPolicies
    };
  }

  useEffect(() => {
    const loginData = getItemWithTimeout('loginData');
    const permissionSubject = getItemWithTimeout('permissionSubject');

    if (
      !loginData?.authKey ||
      !loginData?.envir ||
      !permissionSubject?.subjectType ||
      !permissionSubject?.subject
    ) {
      authExpire(dispatch, navigate);
      return;
    }

    dispatch(loginActions.setAuth(loginData.authKey));
    dispatch(loginActions.setEnvir(loginData.envir));

    if (permissionsStatus === 'idle') {
      dispatch(
        fetchTotalPermissions({
          authKey: loginData.authKey,
          envir: loginData.envir
        })
      ).then((result) => {
        if (fetchTotalPermissions.rejected.match(result)) {
          authExpire(dispatch, navigate);
        }
      });
    }

    if (permissionSubject.subjectType === 'client') {
      if (!clickedClient.clientID) {
        dispatch(
          clientsSliceActions.setClickedClient(
            permissionSubject.subject
          )
        );
      }
      return;
    }

    if (!clickedUser.username) {
      dispatch(
        usersSliceActions.setClickedUser(permissionSubject.subject)
      );
    }

    if (userInfoStatus === 'idle') {
      dispatch(
        fetchUserInfo({
          authKey: loginData.authKey,
          username: permissionSubject.subject.username,
          envir: loginData.envir
        })
      ).then((result) => {
        if (fetchUserInfo.rejected.match(result)) {
          authExpire(dispatch, navigate);
        }
      });
    }
  }, [
    clickedClient.clientID,
    clickedUser.username,
    dispatch,
    navigate,
    permissionsStatus,
    userInfoStatus
  ]);

  return (
    <>
      <div className='user-info'>
        <h1>Authentication Manager</h1>
        <h2>Permissions</h2>

        {subjectType === 'client' ? (
          <>
            <p>
              <strong>Client name: </strong>
              {selectedSubject.name || 'N/A'}
            </p>
            <p className='line-break-below'>
              <strong>Client ID: </strong>
              {selectedSubject.clientID}
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Username: </strong>
              {selectedSubject.username}
            </p>
            <p>
              <strong>First name: </strong>
              {selectedSubject.first_name}
            </p>
            <p>
              <strong>Last name: </strong>
              {selectedSubject.last_name}
            </p>
            <p className='line-break-below'>
              <strong>Institution: </strong>
              {selectedSubject.institution}
            </p>
          </>
        )}
      </div>

      {!statusSuccess && <Spinner />}

      {statusSuccess && (
        <TransferList
          title1='Available Permissions'
          title2='Selected Permissions'
          initList={policiesList}
          subjectType={subjectType}
          subjectIdentifier={subjectIdentifier}
        />
      )}

      <Link
        className='line-break'
        to={subjectType === 'client' ? '/clients' : '/users'}>
        <button>
          Back to {subjectType === 'client' ? 'Clients' : 'Users'}
        </button>
      </Link>

      {(addPolicyStatus === 'loading' ||
        removePolicyStatus === 'loading') && <Spinner />}

      {changePermStatus !== 'failed' && saveMsg.length > 0 && (
        <p>{saveMsg}</p>
      )}
    </>
  );
}

export default Permissions;
