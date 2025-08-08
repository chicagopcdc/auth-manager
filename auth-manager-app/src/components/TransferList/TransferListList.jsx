/**
 *
 * @typedef {Object} TransferListListProps
 * @property {string} title
 * @property {string} name
 * @property {string[]} items
 * @property {(itemName: string, listStr:string) => selectedObject} handleItemSelected
 * @property {selectedObject} selected
 
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
