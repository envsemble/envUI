import {
  Avatar,
  Badge,
  Button,
  Column,
  DescriptionList,
  PageHeader,
  Surface,
  Text,
} from '@envsemble/envui';
import { WidthSweep } from '../../motion/WidthSweep';
import type { FoundationFigure } from './FoundationFigures';
import { ClassTextSizeFigure } from './ResponsiveTextSize';
import { Figure, type LegendEntry } from './Figure';

/*
 * The figures of the Adapting to width foundation. Its words are in docs/foundations/responsive.md,
 * the page's one source, which places each figure by name and gives it its legend.
 */

/** A profile's header and details: the header and the list each follow their own width. */
function Profile() {
  return (
    <Surface background="default" padding={5} radius="xl" render={<Column gap={5} />}>
      <PageHeader
        title="Sam Lee"
        headingLevel={3}
        description="Product designer"
        start={<Avatar name="Sam Lee" />}
        meta={<Badge>Admin</Badge>}
        actions={
          <>
            <Button variant="secondary">Message</Button>
            <Button>Edit profile</Button>
          </>
        }
      />
      <DescriptionList.Root aria-label="Profile details">
        <DescriptionList.Item label="Team">Research</DescriptionList.Item>
        <DescriptionList.Item label="Location">Lisbon</DescriptionList.Item>
        <DescriptionList.Item label="Joined">4 March 2026</DescriptionList.Item>
      </DescriptionList.Root>
    </Surface>
  );
}

/**
 * The profile in one frame whose width sweeps from a narrow pane to room to spare and back, slowly
 * and held at each end, its ruler naming the window class alone, as the page shows no lengths; the
 * legend's two entries, below it, say what changes at each. On a stage too narrow for its widest
 * at a legible scale, such as a phone's, the frame is cut off and panned across rather than
 * narrowed, so the actions beside the name still show.
 */
function WidthsFigure({ legend }: { legend: readonly LegendEntry[] }) {
  return (
    <Figure
      label="One profile, from a narrow pane to room to spare"
      motion="the profile from a narrow pane to room to spare"
      legend={
        <div className="catalogue-width-legend">
          {legend.map((entry) => (
            <div key={entry.name} className="catalogue-topic-text">
              <Text render={<p />} variant="title">
                {entry.name}
              </Text>
              <Text render={<p />} variant="body-sm" emphasis="muted">
                {entry.text}
              </Text>
            </div>
          ))}
        </div>
      }
    >
      <WidthSweep widths={[18, 44]} hold={1600} classes="only" crop>
        <Profile />
      </WidthSweep>
    </Figure>
  );
}

/** The figures docs/foundations/responsive.md places, by name. */
export const responsiveFigures: Record<string, FoundationFigure> = {
  Widths: { render: WidthsFigure, wide: true },
  TextSize: { render: ClassTextSizeFigure, wide: true },
};
