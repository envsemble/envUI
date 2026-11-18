import type { ReactNode } from 'react';

export interface SimpleColumn {
  title: string;
  width?: string;
}

export interface SimpleRow {
  key: string;
  id?: string;
  cells: ReactNode[];
}

export function SimpleTable({
  label,
  columns,
  rows,
}: {
  label: string;
  columns: readonly SimpleColumn[];
  rows: readonly SimpleRow[];
}) {
  return (
    <div className="env-prose docs-simple-table">
      <table aria-label={label} data-fixed={columns.some(({ width }) => width) || undefined}>
        <thead>
          <tr>
            {columns.map(({ title, width }) => (
              <th key={title} scope="col" style={width ? { inlineSize: width } : undefined}>
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, id, cells }) => (
            <tr key={key} id={id}>
              {cells.map((cell, index) => (
                <td key={columns[index].title} data-label={columns[index].title}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlainCode({ name = false, children }: { name?: boolean; children: ReactNode }) {
  return (
    <code className="docs-plain-code" data-name={name || undefined}>
      {children}
    </code>
  );
}
