import innerText from 'react-innertext';
import './Table.css';

export function cellValueToText(value) {
  let text;
  if (value instanceof Date) {
    text = value.toLocaleDateString();
  } else if (Array.isArray(value)) {
    text = value.reduce((acc, item, index, array) => {
      if (index < array.length - 1) {
        return `${acc + cellValueToText(item)}, `;
      }
      return acc + cellValueToText(item);
    }, '');
  } else if (typeof value === 'object') {
    text = innerText(value);
  } else {
    text = value?.toString?.() ?? '';
  }
  return text;
}

function TableRow({ cols, onClick }) {
  return (
    <>
      <tr
        className='base-table__row base-table__row--stripe-color'
        onClick={onClick}>
        {cols.map((col, i) => (
          <td className='base-table__cell' key={`col_${i}`}>
            {col}
          </td>
        ))}
      </tr>
    </>
  );
}

export default TableRow;
