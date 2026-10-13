import { useState } from 'react';
import {
  Badge,
  Breadcrumbs,
  GroupedRows,
  IconButton,
  Kbd,
  Link,
  LinkProvider,
  Row,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Theme,
  type LinkComponentProps,
  type ThemeValue,
} from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { MoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

const plans = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  title: `Plan ${index + 1}`,
  owner: index % 2 ? 'Alex Morgan' : 'Sam Lee',
  decisions: (index * 7) % 23,
  status: index % 3 === 0 ? 'Blocked' : 'In progress',
}));

function RecordingLink({ href, onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
        document.body.dataset.breadcrumbNavigatedTo = href;
      }}
    />
  );
}

export function DataDisplayFixture({ theme }: { theme: ThemeValue }) {
  const [crumb, setCrumb] = useState('');
  const [rowResult, setRowResult] = useState('');
  return (
    <Theme theme={theme} data-testid={`data-${theme}`} className="fixture-section">
      <LinkProvider component={RecordingLink}>
        <Breadcrumbs
          items={[
            { label: 'Workspace', href: '/workspace' },
            { label: 'Plans', onClick: () => setCrumb('Plans') },
            { label: 'Search' },
            { label: 'Roadmap.md' },
          ]}
        />
      </LinkProvider>
      <output data-testid={`breadcrumb-result-${theme}`}>{crumb}</output>
      <p>
        Open with <Kbd keys={['Ctrl', 'P']} /> or press <Kbd>F2</Kbd>.
      </p>
      <div className="fixture-table-frame">
        <Table caption={`Plans ${theme}`} stickyHeader regionClassName="fixture-table-region">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Plan</TableHeaderCell>
              <TableHeaderCell>Owner</TableHeaderCell>
              <TableHeaderCell numeric>Decisions</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell nowrap>A long trailing column heading</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id} interactive>
                <TableCell>
                  {plan.title}
                  <Text variant="caption">Updated today</Text>
                </TableCell>
                <TableCell nowrap>{plan.owner}</TableCell>
                <TableCell numeric>{plan.decisions}</TableCell>
                <TableCell>
                  <Badge tone={plan.status === 'Blocked' ? 'warning' : 'accent'}>
                    {plan.status}
                  </Badge>
                </TableCell>
                <TableCell nowrap>Some wide content that makes the table scroll sideways</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <GroupedRows aria-label={`Rows ${theme}`}>
        <Row
          interactive
          className="fixture-open-row"
          title={
            <span className="fixture-row-title">
              <Description />
              <Link
                href="#roadmap"
                underline={false}
                data-row-target
                draggable={false}
                onClick={(event) => {
                  event.preventDefault();
                  setRowResult('open roadmap');
                }}
              >
                Roadmap
              </Link>
            </span>
          }
          detail="Updated today"
          action={
            <IconButton
              variant="text"
              icon={<MoreHoriz />}
              aria-label="More actions"
              className="fixture-row-action"
              onClick={() => setRowResult('more actions')}
            />
          }
        />
        <Row title="Archive" detail="Read only" />
      </GroupedRows>
      <output data-testid={`row-result-${theme}`}>{rowResult}</output>
      <Table aria-label={`Compact ${theme}`} density="compact">
        <TableBody>
          <TableRow>
            <TableHeaderCell scope="row">Total</TableHeaderCell>
            <TableCell numeric>1,204</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Theme>
  );
}
