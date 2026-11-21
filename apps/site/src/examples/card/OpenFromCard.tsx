import { useState } from 'react';
import { Badge, Card, Column, Grid, IconButton, Link, Menu, Text } from '@envsemble/envui';
import { IconMoreHoriz } from '@envsemble/envui/icons/MoreHoriz';

const projects = [
  {
    id: 'northwind',
    name: 'Northwind launch',
    summary: '12 open tasks · Due 14 November',
    state: 'On track',
  },
  {
    id: 'pricing',
    name: 'Pricing research',
    summary: '4 open tasks · No due date',
    state: 'Draft',
  },
];

export default function OpenFromCard() {
  const [result, setResult] = useState('');
  return (
    <Column gap={3} style={{ inlineSize: '100%' }}>
      <Grid columns={{ min: '16rem' }} gap={4}>
        {projects.map(({ id, name, summary, state }) => (
          <Card
            key={id}
            interactive
            render={<article />}
            title={
              <Link
                href={`/projects/${id}`}
                underline={false}
                data-row-target
                onClick={() => setResult(`Opened ${name}`)}
              >
                {name}
              </Link>
            }
            meta={<Badge>{state}</Badge>}
            headerEnd={
              <Menu.Root
                aria-label={`Actions for ${name}`}
                trigger={
                  <IconButton
                    variant="text"
                    icon={<IconMoreHoriz />}
                    aria-label={`More actions for ${name}`}
                  />
                }
              >
                <Menu.Item onClick={() => setResult(`Shared ${name}`)}>Share</Menu.Item>
                <Menu.Item onClick={() => setResult(`Archived ${name}`)}>Archive</Menu.Item>
              </Menu.Root>
            }
            description={summary}
          />
        ))}
      </Grid>
      <Text variant="caption" emphasis="muted" role="status">
        {result}
      </Text>
    </Column>
  );
}
