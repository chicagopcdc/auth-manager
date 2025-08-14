import { useState } from 'react';
import './TransferList.css';
import TransferListList from './TransferListList';
import { addPolicy, removePolicy } from '../Permissions/ChangePermissionsThunk';
import { useDispatch, useSelector } from 'react-redux';
import { displayPermissionsActions } from '../Permissions/PermissionsSlice';
import { changePermissionsActions } from '../Permissions/ChangePermissionsSlice';
import Modal from '../Modal/Modal';

function TransferList({ title1, title2, initList }) {
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
  const authKey = useSelector((state) => state.login.authKey);
  const username = useSelector((state) => state.users.clickedUser.username);
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

  function handleSavePermissions(
    authKey,
    username,
    envir,
    initList,
    shuttleList
  ) {
    // secondDiff returns a list of policies to add and remove
    const secondDiff = arraysDiff(initList.secondList, shuttleList.secondList);

    if (secondDiff.add.length > 0) {
      for (const pol_add of secondDiff.add) {
        addNewPolicy({
          authKey,
          username,
          envir,
          policy_name: pol_add
        });
      }
    }
    if (secondDiff.remove.length > 0) {
      removePolicies({
        authKey,
        username,
        envir,
        policy_names: secondDiff.remove
      });
    }
  }

  /**
   * An async function that removes new policies (multiple) by dispatching the
   * removePolicy thunk
   * @param {string} authKey - the authentication key, from Login
   * @param {string} username - the username of the user row being clicked, from Users
   * @param {string} envir - the selected environment, from Login
   * @param {string[]} policy_names - the policy names you would like to remove
   */
  async function removePolicies({ authKey, username, envir, policy_names }) {
    const result = await dispatch(
      removePolicy({ authKey, username, envir, policy_names })
    );
    const statusNumber = result.payload;
    if (removePolicy.rejected.match(result)) {
      dispatch(changePermissionsActions.setStatus('failed'));
      setErrMsg(
        `Status: ${statusNumber}. Failed to remove policies from username ${username}, in environment '${envir}'. 
          This change has not gone through. Please try again.`
      );
    } else if (removePolicy.fulfilled.match(result)) {
      dispatch(
        displayPermissionsActions.setSaveMsg(
          'This change was successfully saved.'
        )
      );
      setInitialList(shuttleList);
    }
  }

  /**
   * An async function that adds a new policy (only 1) by dispatching the addPolicy thunk
   * @param {string} authKey - the authentication key, from Login
   * @param {string} username - the username of the user row being clicked, from Users
   * @param {string} envir - the selected environment, from Login
   * @param {string[]} policy_name - the policy name you would like to add
   */
  async function addNewPolicy({ authKey, username, envir, policy_name }) {
    const result = await dispatch(
      addPolicy({ authKey, username, envir, policy_name })
    );
    const statusNumber = result.payload;
    if (addPolicy.rejected.match(result)) {
      dispatch(changePermissionsActions.setStatus('failed'));
      setErrMsg(
        `Status: ${statusNumber}. Failed to add policy '${policy_name}' to username ${username}, in environment '${envir}'. 
          This change has not gone through. Please try again.`
      );
    } else if (addPolicy.fulfilled.match(result)) {
      dispatch(
        displayPermissionsActions.setSaveMsg(
          'This change was successfully saved.'
        )
      );
      setInitialList(shuttleList);
    }
  }

  function modalOnExit() {
    setErrMsg('');
    window.location.reload(true);
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
            username,
            envir,
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
