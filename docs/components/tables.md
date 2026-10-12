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

| Name                        | Contract                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Table aria-label / caption  | Name the table: a visible caption, or aria-label without one; the scroll region shares the name     |
| Table density               | standard (default) or compact rows                                                                  |
| Table stickyHeader          | The header row stays visible while the table scrolls inside its region; give it a height            |
| Table regionClassName       | Class of the scroll region, for example to limit its height                                         |
| TableHead / TableBody       | Native thead and tbody                                                                              |
| TableRow interactive        | Hover and focus-within highlight for rows that open something through a link or button inside       |
| TableHeaderCell / TableCell | align start (default) or end; numeric aligns to the end with tabular figures; nowrap keeps one line |
| TableHeaderCell scope       | col by default; use row for a header cell at the start of a body row                                |
| Native props                | Every part accepts the native element's props, className and ref                                    |

## Guidelines

- Use a table for data people compare across rows and columns. Use grouped rows or cards for a short list of items with actions.
- The table sits on a rounded surface with subtle dividers between rows. It is a focusable region that scrolls sideways when the columns do not fit, so keyboard users can scroll it too.
- Put a muted second line under a cell's main text with `<Text variant="caption">`, for example a folder under a title.
- Keep actions in the cells as links or buttons; interactive only adds the hover highlight. Badges show states, and numeric columns compare best with numeric.
- stickyHeader makes the region scroll vertically as well, so give it a height through regionClassName or the surrounding layout.

TypeScript declarations provide the complete public API.

## Related topics

- [Grouped rows](../components/rows.md)
- [Badges & counters](../components/badges.md)
- [Typography](../foundations/typography.md)
