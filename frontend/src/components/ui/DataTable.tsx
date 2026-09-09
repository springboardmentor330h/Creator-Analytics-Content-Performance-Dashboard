import React from 'react'

export interface Column<T> {
  header: string
  accessor?: keyof T | ((item: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string | number
  loading?: boolean
  emptyMessage?: string
  emptyAction?: React.ReactNode
  className?: string
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No records found.',
  emptyAction,
  className = '',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={`ciq-table-wrapper ${className}`}>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-full animate-pulse" />
          <div className="h-10 bg-slate-100 rounded w-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`ciq-table-wrapper p-8 text-center ${className}`}>
        <p className="text-xs text-slate-500">{emptyMessage}</p>
        {emptyAction && <div className="mt-3 flex justify-center">{emptyAction}</div>}
      </div>
    )
  }

  return (
    <div className={`ciq-table-wrapper ${className}`}>
      <table className="ciq-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={col.className || ''}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr key={keyExtractor(item, rowIdx)}>
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={col.className || ''}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : col.accessor
                    ? (item[col.accessor] as unknown as React.ReactNode)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
