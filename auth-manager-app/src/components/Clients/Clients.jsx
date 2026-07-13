import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../Table/Table';
import Modal from '../Modal/Modal';
import Spinner from '../Spinner/Spinner';
import { loginActions } from '../Login/LoginSlice';
import { displayPermissionsActions } from '../Permissions/PermissionsSlice';
import { fetchTotalPermissions } from '../Permissions/PermissionsThunks';
import { clientsSliceActions } from './ClientsSlice';
import { fetchClients } from './ClientsThunk';
import {
  authExpire,
  getItemWithTimeout,
  setItemWithTimeout
} from '../../utils';

function Clients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clients = useSelector((state) => state.clients.clients);
  const status = useSelector((state) => state.clients.status);
  const authKey = useSelector((state) => state.login.authKey);
  const envir = useSelector((state) => state.login.envir);

  const [errorMsg, setErrorMsg] = useState('');
  const hasRequestedClients = useRef(false);

  const clientTableHeaders = ['Client name', 'Client ID'];

  function handleClickRow(row) {
    const selectedClient = clients.find((client) => client.clientID === row[1]);

    if (!selectedClient) {
      setErrorMsg('Unable to find the selected client.');
      return;
    }

    const clientInfo = {
      name: selectedClient?.name || '',
      clientID: selectedClient?.clientID,
      policies: selectedClient?.policies || []
    };

    setItemWithTimeout(
      'permissionSubject',
      {
        subjectType: 'client',
        subject: clientInfo
      },
      20
    );

    dispatch(displayPermissionsActions.setSaveMsg(''));
    dispatch(clientsSliceActions.setClickedClient(clientInfo));
    dispatch(fetchTotalPermissions({ authKey, envir }));

    navigate('/permissions');
  }

  useEffect(() => {
    if (clients.length !== 0 || hasRequestedClients.current) {
      return;
    }

    hasRequestedClients.current = true;

    const loginData = getItemWithTimeout('loginData');

    if (!loginData?.authKey || !loginData?.envir) {
      authExpire(dispatch, navigate);
      return;
    }

    dispatch(loginActions.setAuth(loginData.authKey));
    dispatch(loginActions.setEnvir(loginData.envir));

    dispatch(
      fetchClients({
        authKey: loginData.authKey,
        envir: loginData.envir
      })
    ).then((result) => {
      if (fetchClients.rejected.match(result)) {
        if (result.payload === 401 || result.payload === 403) {
          authExpire(dispatch, navigate);
          return;
        }

        setErrorMsg('Unable to load clients from this environment.');
      }
    });
  }, [clients, dispatch, navigate, status]);

  return (
    <>
      <h1>Authentication Manager</h1>
      <h2>Clients</h2>
      <strong>You are logged in.</strong>

      {errorMsg && (
        <Modal errorMsg={errorMsg} onExit={() => setErrorMsg('')} />
      )}

      <br />

      <Link to='/users'>
        <button>View Users</button>
      </Link>

      {status === 'loading' && clients.length === 0 && <Spinner />}

      {status === 'success' && clients.length === 0 && (
        <p>No clients were found in this environment.</p>
      )}

      {clients.length > 0 && (
        <>
          <p>To set permissions for a client, click on that row.</p>
          <br />
          <Table
            header={clientTableHeaders}
            data={clients.map((client) => [
              client.name || '',
              client.clientID
            ])}
            handleClickRow={handleClickRow}
          />
        </>
      )}

      <Link to='/'>
        <button>Back to Login</button>
      </Link>
    </>
  );
}

export default Clients;
