import { useState } from 'react';
import {
  Badge,
  Breadcrumbs,
  IconButton,
  Kbd,
  LinkProvider,
  Surface,
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
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

/** A trail too long for its narrow frame: the current page cannot fit beside the earlier levels. */
const narrowTrail = [
  { label: 'Workspace', href: '/workspace' },
  { label: 'Plans', href: '/workspace/plans' },
  { label: 'Quarterly review of the shared design tokens' },
];

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
        <div className="fixture-breadcrumb-frame">
          <Breadcrumbs aria-label="Wrapping trail" items={narrowTrail} />
        </div>
        <div className="fixture-breadcrumb-frame">
          <Breadcrumbs aria-label="One-line trail" wrap={false} items={narrowTrail} />
        </div>
        <div className="fixture-breadcrumb-frame" dir="rtl">
          <Breadcrumbs aria-label="Right-to-left trail" wrap={false} items={narrowTrail} />
        </div>
        {/* A compact header bar as wide as a phone: the trail beside a status and an action. */}
        <Surface
          tone="row"
          padding={2}
          corners="standard"
          density="compact"
          className="fixture-breadcrumb-bar"
          data-testid={`breadcrumb-bar-${theme}`}
        >
          <Breadcrumbs
            aria-label="Header trail"
            wrap={false}
            items={[
              { label: 'Plans', href: '/workspace/plans' },
              { label: 'Quarterly review of the shared design tokens' },
            ]}
          />
          <Badge tone="success">Published</Badge>
          <IconButton icon={<MoreVert />} aria-label="More actions" />
        </Surface>
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
