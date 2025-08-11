import { Link } from 'react-router-dom';
import TransferList from '../TransferList/TransferList';
import { useSelector } from 'react-redux';
import './Permissions.css';

function Permissions() {
  let policiesList = [];

  const permissionsStatus = useSelector(
    (state) => state.permissionsSlice.permissionsStatus
  );
  const userInfoStatus = useSelector(
    (state) => state.permissionsSlice.userInfoStatus
  );
  const statusSuccess =
    permissionsStatus === 'success' && userInfoStatus === 'success';

  const totalPermissions = useSelector(
    (state) => state.permissionsSlice.totalPermissions
  );
  const userInfo = useSelector((state) => state.permissionsSlice.userInfo);
  const clickedUser = useSelector((state) => state.usersSlice.clickedUser);

  if (statusSuccess) {
    const selectedPolicies = userInfo.policies.map((pol) => pol.policy);
    const allPolicies = totalPermissions.map((perm) => perm.id);
    const availPolicies = allPolicies.filter(
      (pol) => !selectedPolicies.includes(pol)
    );

    policiesList = {
      firstList: availPolicies,
      secondList: selectedPolicies
    };
  }

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
      {!statusSuccess && <p> Loading...</p>}
      {statusSuccess && (
        <TransferList
          title1={'Available Permissions'}
          title2={'Selected Permissions'}
          initialList={policiesList}
        />
      )}

      <button className='g3-button--primary'> Save </button>
      <Link className='line-break' to='/users'>
        <button>Back to Users</button>
      </Link>
    </>
  );
}
export default Permissions;
