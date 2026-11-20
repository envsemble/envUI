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

const dayMs = 86_400_000;
const deployDays = 70;
const weekendShare = 0.25;

function deploysPerDay(): number[] {
  const end = Date.UTC(2026, 9, 31);
  return Array.from({ length: deployDays }, (_, index) => {
    const time = end - (deployDays - 1 - index) * dayMs;
    const weekday = new Date(time).getUTCDay();
    const wave = Math.sin(index / 5) + Math.sin((index * 5) / 13) + 1.1;
    const weekend = weekday === 0 || weekday === 6;
    return Math.max(0, Math.round(wave * 2.2 * (weekend ? weekendShare : 1)));
  });
}
const deploys = deploysPerDay();

const deployLevels = 5;

function deployLevel(count: number, top: number) {
  if (count <= 0 || top <= 0) return 0;
  return Math.min(deployLevels - 1, Math.max(1, Math.ceil((count / top) * (deployLevels - 1))));
}

function DeployGrid({ days }: { days: number[] }) {
  const top = Math.max(...days);
  return (
    <Column gap={2}>
      <div className="catalogue-fan-heatmap">
        {days.map((count, index) => (
          <span key={index} data-level={deployLevel(count, top)} />
        ))}
      </div>
      <Row align="center" gap={1} className="catalogue-fan-heatmap-legend">
        <CardNote>Less</CardNote>
        {Array.from({ length: deployLevels }, (_, level) => (
          <span key={level} data-level={level} />
        ))}
        <CardNote>More</CardNote>
      </Row>
    </Column>
  );
}

function Deploys({ touch }: { touch: boolean }) {
  const weeks = touch ? 5 : 10;
  const count = touch ? 94 : 186;
  return (
    <div className="catalogue-fan-deploys" data-pointer={touch ? 'coarse' : 'fine'}>
      <CardHeader title="Deploys" note={touch ? `${count} in the last 5 weeks` : 'Last 10 weeks'} />
      <Column gap={3} className="catalogue-fan-body">
        {touch ? null : (
          <Row align="center" gap={2}>
            <span className="catalogue-fan-figure">{count}</span>
            <Badge tone="success">+18%</Badge>
          </Row>
        )}
        <DeployGrid days={deploys.slice(-weeks * 7)} />
      </Column>
    </div>
  );
}

function DeploysCard() {
  return (
    <>
      <Deploys touch={false} />
      <Deploys touch />
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
          <Row align="center" justify="between" gap={2}>
            <Badge style={{ fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ color: 'var(--env-color-fg-success)' }}>+128</span>{' '}
              <span style={{ color: 'var(--env-color-fg-danger)' }}>−34</span>
            </Badge>
            <AvatarGroup people={reviewers} size="sm" />
          </Row>
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
