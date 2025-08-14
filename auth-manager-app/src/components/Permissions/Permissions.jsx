import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import TransferList from '../TransferList/TransferList';
import { useDispatch, useSelector } from 'react-redux';
import { loginActions } from '../Login/LoginSlice';
import Spinner from '../Spinner/Spinner';
import { usersSliceActions } from '../Users/UsersSlice';
import { fetchTotalPermissions } from './PermissionsThunks';
import { fetchUserInfo } from './PermissionsThunks';
import { getItemWithTimeout, authExpire } from '../../utils';
import './Permissions.css';

function Permissions() {
  let policiesList = [];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const permissionsStatus = useSelector(
    (state) => state.displayPermissions.permissionsStatus
  );
  const userInfoStatus = useSelector(
    (state) => state.displayPermissions.userInfoStatus
  );
  const statusSuccess =
    permissionsStatus === 'success' && userInfoStatus === 'success';

  const totalPermissions = useSelector(
    (state) => state.displayPermissions.totalPermissions
  );
  const userInfo = useSelector((state) => state.displayPermissions.userInfo);
  const clickedUser = useSelector((state) => state.users.clickedUser);
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

  if (statusSuccess) {
    const selectedPolicies = userInfo.policies.map((pol) => pol.policy);
    const allPolicies = totalPermissions.map((perm) => perm.id);
    const availPolicies = allPolicies.filter(
      (pol) => !selectedPolicies.includes(pol)
    );

    // firstList is always the avilable policies, secondList the selected policies (for a user)
    policiesList = {
      firstList: availPolicies,
      secondList: selectedPolicies
    };
  }

  useEffect(() => {
    if (Object.keys(userInfo).length === 0) {
      const userInfo = getItemWithTimeout('userInfo');
      const loginData = getItemWithTimeout('loginData');
      if (!userInfo || !loginData) {
        authExpire(dispatch, navigate);
      }
      dispatch(usersSliceActions.setClickedUser(userInfo));
      dispatch(loginActions.setAuth(loginData.authKey));
      dispatch(loginActions.setEnvir(loginData.envir));
      dispatch(
        fetchTotalPermissions({
          authKey: loginData.authKey,
          envir: loginData.envir
        })
      ).then((totalPermResult) => {
        if (fetchTotalPermissions.rejected.match(totalPermResult)) {
          authExpire(dispatch, navigate);
        }
      });
      dispatch(
        fetchUserInfo({
          authKey: loginData.authKey,
          username: userInfo.username,
          envir: loginData.envir
        })
      ).then((userInfoResult) => {
        if (fetchUserInfo.rejected.match(userInfoResult)) {
          const infoStatus = userInfoResult.payload;
          if (infoStatus === 401) {
            authExpire(dispatch, navigate);
          }
        }
      });
    }
  }, [userInfo]);

  return (
    <>
      <div className='user-info'>
        <h1>Authentication Manager </h1>
        <h2> Permissions</h2>
        <p>
          <strong> Username:</strong> {clickedUser.username}
        </p>
        <p>
          <strong>First name: </strong>
          {clickedUser.first_name}
        </p>
        <p>
          <strong> Last name: </strong>
          {clickedUser.last_name}
        </p>
        <p className='line-break-below'>
          <strong> Institution: </strong>
          {clickedUser.institution}
        </p>
      </div>
      {!statusSuccess && <Spinner />}
      {statusSuccess && (
        <TransferList
          title1={'Available Permissions'}
          title2={'Selected Permissions'}
          initList={policiesList}
        />
      )}
      <Link className='line-break' to='/users'>
        <button>Back to Users</button>
      </Link>
      {(addPolicyStatus === 'loading' || removePolicyStatus === 'loading') && (
        <Spinner />
      )}
      {changePermStatus !== 'failed' && saveMsg.length > 0 && (
        <p> {saveMsg} </p>
      )}
    </>
  );
}
export default Permissions;
