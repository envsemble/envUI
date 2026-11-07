import type { CSSProperties, ReactNode } from 'react';
import {
  AvatarGroup,
  Badge,
  Button,
  CalendarHeatmap,
  Card,
  Column,
  Composer,
  DiffStat,
  Message,
  MessageList,
  Row,
  SegmentedControl,
  Slider,
  Switch,
  Text,
  type CalendarHeatmapDay,
} from '@envsemble/envui';

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

/** The people reviewing the agent's pull request. */
const reviewers = [
  { id: 'priya', name: 'Priya Shah' },
  { id: 'sam', name: 'Sam Lee' },
  { id: 'alex', name: 'Alex Morgan' },
];

/** Stands in for ten weeks of deploys: busier midweek, quieter at weekends. */
function deploysPerDay(): CalendarHeatmapDay[] {
  const end = Date.UTC(2026, 9, 31);
  return Array.from({ length: 70 }, (_, index) => {
    const time = end - (69 - index) * 86_400_000;
    const weekday = new Date(time).getUTCDay();
    const wave = Math.sin(index / 5) + Math.sin((index * 5) / 13) + 1.1;
    const weekend = weekday === 0 || weekday === 6;
    const count = Math.max(0, Math.round(wave * 2.2 * (weekend ? 0.25 : 1)));
    return { date: new Date(time).toISOString().slice(0, 10), value: count };
  });
}
const deploys = deploysPerDay();

/**
 * The cards in the hand, from the back to the front, each a small moment of a B2B or AI product
 * built with envUI, and each of different components: an agent's pull request in review, a
 * conversation with an assistant, ten weeks of deploys, and a workspace's settings. `place` is the
 * card's place in the fan, from the middle; on a narrower page the first goes and the rest take
 * `narrowPlace`, and on a narrow one only those with a `compactPlace` stay: the conversation and
 * the settings, the richer two, drawn smaller on a phone.
 */
const cards: {
  id: string;
  place: number;
  narrowPlace?: number;
  compactPlace?: number;
  /** A slight lift of its own, in rem, so the fan looks laid by hand rather than ruled. */
  lift: number;
  content: ReactNode;
}[] = [
  {
    id: 'review',
    place: -1.5,
    lift: 0.25,
    content: (
      <>
        <CardHeader title="Fix the flaky checkout test" note="#482 · opened by the agent" />
        <Column gap={4} className="catalogue-fan-body">
          <Row align="center" justify="between" gap={2}>
            <DiffStat additions={128} deletions={34} />
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
    lift: -0.15,
    content: (
      <Column gap={4}>
        <MessageList aria-label="Conversation with the assistant">
          <Message from="self">Why did checkout fail?</Message>
          <Message from="other" author="Assistant">
            A race in the cart test. I wrote a fix and opened #482.
          </Message>
        </MessageList>
        <Composer aria-label="Message the assistant" placeholder="Ask anything" />
      </Column>
    ),
  },
  {
    id: 'deploys',
    place: 0.5,
    narrowPlace: 0,
    lift: 0.1,
    content: (
      <>
        <CardHeader title="Deploys" note="Last 10 weeks" />
        <Column gap={3} className="catalogue-fan-body">
          <Row align="center" gap={2}>
            <span className="catalogue-fan-figure">186</span>
            <Badge tone="success">+18%</Badge>
          </Row>
          <CalendarHeatmap
            aria-label="Deploys in the last 10 weeks"
            data={deploys}
            tone="success"
          />
        </Column>
      </>
    ),
  },
  {
    id: 'settings',
    place: 1.5,
    narrowPlace: 1,
    compactPlace: 0.5,
    lift: 0.2,
    content: (
      <>
        <CardHeader title="Workspace" note="Preferences" />
        <Column gap={4} className="catalogue-fan-body">
          <SegmentedControl
            aria-label="Theme"
            size="sm"
            defaultValue="dark"
            items={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
          <Switch label="Weekly digest" defaultChecked />
          <Slider
            label="Keep logs"
            defaultValue={30}
            max={90}
            formatValue={(days) => `${days} days`}
          />
        </Column>
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
