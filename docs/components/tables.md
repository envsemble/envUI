# Tables

## React usage

```tsx
import { Badge, Link, Table, Text } from '@envsemble/envui';

<Table.Root aria-label="Plans">
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell>Plan</Table.HeaderCell>
      <Table.HeaderCell>Owner</Table.HeaderCell>
      <Table.HeaderCell numeric>Decisions</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {plans.map((plan) => (
      <Table.Row key={plan.id} interactive>
        <Table.Cell>
          <Link href={plan.url} underline={false}>
            {plan.title}
          </Link>
          <Text variant="caption">{plan.folder}</Text>
        </Table.Cell>
        <Table.Cell nowrap>{plan.owner}</Table.Cell>
        <Table.Cell numeric>{plan.decisions}</Table.Cell>
        <Table.Cell>
          <Badge tone={plan.blocked ? 'warning' : 'accent'}>{plan.status}</Badge>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table.Root>;
```

### Props & contracts

| Name                                          | Contract                                                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Table.Root aria-label / caption               | Name the table: a visible caption, or aria-label without one; the scroll region shares the name                                                                     |
| Table.Root density                            | standard (default) or compact rows; in compact tables, controls in the cells take the compact control height                                                        |
| Table.Root stickyHeader                       | The header row stays visible while the table scrolls inside its region; give it a height                                                                            |
| Table.Root regionClassName                    | Class of the scroll region, for example to limit its height                                                                                                         |
| Table.Root narrowLayout                       | scroll (default) keeps the columns and scrolls sideways; stack lists each body row as a block when the region is narrower than stackBelow                           |
| Table.Root stackBelow                         | The region width below which a stack table stacks its rows: a CSS length such as 60rem or 480px, or a number of pixels, such as 600 or "600"; 36rem by default      |
| Table.Root onStackedChange                    | Called with true when the rows stack and false when the columns return, also when a table leaves while its rows stack; the region has data-stacked while they stack |
| Table.Root columnWidths / defaultColumnWidths | Column widths in percent of the table width, adding up to 100: controlled, or owned by the table from these defaults                                                |
| Table.Root onColumnWidthsChange               | Receives every column's width when a column is resized                                                                                                              |
| Table.Root resizableColumns                   | A handle at the end of each header cell but the last resizes the columns; needs columnWidths or defaultColumnWidths                                                 |
| Table.Root minColumnWidths                    | Smallest width in percent, one per column or one for all; 5 by default                                                                                              |
| Table.Head / Table.Body                       | Native thead and tbody                                                                                                                                              |
| Table.Row interactive                         | Hover and focus-within highlight for rows that open something through a link or button inside                                                                       |
| Table.Row selected                            | aria-selected and the selection colors; pass false to the other rows when rows can be selected                                                                      |
| Table.HeaderCell / Table.Cell                 | align start (default) or end; numeric aligns to the end with tabular figures; nowrap keeps one line                                                                 |
| Table.HeaderCell scope                        | col by default; use row for a header cell at the start of a body row                                                                                                |
| Table.HeaderCell sortDirection / onSort       | onSort makes the header a sort button; sortDirection (ascending, descending or none) sets its arrow and aria-sort                                                   |
| Table.HeaderCell sortLabel / resizeLabel      | Accessible names of the sort button and the resize handle, for example in another language                                                                          |
| Table.Cell label                              | The column's name before the value while a stack table stacks its rows                                                                                              |
| Native props                                  | Every part accepts the native element's props, className and ref                                                                                                    |

### Sorting, resizing and selection

```tsx
import { Checkbox, Table } from '@envsemble/envui';

const [sort, setSort] = useState<{ column: string; direction: 'ascending' | 'descending' }>();
const [widths, setWidths] = useState([45, 25, 15, 15]);
const direction = (column: string): Table.SortDirection =>
  sort?.column === column ? sort.direction : 'none';
const sortBy = (column: string) =>
  setSort((current) => ({
    column,
    direction:
      current?.column === column && current.direction === 'ascending' ? 'descending' : 'ascending',
  }));

<Table.Root
  aria-label="Reports"
  resizableColumns
  columnWidths={widths}
  onColumnWidthsChange={setWidths}
>
  <Table.Head>
    <Table.Row>
      <Table.HeaderCell sortDirection={direction('title')} onSort={() => sortBy('title')}>
        Report
      </Table.HeaderCell>
      <Table.HeaderCell>Owner</Table.HeaderCell>
      <Table.HeaderCell
        numeric
        sortDirection={direction('reviews')}
        onSort={() => sortBy('reviews')}
      >
        Reviews
      </Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    {sortedReports.map((report) => (
      <Table.Row key={report.id} selected={selection.has(report.id)}>
        <Table.Cell>
          <Checkbox
            label={report.title}
            checked={selection.has(report.id)}
            onCheckedChange={(checked) => select(report.id, checked)}
          />
        </Table.Cell>
        <Table.Cell nowrap>{report.owner}</Table.Cell>
        <Table.Cell numeric>{report.reviews}</Table.Cell>
        <Table.Cell>{report.status}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table.Root>;
```

