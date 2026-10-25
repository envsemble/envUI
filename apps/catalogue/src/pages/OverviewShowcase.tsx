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
 * at their most pleasing, live, with no purpose beyond being looked at.
 */
const cards: { id: string; content: ReactNode }[] = [
  {
    id: 'status',
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
    content: (
      <Column gap={3}>
        <Slider label="Opacity" defaultValue={40} formatValue={(value) => `${value}%`} />
        <Switch label="Show the grid" defaultChecked />
      </Column>
    ),
  },
  {
    id: 'usage',
    content: (
      <Column gap={4}>
        <Meter label="Storage" value={7.2} max={10} valueText="7.2 of 10 GB" />
        <Meter label="Seats" value={4} max={5} valueText="4 of 5" />
      </Column>
    ),
  },
  {
    id: 'figure',
    content: (
      <Column gap={1}>
        <Text variant="body-sm" emphasis="muted" render={<span />}>
          Tasks done this year
        </Text>
        <Row gap={3} align="center">
          <Text variant="display" render={<span />}>
            <AnimatedNumber value={1280} />
          </Text>
          <Badge tone="success">+12%</Badge>
        </Row>
      </Column>
    ),
  },
  {
    id: 'team',
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
 * The Overview's showcase, under its banner: a pocket holding a stack of cards, each a few live
 * components. The cards rise out of the pocket as the page opens, and fan out while the pointer is
 * over them. It is decoration only: hidden from assistive technology, its components inert, so only the
 * pointer's hover reaches it.
 */
export function OverviewShowcase() {
  return (
    <div className="docs-showcase" aria-hidden="true">
      <div className="docs-showcase-stack">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="docs-showcase-card"
            style={
              {
                '--docs-showcase-index': index,
                '--docs-showcase-offset': index - (cards.length - 1),
                '--docs-showcase-spread': index - (cards.length - 1) / 2,
              } as CSSProperties
            }
          >
            <div inert>{card.content}</div>
          </div>
        ))}
        <div className="docs-showcase-pocket">
          <span className="docs-showcase-label">Made with envUI</span>
        </div>
      </div>
    </div>
  );
}
