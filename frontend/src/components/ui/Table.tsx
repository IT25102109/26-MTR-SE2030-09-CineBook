import { type ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T extends { id: string }>({ columns, data, emptyMessage = 'No data available' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-cinema-border">
      <table className="w-full">
        <thead>
          <tr className="bg-cinema-elevated border-b border-cinema-border">
            {columns.map(col => (
              <th
                key={col.key}
                className={`text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-4 py-3 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-text-muted py-12 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-cinema-border hover:bg-cinema-elevated/50 transition-colors ${i % 2 === 0 ? 'bg-cinema-card' : 'bg-cinema-card/50'}`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-text-primary ${col.className || ''}`}>
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
