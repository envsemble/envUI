# Tables

## React usage

```tsx
import {
  Badge,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
} from '@envsemble/envui';

<Table aria-label="Plans">
  <TableHead>
    <TableRow>
      <TableHeaderCell>Plan</TableHeaderCell>
      <TableHeaderCell>Owner</TableHeaderCell>
      <TableHeaderCell numeric>Decisions</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {plans.map((plan) => (
      <TableRow key={plan.id} interactive>
        <TableCell>
          <Link href={plan.url} underline={false}>
            {plan.title}
          </Link>
          <Text variant="caption">{plan.folder}</Text>
        </TableCell>
        <TableCell nowrap>{plan.owner}</TableCell>
        <TableCell numeric>{plan.decisions}</TableCell>
        <TableCell>
          <Badge tone={plan.blocked ? 'warning' : 'accent'}>{plan.status}</Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

### Props & contracts

| Name                                     | Contract                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Table aria-label / caption               | Name the table: a visible caption, or aria-label without one; the scroll region shares the name                          |
| Table density                            | standard (default) or compact rows                                                                                       |
| Table stickyHeader                       | The header row stays visible while the table scrolls inside its region; give it a height                                 |
| Table regionClassName                    | Class of the scroll region, for example to limit its height                                                              |
| Table narrowLayout                       | scroll (default) keeps the columns and scrolls sideways; stack lists each body row as a block in containers below 36 rem |
| Table columnWidths / defaultColumnWidths | Column widths in percent of the table width, adding up to 100: controlled, or owned by the table from these defaults     |
| Table onColumnWidthsChange               | Receives every column's width when a column is resized                                                                   |
| Table resizableColumns                   | A handle at the end of each header cell but the last resizes the columns; needs columnWidths or defaultColumnWidths      |
| Table minColumnWidths                    | Smallest width in percent, one per column or one for all; 5 by default                                                   |
| TableHead / TableBody                    | Native thead and tbody                                                                                                   |
| TableRow interactive                     | Hover and focus-within highlight for rows that open something through a link or button inside                            |
| TableRow selected                        | aria-selected and the selection colors; pass false to the other rows when rows can be selected                           |
| TableHeaderCell / TableCell              | align start (default) or end; numeric aligns to the end with tabular figures; nowrap keeps one line                      |
| TableHeaderCell scope                    | col by default; use row for a header cell at the start of a body row                                                     |
| TableHeaderCell sortDirection / onSort   | onSort makes the header a sort button; sortDirection (ascending, descending or none) sets its arrow and aria-sort        |
| TableHeaderCell sortLabel / resizeLabel  | Accessible names of the sort button and the resize handle, for example in another language                               |
| TableCell label                          | The column's name before the value while a stack table stacks its rows                                                   |
| Native props                             | Every part accepts the native element's props, className and ref                                                         |

### Sorting, resizing and selection

```tsx
import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableSortDirection,
} from '@envsemble/envui';

const [sort, setSort] = useState<{ column: string; direction: 'ascending' | 'descending' }>();
const [widths, setWidths] = useState([45, 25, 15, 15]);
const direction = (column: string): TableSortDirection =>
  sort?.column === column ? sort.direction : 'none';
const sortBy = (column: string) =>
  setSort((current) => ({
    column,
    direction:
      current?.column === column && current.direction === 'ascending' ? 'descending' : 'ascending',
  }));

<Table aria-label="Reports" resizableColumns columnWidths={widths} onColumnWidthsChange={setWidths}>
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
    {sortedReports.map((report) => (
      <TableRow key={report.id} selected={selection.has(report.id)}>
        <TableCell>
          <Checkbox
            label={report.title}
            checked={selection.has(report.id)}
            onCheckedChange={(checked) => select(report.id, checked)}
          />
        </TableCell>
        <TableCell nowrap>{report.owner}</TableCell>
        <TableCell numeric>{report.reviews}</TableCell>
        <TableCell>{report.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>;
```

### Stacked rows in narrow containers

```tsx
<Table aria-label="Reports" narrowLayout="stack">
  <TableHead>
    <TableRow>
      <TableHeaderCell>Report</TableHeaderCell>
      <TableHeaderCell>Owner</TableHeaderCell>
      <TableHeaderCell numeric>Reviews</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {reports.map((report) => (
      <TableRow key={report.id}>
        <TableCell>{report.title}</TableCell>
        <TableCell label="Owner">{report.owner}</TableCell>
        <TableCell label="Reviews" numeric>
          {report.reviews}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Guidelines

- Use a table for data people compare across rows and columns. Use grouped rows or cards for a short list of items with actions.
- The table sits on a rounded surface with subtle dividers between rows. It is a focusable region that scrolls sideways when the columns do not fit, so keyboard users can scroll it too.
- Put a muted second line under a cell's main text with `<Text variant="caption">`, for example a folder under a title.
- Keep actions in the cells as links or buttons; interactive only adds the hover highlight. Badges show states, and numeric columns compare best with numeric.
- stickyHeader makes the region scroll vertically as well, so give it a height through regionClassName or the surrounding layout.
- A sortable header is a button across the whole cell: its label, then an arrow for the current order, or a neutral double arrow while the column is not sorted. In numeric columns the arrow comes first, so the label lines up with the numbers. The header announces its order through aria-sort, and the button's name says what pressing it does, such as "Report, sort ascending". The application sorts the rows and decides the next order.
- Resizable columns move the boundary between a column and the next one, so the table keeps its width. Drag the handle at the end of a header cell, or focus it and press <kbd>←</kbd> or <kbd>→</kbd> to move it by 1 percent, with <kbd>Shift</kbd> by 5 percent; <kbd>Home</kbd> and <kbd>End</kbd> go to the column's smallest and largest width. Double-click a handle to restore the starting widths. Columns with set widths wrap long words and cut nowrap cells short with an ellipsis.
- Selected rows take the navigation selection color with a bar at their start. Pair selected with a control people use to select, such as a Checkbox in the first cell, and pass selected={false} to the other rows so assistive technology announces them as not selected.
- narrowLayout="stack" follows the width of the table's container, not the window, so place the table where it gets a width, such as a block or a grid cell, rather than in a container that shrinks to its content. Below 36 rem each body row becomes a block: the first cell is its title, and the other cells show their label beside their value. The header row is then visually hidden but still read by assistive technology, and appears while a sort button in it has keyboard focus; offer another sort control where sorting matters on small screens. Resize handles are hidden while rows are stacked.

TypeScript declarations provide the complete public API.

## Related topics

- [Grouped rows](../components/rows.md)
- [Badges & counters](../components/badges.md)
- [Typography](../foundations/typography.md)