### Stacked rows in narrow containers

```tsx
import { ActionGroup, IconButton, Select } from '@envsemble/envui';
import { ArrowDownward } from '@envsemble/envui/icons/ArrowDownward';
import { ArrowUpward } from '@envsemble/envui/icons/ArrowUpward';

const [stacked, setStacked] = useState(false);
const descending = sort?.direction === 'descending';

<>
  {stacked && (
    <ActionGroup>
      <Select
        label="Sort by"
        value={sort?.column ?? null}
        onValueChange={(column) =>
          column && setSort({ column, direction: sort?.direction ?? 'ascending' })
        }
        options={[
          { value: 'title', label: 'Report' },
          { value: 'reviews', label: 'Reviews' },
        ]}
      />
      <IconButton
        icon={descending ? <ArrowDownward /> : <ArrowUpward />}
        aria-label={descending ? 'Sort ascending' : 'Sort descending'}
        disabled={!sort}
        onClick={() =>
          sort && setSort({ ...sort, direction: descending ? 'ascending' : 'descending' })
        }
      />
    </ActionGroup>
  )}
  <Table.Root aria-label="Reports" narrowLayout="stack" onStackedChange={setStacked}>
    <Table.Head>
      <Table.Row>
        <Table.HeaderCell>Report</Table.HeaderCell>
        <Table.HeaderCell>Owner</Table.HeaderCell>
        <Table.HeaderCell numeric>Reviews</Table.HeaderCell>
      </Table.Row>
    </Table.Head>
    <Table.Body>
      {reports.map((report) => (
        <Table.Row key={report.id}>
          <Table.Cell>{report.title}</Table.Cell>
          <Table.Cell label="Owner">{report.owner}</Table.Cell>
          <Table.Cell label="Reviews" numeric>
            {report.reviews}
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
</>;
```

## Guidelines

- Use a table for data people compare across rows and columns. Use a List or cards for a short list of items with actions.
- The table sits on a rounded surface with subtle dividers between rows. It is a focusable region that scrolls sideways when the columns do not fit, so keyboard users can scroll it too.
- Put a muted second line under a cell's main text with `<Text variant="caption">`, for example a folder under a title.
- Keep actions in the cells as links or buttons; interactive only adds the hover highlight. Badges show states, and numeric columns compare best with numeric. In a compact table, buttons, icon buttons and fields in the cells take the 2 rem compact height, as on a compact Surface, which grows to the touch height on coarse pointers.
- stickyHeader makes the region scroll vertically as well, so give it a height through regionClassName or the surrounding layout.
- A sortable header is a button across the whole cell: its label, then an arrow for the current order, or a neutral double arrow while the column is not sorted. In numeric columns the arrow comes first, so the label lines up with the numbers. The header announces its order through aria-sort, and the button's name says what pressing it does, such as "Report sort ascending". A header named with aria-label or aria-labelledby, such as one that shows only an icon, lends that name to its sort button and resize handle. The application sorts the rows and decides the next order.
- Resizable columns move the boundary between a column and the next one, so the table keeps its width. Drag the handle at the end of a header cell, or focus it and press <kbd>←</kbd> or <kbd>→</kbd> to move it by 1 percent, with <kbd>Shift</kbd> by 5 percent; <kbd>Home</kbd> and <kbd>End</kbd> go to the column's smallest and largest width. Double-click a handle to restore the starting widths. Columns with set widths wrap long words and cut nowrap cells short with an ellipsis.
- Selected rows take the navigation selection color with a bar at their start and report aria-selected. Pass selected={false} to the other rows of a table whose rows can be selected, so every row exposes its state. Screen readers announce row selection unevenly in tables, so pair selected with a control people use to select, such as a Checkbox in the first cell, whose state they always hear.
- narrowLayout="stack" follows the width of the table's region, not the window. Below stackBelow, 36 rem by default, each body row becomes a block: the first cell is its title, and the other cells show their label beside their value. The labels share a column as wide as the longest one, up to 10 rem, so the values line up and long values, such as an address, wrap within the row. Give a table with many columns a wider stackBelow, such as 60rem for seven sortable columns, so it stacks instead of scrolling sideways. The header row is then visually hidden but still read by assistive technology, and appears while a sort button in it has keyboard focus. Where sorting matters on small screens, offer another sort control while the rows stack, such as a Select for the column and a button that reverses the order, as above: onStackedChange tells the application when they stack and when the columns return, and the region has data-stacked meanwhile, so the application need not repeat the width in its own CSS. Resize handles are hidden while rows are stacked.
- The table measures its region after it is in the document, before the browser paints a client render. Server-rendered markup shows the columns until the page hydrates, and a narrow table then stacks. A hidden table, such as one in a hidden tab panel, has nothing to measure and keeps its layout until it shows again.
- Content positioned inside cells, such as visually hidden text, stays inside the table's region and scrolls with it, so it never widens the page.

TypeScript declarations provide the complete public API.

## Related topics

- [Lists](../components/list.md)
- [Badges & counters](../components/badges.md)
- [Typography](../foundations/typography.md)
