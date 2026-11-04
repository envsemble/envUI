import type { CSSProperties, ReactNode } from 'react';
import {
  AvatarGroup,
  Badge,
  Card,
  Checkbox,
  Column,
  List,
  Meter,
  Progress,
  Row,
  Surface,
  Switch,
  Text,
} from '@envsemble/envui';

/** The people on the project card, by their initials. */
const team = [{ name: 'Alex Morgan' }, { name: 'Priya Shah' }, { name: 'Sam Lee' }];

/** A card's name at its top, with a short note under it. */
function CardHeader({ title, note, end }: { title: string; note: string; end?: ReactNode }) {
  const heading = (
    <Column gap={1}>
      <Text variant="body-sm" emphasis="default" render={<span />} className="catalogue-fan-title">
        {title}
      </Text>
      <CardNote>{note}</CardNote>
    </Column>
  );
  // Something at the header's end, such as a status, beside the title.
  return end ? (
    <Row gap={2} align="start" justify="between">
      {heading}
      {end}
    </Row>
  ) : (
    heading
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
 * with envUI. `place` is the card's place in the fan, from the middle; on a narrower page the first
 * goes and the rest take `narrowPlace`, and on a narrow one only those with a `compactPlace` stay.
 */
const cards: {
  id: string;
  place: number;
  narrowPlace?: number;
  compactPlace?: number;
  /** A slight turn and lift of its own, in degrees and rem: the fan stays an arch, laid by hand. */
  tilt: number;
  lift: number;
  content: ReactNode;
}[] = [
  {
    id: 'checklist',
    place: -1.5,
    tilt: 0.1,
    lift: 0.25,
    content: (
      <>
        <CardHeader title="Mobile release" note="2 of 3 done" />
        <Column gap={3} className="catalogue-fan-body">
          <Checkbox label="Release notes" defaultChecked />
          <Checkbox label="Screenshots" defaultChecked />
          <Checkbox label="Store listing" />
        </Column>
      </>
    ),
  },
  {
    id: 'notifications',
    place: -0.5,
    narrowPlace: -1,
    tilt: -0.1,
    lift: -0.15,
    content: (
      <>
        <CardHeader title="Notifications" note="Sent by email" />
        <List.Root aria-label="Notifications" className="catalogue-fan-body">
          <List.Item label="Mentions" end={<Switch aria-label="Mentions" defaultChecked />} />
          <List.Item label="Comments" end={<Switch aria-label="Comments" defaultChecked />} />
        </List.Root>
      </>
    ),
  },
  {
    id: 'storage',
    place: 0.5,
    narrowPlace: 0,
    compactPlace: -0.5,
    tilt: 0.1,
    lift: 0.1,
    content: (
      <>
        <CardHeader title="Storage" note="Northwind team" />
        <Surface
          background="muted"
          padding={4}
          radius="sm"
          className="catalogue-fan-body"
          render={<Column gap={3} />}
        >
          <span className="catalogue-fan-figure">7.2 GB</span>
          <Meter label="72% of 10 GB" value={7.2} max={10} />
        </Surface>
      </>
    ),
  },
  {
    id: 'project',
    place: 1.5,
    narrowPlace: 1,
    compactPlace: 0.5,
    tilt: -0.1,
    lift: 0.2,
    content: (
      <>
        <CardHeader
          title="Website refresh"
          note="Due 12 March"
          end={<Badge tone="primary">In review</Badge>}
        />
        <Column gap={4} className="catalogue-fan-body">
          <Progress label="Tasks" value={18} max={24} valueText="18 of 24" />
          <AvatarGroup people={team} size="md" total={6} max={3} />
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
                '--catalogue-fan-tilt': `${card.tilt}deg`,
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
