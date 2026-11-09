import type { ReactNode } from 'react';
import {
  AvatarGroup,
  Badge,
  Button,
  Calendar,
  CalendarHeatmap,
  Card,
  Column,
  Composer,
  DiffStat,
  Message,
  MessageList,
  Row,
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
 * The deploys card for a pointer: the count and a heatmap of the latest weeks, as many as fit the
 * card whole: ten, under the count drawn large, or on a touch screen, whose days take a touch
 * target's size, five, with the count in the note, so the card stays as tall as the one beside it.
 */
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
        <CalendarHeatmap
          aria-label={`Deploys in the last ${weeks} weeks`}
          data={deploys.slice(-weeks * 7)}
          tone="success"
        />
      </Column>
    </div>
  );
}

/**
 * The deploys card, for the pointer the reader has: both render, and the style sheet shows the
 * one for a touch screen or for a mouse (OverviewFan.css), so a pre-rendered page shows the
 * reader's from the first paint, as the server can't tell.
 */
function DeploysCard() {
  return (
    <>
      <Deploys touch={false} />
      <Deploys touch />
    </>
  );
}

/**
 * The cards in the hand, from the back to the front, each a small moment of a B2B or AI product
 * built with envUI, and each of different components: an agent's pull request in review, a
 * conversation with an assistant, ten weeks of deploys, and a calendar to pick a launch day. `place` is the
 * card's place in the fan, from the middle; on a narrower page the first goes and the rest take
 * `narrowPlace`, and on a narrow one only those with a `compactPlace` stay: the conversation and
 * the deploys, drawn smaller on a phone.
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
      <>
        <MessageList aria-label="Conversation with the assistant">
          <Message from="self">Why did checkout fail?</Message>
          <Message from="other" author="Assistant">
            A race in the cart test. I wrote a fix and opened #482.
          </Message>
        </MessageList>
        {/* On the card's foot, where a conversation's composer waits. */}
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
    lift: 0.1,
    content: <DeploysCard />,
  },
  {
    id: 'launch',
    place: 1.5,
    narrowPlace: 1,
    lift: 0.2,
    content: (
      // The month's own heading names the card; January 2027 fills all six of its weeks, so no row is
      // left empty at its foot.
      <Calendar defaultValue="2027-01-20" className="catalogue-fan-calendar" />
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
            style={{
              '--catalogue-fan-place': card.place,
              '--catalogue-fan-narrow-place': card.narrowPlace ?? 0,
              '--catalogue-fan-compact-place': card.compactPlace ?? 0,
              '--catalogue-fan-lift': `${card.lift}rem`,
            }}
          >
            {card.content}
          </Card>
        ))}
      </div>
    </div>
  );
}
