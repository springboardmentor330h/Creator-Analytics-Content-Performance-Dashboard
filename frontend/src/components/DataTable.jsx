/**
 * Generic table. `columns` is an array of { key, label }.
 * `rows` is an array of objects. Renders row[column.key] in each cell.
 */
export default function DataTable({ title, columns, rows }) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      {title && <h3 className="mb-3 text-base font-semibold">{title}</h3>}
      {!hasRows ? (
        <p className="py-10 text-center text-sm text-gray-400">No data available yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                {columns.map((col) => (
                  <th key={col.key} className="py-2 pr-4 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="py-2 pr-4">
                      {row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}