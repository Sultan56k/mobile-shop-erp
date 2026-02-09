export default function Table({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : ''}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                    <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] md:max-w-none">
                      {column.render ? column.render(row) : row[column.accessor]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
