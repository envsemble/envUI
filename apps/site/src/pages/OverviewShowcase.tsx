import type { CSSProperties, ReactNode } from 'react';
import {
  AnimatedNumber,
  AvatarGroup,
  Badge,
  Card,
  Checkbox,
  Column,
  Meter,
  Progress,
  Row,
  Switch,
  Text,
} from '@envsemble/envui';

/** The people on the project card, by their initials. */
const team = [{ name: 'Alex Morgan' }, { name: 'Priya Shah' }, { name: 'Sam Lee' }];

/** A card's name at its top, with a short note under it. */
function CardHeader({ title, note }: { title: string; note: string }) {
  return (
    <Column gap={1}>
      <Text
        variant="body-sm"
        emphasis="default"
        render={<span />}
        className="catalogue-showcase-title"
      >
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

/**
 * The cards in the hand, from the back to the front, each a small moment of an application built
 * with envUI. `place` is the card's place in the fan, from the middle; on a narrow page the back two
 * go and the rest take `narrowPlace`.
 */
const cards: {
  id: string;
  place: number;
  narrowPlace?: number;
  /** A slight turn and lift of its own, in degrees and rem: the fan stays an arch, laid by hand. */
  tilt: number;
  lift: number;
  content: ReactNode;
}[] = [
  {
    id: 'checklist',
    place: -2,
    tilt: 0.6,
    lift: 0.25,
    content: (
      <>
        <CardHeader title="Mobile release" note="2 of 3 done" />
        <Column gap={3} className="catalogue-showcase-body">
          <Checkbox label="Release notes" defaultChecked />
          <Checkbox label="Screenshots" defaultChecked />
          <Checkbox label="Store listing" />
        </Column>
      </>
    ),
  },
  {
    id: 'notifications',
    place: -1,
    tilt: -0.4,
    lift: -0.15,
    content: (
      <>
        <CardHeader title="Notifications" note="Sent by email" />
        <Column gap={3} className="catalogue-showcase-body">
          <Switch label="Mentions" defaultChecked />
          <Switch label="Comments" defaultChecked />
          <Switch label="Digest" />
        </Column>
      </>
    ),
  },
  {
    id: 'storage',
    place: 0,
    tilt: 0.3,
    lift: 0.1,
    narrowPlace: -1,
    content: (
      <>
        <CardHeader title="Storage" note="Northwind team" />
        <Column gap={3} className="catalogue-showcase-body">
          <span className="catalogue-showcase-figure">7.2 GB</span>
          <Meter label="72% of 10 GB" value={7.2} max={10} />
        </Column>
      </>
    ),
  },
  {
    id: 'figure',
    place: 1,
    tilt: -0.6,
    lift: -0.2,
    narrowPlace: 0,
    content: (
      <>
        <CardHeader title="Tasks completed" note="Since 1 January" />
        <Column gap={1} className="catalogue-showcase-body">
          <span className="catalogue-showcase-figure">
            <AnimatedNumber value={1280} />
          </span>
          <Text variant="caption" render={<span />} className="catalogue-showcase-trend">
            +12% from last year
          </Text>
        </Column>
      </>
    ),
  },
  {
    id: 'project',
    place: 2,
    tilt: 0.4,
    lift: 0.2,
    narrowPlace: 1,
    content: (
      <>
        <CardHeader title="Website refresh" note="Due 12 March" />
        <Column gap={4} className="catalogue-showcase-body">
          <Progress label="Tasks" value={18} max={24} valueText="18 of 24" />
          <Row gap={2} align="center" justify="between">
            <AvatarGroup people={team} size="md" />
            <Badge tone="accent">In review</Badge>
          </Row>
        </Column>
      </>
    ),
  },
];

/**
 * The Overview's showcase, under its banner: a hand of cards fanned evenly from one point below
 * them, each a few live components. It is a still picture: hidden from assistive technology, and
 * its components inert.
 */
export function OverviewShowcase() {
  return (
    <div className="catalogue-showcase" aria-hidden="true" inert>
      <div className="catalogue-showcase-stack">
        {cards.map((card) => (
          <Card
            key={card.id}
            className="catalogue-showcase-card"
            padding={5}
            data-narrow={card.narrowPlace === undefined ? 'hidden' : undefined}
            style={
              {
                '--catalogue-showcase-place': card.place,
                '--catalogue-showcase-narrow-place': card.narrowPlace ?? 0,
                '--catalogue-showcase-tilt': `${card.tilt}deg`,
                '--catalogue-showcase-lift': `${card.lift}rem`,
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
