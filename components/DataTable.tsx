import type { ReactNode } from 'react';

export type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
};

export default function DataTable<T>({
  items,
  columns,
  emptyMessage = 'No data',
}: {
  items: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}) {
  return (
    <div className="section">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
          ) : (
            items.map((item, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col) => {
                  const value = col.accessor ? (item as Record<string, unknown>)[col.accessor as string] : '';
                  return (
                    <td key={col.header}>
                      {col.render ? col.render(item) : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
