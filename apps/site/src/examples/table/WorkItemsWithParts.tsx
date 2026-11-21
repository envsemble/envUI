import { useState } from 'react';
import { IconButton, Link, Row, Table, Text } from '@envsemble/envui';
import { IconChevronRight } from '@envsemble/envui/icons/ChevronRight';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';

const items = [
  {
    id: 'NW-142',
    title: 'Redesign the pricing page',
    owner: 'Alex Morgan',
    parts: [
      { name: 'Plans table', steps: 6, agents: 2, changed: 'Mar 12' },
      { name: 'Checkout copy', steps: 3, agents: 1, changed: 'Mar 10' },
    ],
  },
  {
    id: 'NW-139',
    title: 'Send the welcome series',
    owner: 'Sam Lee',
    parts: [{ name: 'First email', steps: 4, agents: 1, changed: 'Mar 9' }],
  },
];

export default function WorkItemsWithParts() {
  const [open, setOpen] = useState<string[]>(['NW-142']);
  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id) ? current.filter((each) => each !== id) : [...current, id],
    );
  return (
    <Table.Root aria-label="Work items with parts">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Item</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell numeric>Parts</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      {items.map((item) => {
        const expanded = open.includes(item.id);
        const partsId = `${item.id}-parts`;
        return (
          <Table.Body key={item.id}>
            <Table.Row interactive>
              <Table.Cell nowrap>
                <Row gap={2} align="center">
                  <IconButton
                    variant="text"
                    size="sm"
                    icon={expanded ? <IconExpandMore /> : <IconChevronRight />}
                    aria-label={`Parts of ${item.title}`}
                    aria-expanded={expanded}
                    aria-controls={partsId}
                    onClick={() => toggle(item.id)}
                  />
                  <Link href={`/work/${item.id}`} underline={false} data-row-target>
                    {item.title}
                  </Link>
                  <Text variant="caption" render={<span />}>
                    {item.id}
                  </Text>
                </Row>
              </Table.Cell>
              <Table.Cell nowrap>{item.owner}</Table.Cell>
              <Table.Cell numeric>{item.parts.length}</Table.Cell>
            </Table.Row>
            {expanded && (
              <Table.Row>
                <Table.Cell colSpan={3} id={partsId}>
                  <Table.Root aria-label={`Parts of ${item.title}`} density="sm">
                    <Table.Head>
                      <Table.Row>
                        <Table.HeaderCell>Part</Table.HeaderCell>
                        <Table.HeaderCell numeric>Steps</Table.HeaderCell>
                        <Table.HeaderCell numeric>Agents</Table.HeaderCell>
                        <Table.HeaderCell numeric>Changed</Table.HeaderCell>
                      </Table.Row>
                    </Table.Head>
                    <Table.Body>
                      {item.parts.map((part) => (
                        <Table.Row key={part.name}>
                          <Table.Cell>{part.name}</Table.Cell>
                          <Table.Cell numeric>{part.steps}</Table.Cell>
                          <Table.Cell numeric>{part.agents}</Table.Cell>
                          <Table.Cell numeric>{part.changed}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        );
      })}
    </Table.Root>
  );
}
