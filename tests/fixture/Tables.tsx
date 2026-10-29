import { useState } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  EnvUIProvider,
  IconButton,
  Link,
  Table,
  Text,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconEvent } from '@envsemble/envui/icons/Event';
import { IconPriorityHigh } from '@envsemble/envui/icons/PriorityHigh';

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

export function TablesFixture({ theme }: { theme: ColorScheme }) {
  const [sort, setSort] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>();
  const [selected, setSelected] = useState(['tokens']);
  const [widths, setWidths] = useState([40, 30, 15, 15]);
  const [stackChanges, setStackChanges] = useState<string[]>([]);
  const [measured, setMeasured] = useState({
    shown: true,
    listening: true,
    layout: 'stack' as 'stack' | 'scroll',
  });
  const [prioritySort, setPrioritySort] = useState<Table.SortDirection>('none');
  const rows = sort
    ? [...reports].sort((first, second) =>
        sort.direction === 'ascending'
          ? compare(sort.key)(first, second)
          : compare(sort.key)(second, first),
      )
    : reports;
  const direction = (key: SortKey): Table.SortDirection =>
    sort?.key === key ? sort.direction : 'none';
  const sortBy = (key: SortKey) =>
    setSort((current) => ({
      key,
      direction:
        current?.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  return (
    <Theme theme={theme} data-testid={`tables-${theme}`} className="fixture-section">
      <Table.Root
        aria-label={`Reports ${theme}`}
        resizableColumns
        columnWidths={widths}
        onColumnWidthsChange={setWidths}
        minColumnWidths={10}
      >
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell
              sortDirection={direction('title')}
              onSortChange={() => sortBy('title')}
            >
              Report
            </Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
            <Table.HeaderCell
              numeric
              sortDirection={direction('reviews')}
              onSortChange={() => sortBy('reviews')}
            >
              Reviews
            </Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((report) => (
            <Table.Row key={report.id} interactive selected={selected.includes(report.id)}>
              <Table.Cell>
                <Checkbox
                  label={report.title}
                  checked={selected.includes(report.id)}
                  onCheckedChange={(checked) =>
                    setSelected((current) =>
                      checked ? [...current, report.id] : current.filter((id) => id !== report.id),
                    )
                  }
                />
              </Table.Cell>
              <Table.Cell nowrap>{report.owner}</Table.Cell>
              <Table.Cell numeric>{report.reviews}</Table.Cell>
              <Table.Cell>
                <Badge tone={tones[report.status as keyof typeof tones]}>{report.status}</Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Table.Root aria-label={`Selected links ${theme}`}>
        <Table.Body>
          <Table.Row selected>
            <Table.Cell>Row text</Table.Cell>
            <Table.Cell>
              <Link href="#plain-link" underline={false}>
                Plain link
              </Link>
            </Table.Cell>
            <Table.Cell>
              <Button variant="text" href="#text-button-link">
                Text button link
              </Button>
            </Table.Cell>
            <Table.Cell>
              <Button variant="secondary" href="#button-link">
                Button link
              </Button>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Row text</Table.Cell>
            <Table.Cell>
              <Link href="#plain-link" underline={false}>
                Plain link
              </Link>
            </Table.Cell>
            <Table.Cell>
              <Button variant="text" href="#text-button-link">
                Text button link
              </Button>
            </Table.Cell>
            <Table.Cell>
              <Button variant="secondary" href="#button-link">
                Button link
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <output data-testid={`widths-${theme}`}>
        {widths.map((width) => width.toFixed(1)).join(' ')}
      </output>
      <output data-testid={`order-${theme}`}>{rows.map((report) => report.id).join(' ')}</output>

      <Table.Root
        aria-label={`Owned widths ${theme}`}
        density="sm"
        resizableColumns
        defaultColumnWidths={[30, 35, 35]}
      >
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell resizeLabel="Resize the owner column">Owner</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell nowrap>
              A very long report name that is cut short in a narrow column
            </Table.Cell>
            <Table.Cell>Aurora</Table.Cell>
            <Table.Cell>
              <Button variant="text">Open</Button>
              <IconButton
                variant="text"
                icon={<IconMoreVert />}
                aria-label={`More for the report ${theme}`}
              />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>

      <div className="fixture-stack-frame" data-testid={`stack-frame-${theme}`}>
        <Table.Root caption={`Stacked ${theme}`} narrowLayout="stack">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell
                sortDirection={direction('title')}
                onSortChange={() => sortBy('title')}
              >
                Report
              </Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
              <Table.HeaderCell numeric>Reviews</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {rows.map((report) => (
              <Table.Row key={report.id} interactive selected={report.id === 'tokens'}>
                <Table.Cell>
                  {report.title}
                  <Text variant="caption">Updated today</Text>
                </Table.Cell>
                <Table.Cell label="Owner">{report.owner}</Table.Cell>
                <Table.Cell label="Reviews" numeric>
                  {report.reviews}
                </Table.Cell>
                <Table.Cell label="Status">
                  <Badge tone={tones[report.status as keyof typeof tones]}>{report.status}</Badge>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
      <div className="fixture-narrow-stack-frame" data-testid={`narrow-stack-frame-${theme}`}>
        <Table.Root aria-label={`Pages ${theme}`} narrowLayout="stack">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Page</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Address</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Quarterly report</Table.Cell>
              <Table.Cell label="Status">
                <Badge tone="warning">Draft</Badge> Unpublished changes since the last review
              </Table.Cell>
              <Table.Cell label="Address">
                https://example.com/reports/2026/quarterly-report-with-a-very-long-address
              </Table.Cell>
              <Table.Cell label="Owner">Aurora</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </div>
      <div className="fixture-measured-stack-frame" data-testid={`measured-stack-frame-${theme}`}>
        {measured.shown && (
          <Table.Root
            aria-label={`Measured threshold ${theme}`}
            narrowLayout={measured.layout}
            stackBelow="calc(20rem + 160px)"
            onStackedChange={
              measured.listening
                ? (stacked) => setStackChanges((list) => [...list, stacked ? 'stacked' : 'columns'])
                : undefined
            }
          >
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Report</Table.HeaderCell>
                <Table.HeaderCell>Owner</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Quarterly report</Table.Cell>
                <Table.Cell label="Owner">Aurora</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        )}
      </div>
      <output data-testid={`stack-changes-${theme}`}>{stackChanges.join(' ')}</output>
      <div className="fixture-actions">
        <button
          type="button"
          onClick={() => setMeasured((current) => ({ ...current, shown: !current.shown }))}
        >
          Toggle measured table {theme}
        </button>
        <button
          type="button"
          onClick={() => setMeasured((current) => ({ ...current, listening: !current.listening }))}
        >
          Toggle stacking listener {theme}
        </button>
        <button
          type="button"
          onClick={() =>
            setMeasured((current) => ({
              ...current,
              layout: current.layout === 'stack' ? 'scroll' : 'stack',
            }))
          }
        >
          Toggle measured layout {theme}
        </button>
      </div>
      <div className="fixture-measured-stack-frame" data-testid={`bare-stack-frame-${theme}`}>
        <Table.Root aria-label={`Bare threshold ${theme}`} narrowLayout="stack" stackBelow="37.5">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Report</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Quarterly report</Table.Cell>
              <Table.Cell label="Owner">Aurora</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
        {/* A number of pixels works as well. */}
        <Table.Root aria-label={`Number threshold ${theme}`} narrowLayout="stack" stackBelow={37.5}>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Report</Table.HeaderCell>
              <Table.HeaderCell>Owner</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Quarterly report</Table.Cell>
              <Table.Cell label="Owner">Aurora</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </div>
      <span id={`due-date-${theme}`} hidden>
        Due date
      </span>
      <Table.Root
        aria-label={`Icon headers ${theme}`}
        resizableColumns
        defaultColumnWidths={[20, 20, 60]}
      >
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell
              aria-label="Priority"
              sortDirection={prioritySort}
              onSortChange={() =>
                setPrioritySort((current) => (current === 'ascending' ? 'descending' : 'ascending'))
              }
            >
              <IconPriorityHigh />
            </Table.HeaderCell>
            <Table.HeaderCell aria-labelledby={`due-date-${theme}`} onSortChange={() => undefined}>
              <IconEvent />
            </Table.HeaderCell>
            <Table.HeaderCell>Report</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>High</Table.Cell>
            <Table.Cell>Friday</Table.Cell>
            <Table.Cell>Quarterly report</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <div className="fixture-wide-stack-frame" data-testid={`wide-stack-frame-${theme}`}>
        <Table.Root aria-label={`Seven columns ${theme}`} narrowLayout="stack" stackBelow="60rem">
          <Table.Head>
            <Table.Row>
              {['Report', 'Owner', 'Team', 'Reviews', 'Updated', 'Status'].map((column) => (
                <Table.HeaderCell key={column} onSortChange={() => undefined}>
                  {column}
                </Table.HeaderCell>
              ))}
              <Table.HeaderCell>
                <span className="fixture-visually-hidden">Actions</span>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {reports.map((report) => (
              <Table.Row key={report.id}>
                <Table.Cell>{report.title}</Table.Cell>
                <Table.Cell label="Owner">{report.owner}</Table.Cell>
                <Table.Cell label="Team">Infrastructure</Table.Cell>
                <Table.Cell label="Reviews" numeric>
                  {report.reviews}
                </Table.Cell>
                <Table.Cell label="Updated">Today</Table.Cell>
                <Table.Cell label="Status">{report.status}</Table.Cell>
                <Table.Cell label="Actions">
                  <button type="button">Open</button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </div>
      {/* A table named by a heading, whose strings come from EnvUIProvider. */}
      <h3 id={'labelled-table-' + theme}>Quarterly figures {theme}</h3>
      <EnvUIProvider messages={{ table: { sortAscending: 'aufsteigend sortieren' } }}>
        <Table.Root aria-labelledby={'labelled-table-' + theme}>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell onSortChange={() => undefined}>Quarter</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Q1</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </EnvUIProvider>
      <Table.Root aria-label={`Hidden header text ${theme}`}>
        <Table.Head>
          <Table.Row>
            {['Report', 'Owner', 'Team', 'Reviews', 'Updated', 'Status', 'Notes'].map((column) => (
              <Table.HeaderCell key={column} nowrap>
                {column} with a long heading
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell>
              <span className="fixture-visually-hidden">Actions</span>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            {Array.from({ length: 7 }, (_, index) => (
              <Table.Cell key={index} nowrap>
                Value {index + 1}
              </Table.Cell>
            ))}
            <Table.Cell>
              <Button variant="text">Edit</Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Theme>
  );
}
