import { useState } from 'react';
import './TransferList.css';
import TransferListList from './TransferListList';

function TransferList({ title1, title2, initialList }) {
  /**
   * @typedef {Object} selectedObject
   * @property {string[]} firstList
   * @property {string[]} secondList
   */

  const [shuttleList, setShuttleList] = useState(initialList);
  const [selected, setSelected] = useState({ firstList: [], secondList: [] });

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
   * @param {selectedObject} selected
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
   * @param {selectedObject} selected
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

  return (
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
  );
}
export default TransferList;
