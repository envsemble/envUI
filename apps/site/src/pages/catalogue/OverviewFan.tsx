import type { ReactNode } from 'react';
import {
  AvatarGroup,
  Badge,
  Button,
  Calendar,
  Card,
  Column,
  Composer,
  Message,
  MessageList,
  Meter,
  Row,
  Text,
} from '@envsemble/envui';

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

function CardNote({ children }: { children: ReactNode }) {
  return (
    <Text variant="caption" render={<span />}>
      {children}
    </Text>
  );
}

const reviewers = [
  { id: 'priya', name: 'Priya Shah' },
  { id: 'sam', name: 'Sam Lee' },
  { id: 'alex', name: 'Alex Morgan' },
];

function DeploysCard() {
  return (
    <>
      <CardHeader title="Deploys" note="This month" />
      <Column gap={4} className="catalogue-fan-body">
        <Row align="center" gap={2}>
          <span className="catalogue-fan-figure">186</span>
          <Badge tone="success">+18%</Badge>
        </Row>
        <Meter label="Build minutes" value={1840} max={3000} valueText="1,840 of 3,000" />
        <Meter label="Preview environments" value={7} max={10} valueText="7 of 10" />
      </Column>
    </>
  );
}

const cards: {
  id: string;
  place: number;
  narrowPlace?: number;
  compactPlace?: number;
  liftRem: number;
  content: ReactNode;
}[] = [
  {
    id: 'review',
    place: -1.5,
    liftRem: 0.25,
    content: (
      <>
        <CardHeader title="Fix the flaky checkout test" note="#482 · opened by the agent" />
        <Column gap={4} className="catalogue-fan-body">
          <AvatarGroup people={reviewers} size="sm" />
          <Row wrap gap={2}>
            <Badge tone="success">12 checks passed</Badge>
            <Badge tone="primary">2 approvals</Badge>
          </Row>
          <Row gap={2}>
            <Button variant="primary">Merge</Button>
            <Button variant="outline">Review</Button>
          </Row>
        </Column>
      </>
    ),
  },
  {
    id: 'assistant',
    place: -0.5,
    narrowPlace: -1,
    compactPlace: -0.5,
    liftRem: -0.15,
    content: (
      <>
        <MessageList aria-label="Conversation with the assistant">
          <Message from="self">Why did checkout fail?</Message>
          <Message from="other" author="Assistant">
            A race in the cart test. I wrote a fix and opened #482.
          </Message>
        </MessageList>
        <Composer
          aria-label="Message the assistant"
          placeholder="Ask anything"
          className="catalogue-fan-body"
        />
      </>
    ),
  },
  {
    id: 'deploys',
    place: 0.5,
    narrowPlace: 0,
    compactPlace: 0.5,
    liftRem: 0.1,
    content: <DeploysCard />,
  },
  {
    id: 'launch',
    place: 1.5,
    narrowPlace: 1,
    liftRem: 0.2,
    content: <Calendar defaultValue="2027-01-20" className="catalogue-fan-calendar" />,
  },
];

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
            style={{
              '--catalogue-fan-place': card.place,
              '--catalogue-fan-narrow-place': card.narrowPlace ?? 0,
              '--catalogue-fan-compact-place': card.compactPlace ?? 0,
              '--catalogue-fan-lift': `${card.liftRem}rem`,
            }}
          >
            {card.content}
          </Card>
        ))}
      </div>
    </div>
  );
}
