import type { CSSProperties, ReactNode } from 'react';
import { Badge, Card, Column, List, Meter, Surface, Table, Text } from '@envsemble/envui';
import { IconCheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { IconIncompleteCircle } from '@envsemble/envui/icons/IncompleteCircle';

/** A card's name at its top, with a short note under it. */
function CardHeader({ title, note }: { title: string; note: string }) {
  return (
    <Column gap={1}>
      <Text variant="body-sm" emphasis="default" render={<span />} className="catalogue-fan-title">
        {title}
      </Text>
      <CardNote>{note}</CardNote>
    </Column>
  );
}

/** A short note under a card's title or under its figure. */
function CardNote({ children }: { children: ReactNode }) {
  return (
    <Text variant="caption" render={<span />}>
      {children}
    </Text>
  );
}

/** The deploys card's rows: a service, the state of its latest deploy, and how long ago it started. */
const deploys = [
  { service: 'api', status: 'Live', tone: 'success', age: '2m' },
  { service: 'web', status: 'Building', tone: 'primary', age: '1m' },
  { service: 'worker', status: 'Failed', tone: 'danger', age: '1h' },
] as const;

/** The agent run's steps, done and under way, each marked by its state's icon. */
const steps = [
  { label: 'Read 14 files', state: 'done' },
  { label: 'Ran 212 tests', state: 'done' },
  { label: 'Writing the fix', state: 'running' },
] as const;
const stepIcons = {
  done: <IconCheckCircle className="catalogue-fan-step" data-state="done" />,
  running: <IconIncompleteCircle className="catalogue-fan-step" data-state="running" />,
};

/** The services on the status card, and how each is doing. */
const services = [
  { name: 'API', status: 'Operational', tone: 'success' },
  { name: 'Inference', status: 'Degraded', tone: 'warning' },
  { name: 'Webhooks', status: 'Operational', tone: 'success' },
] as const;

/**
 * The cards in the hand, from the back to the front, each a small moment of a B2B or AI product
 * built with envUI. `place` is the card's place in the fan, from the middle; on a narrower page the
 * first goes and the rest take `narrowPlace`, and on a narrow one only those with a `compactPlace`
 * stay: the agent's run and the services' status, the richer two. A phone shows the one card with
 * `phone`, whole and upright.
 */
const cards: {
  id: string;
  place: number;
  narrowPlace?: number;
  compactPlace?: number;
  phone?: true;
  /** A slight lift of its own, in rem, so the fan looks laid by hand rather than ruled. */
  lift: number;
  content: ReactNode;
}[] = [
  {
    id: 'deploys',
    place: -1.5,
    lift: 0.25,
    content: (
      <>
        <CardHeader title="Deploys" note="Production" />
        <Table.Root aria-label="Deploys" density="xs" className="catalogue-fan-body">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Service</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell numeric>Age</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {deploys.map((deploy) => (
              <Table.Row key={deploy.service}>
                <Table.Cell nowrap>{deploy.service}</Table.Cell>
                <Table.Cell nowrap>
                  <Badge tone={deploy.tone}>{deploy.status}</Badge>
                </Table.Cell>
                <Table.Cell numeric>{deploy.age}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </>
    ),
  },
  {
    id: 'agent-run',
    place: -0.5,
    narrowPlace: -1,
    compactPlace: -0.5,
    phone: true,
    lift: -0.15,
    content: (
      <>
        <CardHeader title="Agent run" note="Fix the flaky checkout test" />
        <List.Root aria-label="Steps" density="sm" className="catalogue-fan-body">
          {steps.map((step) => (
            <List.Item key={step.label} start={stepIcons[step.state]} label={step.label} />
          ))}
        </List.Root>
      </>
    ),
  },
  {
    id: 'usage',
    place: 0.5,
    narrowPlace: 0,
    lift: 0.1,
    content: (
      <>
        <CardHeader title="Usage" note="This billing period" />
        <Surface
          background="muted"
          padding={4}
          radius="sm"
          className="catalogue-fan-body"
          render={<Column gap={3} />}
        >
          <span className="catalogue-fan-figure">1.24M</span>
          <Meter label="Tokens, 62% of 2M" value={1.24} max={2} />
        </Surface>
      </>
    ),
  },
  {
    id: 'status',
    place: 1.5,
    narrowPlace: 1,
    compactPlace: 0.5,
    lift: 0.2,
    content: (
      <>
        <CardHeader title="Services" note="All regions" />
        <List.Root aria-label="Services" density="sm" className="catalogue-fan-body">
          {services.map((service) => (
            <List.Item
              key={service.name}
              label={service.name}
              // Every service's state is a badge of its tone, so the rows line up.
              end={<Badge tone={service.tone}>{service.status}</Badge>}
            />
          ))}
        </List.Root>
      </>
    ),
  },
];

/**
 * The Overview's fan of cards, under its banner: a hand of cards fanned evenly from one point below
 * them, each a few live components, spread so none covers what another shows. It is a still picture: hidden from assistive technology, and
 * its components inert.
 */
export function OverviewFan() {
  return (
    <div className="catalogue-fan" aria-hidden="true" inert>
      <div className="catalogue-fan-stack">
        {cards.map((card) => (
          <Card
            key={card.id}
            className="catalogue-fan-card"
            padding={5}
            data-narrow={card.narrowPlace === undefined ? 'hidden' : undefined}
            data-compact={card.compactPlace === undefined ? 'hidden' : undefined}
            data-phone={card.phone ? undefined : 'hidden'}
            style={
              {
                '--catalogue-fan-place': card.place,
                '--catalogue-fan-narrow-place': card.narrowPlace ?? 0,
                '--catalogue-fan-compact-place': card.compactPlace ?? 0,
                '--catalogue-fan-lift': `${card.lift}rem`,
              } as CSSProperties
            }
          >
            {card.content}
          </Card>
        ))}
      </div>
    </div>
  );
}
