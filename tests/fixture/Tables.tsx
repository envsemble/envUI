import { useState } from 'react';
import {
  Badge,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Theme,
  type TableSortDirection,
  type ThemeValue,
} from '@envsemble/envui';

const reports = [
  { id: 'quarterly', title: 'Quarterly report', owner: 'Aurora', reviews: 12, status: 'Ready' },
  {
    id: 'tokens',
    title: 'design-system/tokens',
    owner: 'Mira Okafor',
    reviews: 4,
    status: 'Blocked',
  },
  { id: 'audit', title: 'Accessibility audit', owner: 'Sam Lee', reviews: 27, status: 'Ready' },
  { id: 'roadmap', title: 'Roadmap', owner: 'Alex Morgan', reviews: 3, status: 'Draft' },
];
type Report = (typeof reports)[number];
type SortKey = 'title' | 'reviews';
const tones = { Ready: 'success', Blocked: 'warning', Draft: 'neutral' } as const;

function compare(key: SortKey) {
  return (first: Report, second: Report) =>
    key === 'reviews' ? first.reviews - second.reviews : first.title.localeCompare(second.title);
}

export function TablesFixture({ theme }: { theme: ThemeValue }) {
  const [sort, setSort] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>();
  const [selected, setSelected] = useState(['tokens']);
  const [widths, setWidths] = useState([40, 30, 15, 15]);
  const rows = sort
    ? [...reports].sort((first, second) =>
        sort.direction === 'ascending'
          ? compare(sort.key)(first, second)
          : compare(sort.key)(second, first),
      )
    : reports;
  const direction = (key: SortKey): TableSortDirection =>
    sort?.key === key ? sort.direction : 'none';
  const sortBy = (key: SortKey) =>
    setSort((current) => ({
      key,
      direction:
        current?.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  return (
    <Theme theme={theme} data-testid={`tables-${theme}`} className="fixture-section">
      <Table
        aria-label={`Reports ${theme}`}
        resizableColumns
        columnWidths={widths}
        onColumnWidthsChange={setWidths}
        minColumnWidths={10}
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell sortDirection={direction('title')} onSort={() => sortBy('title')}>
              Report
            </TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell
              numeric
              sortDirection={direction('reviews')}
              onSort={() => sortBy('reviews')}
            >
              Reviews
            </TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((report) => (
            <TableRow key={report.id} interactive selected={selected.includes(report.id)}>
              <TableCell>
                <Checkbox
                  label={report.title}
                  checked={selected.includes(report.id)}
                  onCheckedChange={(checked) =>
                    setSelected((current) =>
                      checked ? [...current, report.id] : current.filter((id) => id !== report.id),
                    )
                  }
                />
              </TableCell>
              <TableCell nowrap>{report.owner}</TableCell>
              <TableCell numeric>{report.reviews}</TableCell>
              <TableCell>
                <Badge tone={tones[report.status as keyof typeof tones]}>{report.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <output data-testid={`widths-${theme}`}>
        {widths.map((width) => width.toFixed(1)).join(' ')}
      </output>
      <output data-testid={`order-${theme}`}>{rows.map((report) => report.id).join(' ')}</output>

      <Table
        aria-label={`Owned widths ${theme}`}
        density="compact"
        resizableColumns
        defaultColumnWidths={[30, 35, 35]}
      >
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell resizeLabel="Resize the owner column">Owner</TableHeaderCell>
            <TableHeaderCell>State</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell nowrap>
              A very long report name that is cut short in a narrow column
            </TableCell>
            <TableCell>Aurora</TableCell>
            <TableCell>Ready</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="fixture-stack-frame" data-testid={`stack-frame-${theme}`}>
        <Table caption={`Stacked ${theme}`} narrowLayout="stack">
          <TableHead>
            <TableRow>
              <TableHeaderCell sortDirection={direction('title')} onSort={() => sortBy('title')}>
                Report
              </TableHeaderCell>
              <TableHeaderCell>Owner</TableHeaderCell>
              <TableHeaderCell numeric>Reviews</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((report) => (
              <TableRow key={report.id} interactive selected={report.id === 'tokens'}>
                <TableCell>
                  {report.title}
                  <Text variant="caption">Updated today</Text>
                </TableCell>
                <TableCell label="Owner">{report.owner}</TableCell>
                <TableCell label="Reviews" numeric>
                  {report.reviews}
                </TableCell>
                <TableCell label="Status">
                  <Badge tone={tones[report.status as keyof typeof tones]}>{report.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Theme>
  );
}
