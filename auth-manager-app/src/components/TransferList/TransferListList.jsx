/**
 *
 * @typedef {Object} TransferListListProps
 * @property {string} title the display title 
 * @property {string} name the name of the transferlist list: 'firstList' or 'secondList'
 * @property {string[]} items the items inside that list, e.g. shuttleList.secondList
 * @property {(itemName: string, listStr:string) => selectedObject} handleItemSelected a function that handles item selection
 * @property {selectedObject} selected contains firstList and secondList arrays
 
 * @typedef {Object} selectedObject
 * @property {string[]} firstList
 * @property {string[]} secondList
 */

/** @param {TransferListListProps} props */
function TransferListList({
  title,
  name,
  items,
  handleItemSelected,
  selected
}) {
  return (
    <div className='transfer-list-list'>
      <h4> {title} </h4>
      <ul>
        {items.map((permission) => (
          <li
            key={`${name}: ${permission}`}
            style={{
              backgroundColor:
                selected.firstList.includes(permission) ||
                selected.secondList.includes(permission)
                  ? '#add9e6'
                  : null
            }}
            onClick={() => handleItemSelected(permission, name)}>
            {permission}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default TransferListList;
