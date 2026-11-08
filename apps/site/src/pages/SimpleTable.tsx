import type { ReactNode } from 'react';

/**
 * One column of a simple table: its heading, which is also the label a cell takes where rows
 * stack, and its share of the width, such as 16%, so a long column leaves the others room.
 */
export interface SimpleColumn {
  title: string;
  width?: string;
}

/** One row of a simple table: an id that routes and search lead to, and a cell per column. */
export interface SimpleRow {
  key: string;
  id?: string;
  cells: ReactNode[];
}

/**
 * A reference table of the Docs, drawn as the keyboard tables of component pages are, in envUI's
 * prose style: a plain header row and hairlines between rows, with no filled header, no box around
 * it and no chips around values. In a narrow container each row stacks, every cell under its
 * column's name.
 */
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

/**
 * Code in a simple table: plain monospace text, without the chip of inline code. It wraps between
 * words; a `name`, such as a token's, which has none, wraps anywhere.
 */
export function PlainCode({ name = false, children }: { name?: boolean; children: ReactNode }) {
  return (
    <code className="docs-plain-code" data-name={name || undefined}>
      {children}
    </code>
  );
}
