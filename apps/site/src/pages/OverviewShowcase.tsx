import type { CSSProperties, ReactNode } from 'react';
import {
  AnimatedNumber,
  AvatarGroup,
  Badge,
  Column,
  Meter,
  Row,
  Slider,
  Switch,
  Text,
} from '@envsemble/envui';

const team = [
  { name: 'Sam Lee' },
  { name: 'Priya Shah' },
  { name: 'Alex Morgan' },
  { name: 'Jordan Ellis' },
  { name: 'Mina Okafor' },
  { name: 'Leo Brandt' },
];

/**
 * The cards in the pocket, from the back of the stack to the front: a few of envUI's components
 * at their most pleasing, with no purpose beyond being looked at.
 */
const cards: {
  id: string;
  /** Where it lies in the fan, from the fan's foot: rem and degrees. */
  fan: [x: number, y: number, rotate: number];
  content: ReactNode;
}[] = [
  {
    id: 'status',
    fan: [-14.5, -3, -13],
    content: (
      <Column gap={3}>
        <Text variant="body-sm" emphasis="muted" render={<span />}>
          Launch checklist
        </Text>
        <Row gap={2} wrap>
          <Badge tone="success">Ready</Badge>
          <Badge tone="accent">In review</Badge>
          <Badge tone="warning">Blocked</Badge>
          <Badge tone="done">Completed</Badge>
        </Row>
      </Column>
    ),
  },
  {
    id: 'settings',
    fan: [-7.5, -7.5, -4],
    content: (
      <Column gap={3}>
        <Slider label="Opacity" defaultValue={40} formatValue={(value) => `${value}%`} />
        <Switch label="Show the grid" defaultChecked />
      </Column>
    ),
  },
  {
    id: 'usage',
    fan: [8.5, -6.5, 7],
    content: (
      <Column gap={4}>
        <Meter label="Storage" value={7.2} max={10} valueText="7.2 of 10 GB" />
        <Meter label="Seats" value={4} max={5} valueText="4 of 5" />
      </Column>
    ),
  },
  {
    id: 'figure',
    fan: [14.5, -2, 15],
    content: (
      <Column gap={1}>
        <Text variant="body-sm" emphasis="muted" render={<span />}>
          Tasks done this year
        </Text>
        <Row gap={3} align="center">
          <Text variant="headline" render={<span />} className="catalogue-showcase-figure">
            <AnimatedNumber value={1280} />
          </Text>
          <Badge tone="success" className="catalogue-showcase-trend">
            +12%
          </Badge>
        </Row>
      </Column>
    ),
  },
  {
    id: 'team',
    fan: [0.5, -8.5, 2],
    content: (
      <Column gap={3}>
        <Text variant="body-sm" emphasis="muted" render={<span />}>
          Design review
        </Text>
        <AvatarGroup people={team} max={4} size="lg" />
      </Column>
    ),
  },
];

/**
 * The Overview's showcase, under its banner: a fan of square cards, each a few live components,
 * lying at uneven angles as if spread by hand. It is a still picture: hidden from assistive
 * technology, and its components inert.
 */
export function OverviewShowcase() {
  return (
    <div className="catalogue-showcase" aria-hidden="true" inert>
      <div className="catalogue-showcase-stack">
        {cards.map((card) => (
          <div
            key={card.id}
            className="catalogue-showcase-card"
            style={
              {
                '--catalogue-showcase-fan-x': `${card.fan[0]}rem`,
                '--catalogue-showcase-fan-y': `${card.fan[1]}rem`,
                '--catalogue-showcase-fan-rotate': `${card.fan[2]}deg`,
              } as CSSProperties
            }
          >
            {card.content}
          </div>
        ))}
      </div>
    </div>
  );
}
