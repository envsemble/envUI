import { Avatar, Column, Link, Row, Table, Text } from '@envsemble/envui';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconBlock } from '@envsemble/envui/icons/Block';
import { IconProgressActivity } from '@envsemble/envui/icons/ProgressActivity';

const items = [
  {
    id: 'NW-142',
    title: 'Redesign the pricing page',
    project: 'Website refresh',
    status: 'active',
    owner: 'Alex Morgan',
    done: 60,
    updated: '2026-03-12',
  },
  {
    id: 'NW-139',
    title: 'Send the welcome series',
    project: 'Onboarding emails',
    status: 'blocked',
    owner: 'Sam Lee',
    done: 25,
    updated: '2026-03-09',
  },
  {
    id: 'NW-131',
    title: 'Move invoices to the new ledger',
    project: 'Billing migration',
    status: 'done',
    owner: 'Priya Shah',
    done: 100,
    updated: '2026-02-27',
  },
] as const;

const statuses = {
  active: <IconProgressActivity tone="primary" label="In progress" />,
  blocked: <IconBlock tone="warning" label="Blocked" />,
  done: <IconCheckCircle tone="success" label="Done" />,
};

const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

export default function WorkItems() {
  return (
    <Table.Root caption="Work" narrowLayout="stack">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Item</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell>Progress</Table.HeaderCell>
          <Table.HeaderCell numeric>Updated</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {items.map((item) => (
          <Table.Row key={item.id} interactive>
            <Table.Cell>
              <Row gap={3} align="start">
                {statuses[item.status]}
                <Column gap={1}>
                  <Link href={`/work/${item.id}`} underline={false} data-row-target>
                    {item.title}
                  </Link>
                  <Text variant="caption">
                    {item.id} · {item.project}
                  </Text>
                </Column>
              </Row>
            </Table.Cell>
            <Table.Cell nowrap label="Owner">
              <Row gap={2} align="center">
                <Avatar name={item.owner} size="sm" />
                {item.owner}
              </Row>
            </Table.Cell>
            <Table.Cell label="Progress">
              <Row gap={2} align="center">
                <div
                  style={{
                    inlineSize: '5rem',
                    blockSize: '0.375rem',
                    borderRadius: 'var(--env-radius-full)',
                    background: 'var(--env-color-bg-neutral-muted)',
                  }}
                >
                  <div
                    style={{
                      inlineSize: `${item.done}%`,
                      blockSize: '100%',
                      borderRadius: 'inherit',
                      background: 'var(--env-color-bg-primary-solid)',
                    }}
                  />
                </div>
                <Text variant="caption" tabularNumbers>
                  {item.done}%
                </Text>
              </Row>
            </Table.Cell>
            <Table.Cell numeric label="Updated">
              <time dateTime={item.updated}>{day.format(new Date(item.updated))}</time>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
