import React, { useState, useMemo } from 'react';

/**
 * Custom hook for sorting table datasets.
 * Toggles: desc -> asc -> unsorted (default)
 */
export function useSortableData(items, initialConfig = null) {
  const [sortConfig, setSortConfig] = useState(initialConfig);

  const sortedItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    let sortableItems = [...items];

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Format dates if sorting by date field
        if (sortConfig.key.includes('date') || sortConfig.key.includes('at')) {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        }

        // Numeric string handling
        if (typeof aVal === 'string' && !isNaN(aVal) && aVal.trim() !== '') {
          aVal = parseFloat(aVal);
        }
        if (typeof bVal === 'string' && !isNaN(bVal) && bVal.trim() !== '') {
          bVal = parseFloat(bVal);
        }

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      setSortConfig(null);
      return;
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}

/**
 * Sort indicator arrow header component.
 */
export function SortHeader({ label, columnKey, sortConfig, onSort }) {
  const isSorted = sortConfig && sortConfig.key === columnKey;
  const direction = isSorted ? sortConfig.direction : null;

  return (
    <th
      onClick={() => onSort(columnKey)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.15s ease'
      }}
      title={`Click to sort by ${label} (${direction === 'desc' ? 'Ascending' : direction === 'asc' ? 'Reset' : 'Descending'})`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>{label}</span>
        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          opacity: isSorted ? 1 : 0.35,
          color: isSorted ? '#4f46e5' : 'inherit'
        }}>
          {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : '↕'}
        </span>
      </div>
    </th>
  );
}
