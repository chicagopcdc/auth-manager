import { useState } from 'react';
import './TransferList.css';
import TransferListList from './TransferListList';
import { addPolicy, removePolicy } from '../Permissions/ChangePermissionsThunk';
import { useDispatch, useSelector } from 'react-redux';
import { displayPermissionsActions } from '../Permissions/PermissionsSlice';
import { changePermissionsActions } from '../Permissions/ChangePermissionsSlice';
import { clientsSliceActions } from '../Clients/ClientsSlice';
import Modal from '../Modal/Modal';
import { authExpire } from '../../utils';
import { useNavigate } from 'react-router-dom';

function TransferList({
  title1,
  title2,
  initList,
  subjectType,
  subjectIdentifier
}) {
  /**
   * @typedef {Object} selectedObject
   * @property {string[]} firstList
   * @property {string[]} secondList
   */
  const [initialList, setInitialList] = useState(initList);
  const [shuttleList, setShuttleList] = useState(initList);
  const [selected, setSelected] = useState({ firstList: [], secondList: [] });
  const [errMsg, setErrMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authKey = useSelector((state) => state.login.authKey);
  const envir = useSelector((state) => state.login.envir);

  const movableToSecond = selected.firstList.length > 0;
  const movableToFirst = selected.secondList.length > 0;

  /**
   * changes the selected state when a li is clicked
   * @param {string} itemName - the name of the clicked item
   * @param {string} listStr - whichever list the clicked item is from, 'first' or 'second'
   */
  function handleItemSelected(itemName, listStr) {
    setSelected((prev) => {
      if (prev.secondList.includes(itemName)) {
        return {
          ...prev,
          secondList: prev.secondList.filter((s) => s !== itemName)
        };
      } else if (prev.firstList.includes(itemName)) {
        return {
          ...prev,
          firstList: prev.firstList.filter((s) => s !== itemName)
        };
      } else {
        return { ...prev, [listStr]: [...prev[listStr], itemName] };
      }
    });
  }

  /**
   * Transfers selected items to the second filter list
   * @param {selectedObject} selected - contains items that are currently selected inside firstList and secondList
   */
  function transferToSecond(selected) {
    setSelected((prevSelected) => {
      return { firstList: [], secondList: [...prevSelected.secondList] };
    });
    setShuttleList((prev) => {
      return {
        firstList: prev.firstList.filter(
          (item) => !selected.firstList.includes(item)
        ),
        secondList: [...prev.secondList, ...selected.firstList]
      };
    });
  }

  /**
   * Transfers selected items to the first filter list
   * @param {selectedObject} selected - contains items that are currently selected inside firstList and secondList
   */
  function transferToFirst(selected) {
    setShuttleList((prev) => {
      return {
        secondList: prev.secondList.filter(
          (item) => !selected.secondList.includes(item)
        ),
        firstList: [...prev.firstList, ...selected.secondList]
      };
    });
    setSelected((prevSelected) => {
      return { firstList: [...prevSelected.firstList], secondList: [] };
    });
  }

  /**
   * Checks for the difference between two shuttleLists. Returns `diff` (an object that specifies the difference between
   * the two lists). As long as the lists have the same items, they are considered equal (variations in order don't count).
   *
   * - `diff = {add: 'read_write', remove: []}` means `read_write`, which was originally not in `initList`, was added in `finalList`,
   * and all other items originally in `initList` are also in `finalList` (`diff.remove` is empty)
   * - `diff = {add: [], remove: ['read_write']}` means `read_write`, which was originally in `initList`, was removed in `finalList`,
   * and all other items stayed the same (`diff.add` is empty)
   *
   * @param {string[]} initList
   * @param {string[]} finalList
   */
  function arraysDiff(initList, finalList) {
    const add = finalList.filter((item) => !initList.includes(item));
    const remove = initList.filter((item) => !finalList.includes(item));
    return { add, remove };
  }

  async function handleSavePermissions(
    authKey,
    envir,
    subjectType,
    subjectIdentifier,
    initList,
    shuttleList
  ) {
    dispatch(changePermissionsActions.setStatus('idle'));
    setErrMsg('');
    dispatch(displayPermissionsActions.setSaveMsg(''));

    const secondDiff = arraysDiff(initList.secondList, shuttleList.secondList);

    if (secondDiff.add.length > 0) {
      if (subjectType === 'client') {
        const addSucceeded = await addNewPolicies({
          authKey,
          envir,
          subjectType,
          clientID: subjectIdentifier,
          policy_names: secondDiff.add
        });

        if (!addSucceeded) {
          return;
        }
      } else {
        for (const policyName of secondDiff.add) {
          const addSucceeded = await addNewPolicies({
            authKey,
            envir,
            subjectType,
            username: subjectIdentifier,
            policy_name: policyName
          });

          if (!addSucceeded) {
            return;
          }
        }
      }
    }

    if (secondDiff.remove.length > 0) {
      const removeSucceeded = await removePolicies({
        authKey,
        envir,
        subjectType,
        username: subjectType === 'user' ? subjectIdentifier : undefined,
        clientID: subjectType === 'client' ? subjectIdentifier : undefined,
        policy_names: secondDiff.remove
      });

      if (!removeSucceeded) {
        return;
      }
    }

    if (subjectType === 'client') {
      dispatch(
        clientsSliceActions.setClientPolicies({
          clientID: subjectIdentifier,
          policies: shuttleList.secondList
        })
      );
    }

    dispatch(
      displayPermissionsActions.setSaveMsg(
        'This change was successfully saved.'
      )
    );
    setInitialList(shuttleList);
  }

  /**
   * An async function that removes new policies (multiple) by dispatching the
   * removePolicy thunk
   * @param {string} authKey - the authentication key, from Login
   * @param {string} username - the username of the user row being clicked, from Users
   * @param {string} envir - the selected environment, from Login
   * @param {string[]} policy_names - the policy names you would like to remove
   */
  async function removePolicies({
    authKey,
    envir,
    subjectType,
    username,
    clientID,
    policy_names
  }) {
    const result = await dispatch(
      removePolicy({
        authKey,
        envir,
        subjectType,
        username,
        clientID,
        policy_names
      })
    );

    const statusNumber = result.payload;
    const subjectLabel = subjectType === 'client' ? clientID : username;

    if (removePolicy.rejected.match(result)) {
      dispatch(changePermissionsActions.setStatus('failed'));
      setErrMsg(
        `Status: ${statusNumber}. Failed to remove policies from ${subjectType} ${subjectLabel}, in environment '${envir}'.`
      );
      return false;
    }

    return true;
  }

  async function addNewPolicies({
    authKey,
    envir,
    subjectType,
    username,
    clientID,
    policy_name,
    policy_names
  }) {
    const result = await dispatch(
      addPolicy({
        authKey,
        envir,
        subjectType,
        username,
        clientID,
        policy_name,
        policy_names
      })
    );

    const statusNumber = result.payload;
    const subjectLabel = subjectType === 'client' ? clientID : username;

    if (addPolicy.rejected.match(result)) {
      dispatch(changePermissionsActions.setStatus('failed'));
      setErrMsg(
        `Status: ${statusNumber}. Failed to add policies to ${subjectType} ${subjectLabel}, in environment '${envir}'.`
      );
      return false;
    }

    return true;
  }

  function modalOnExit() {
    authExpire(dispatch, navigate);
  }

  return (
    <>
      {errMsg.length > 0 && <Modal errorMsg={errMsg} onExit={modalOnExit} />}
      <div className='transfer-list-container'>
        <TransferListList
          title={title1}
          name='firstList'
          items={shuttleList.firstList}
          handleItemSelected={handleItemSelected}
          selected={selected}
        />
        <div>
          <button
            className={`switch ${movableToSecond ? 'active' : ''}`}
            onClick={() => transferToSecond(selected)}>
            {'>'}
          </button>
          <button
            className={`switch ${movableToFirst ? 'active' : ''}`}
            onClick={() => transferToFirst(selected)}>
            {'<'}
          </button>
        </div>
        <TransferListList
          title={title2}
          name='secondList'
          items={shuttleList.secondList}
          handleItemSelected={handleItemSelected}
          selected={selected}
        />
      </div>
      <button
        className='g3-button--primary'
        onClick={() =>
          handleSavePermissions(
            authKey,
            envir,
            subjectType,
            subjectIdentifier,
            initialList,
            shuttleList
          )
        }>
        Save
      </button>
    </>
  );
}
export default TransferList;
