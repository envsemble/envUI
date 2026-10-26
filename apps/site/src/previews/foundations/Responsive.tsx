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
import type { FoundationFigure } from './FoundationFigures';
import { ClassTextSizeFigure } from './ResponsiveTextSize';
import type { LegendEntry } from './Topic';

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

/** The widths of the two frames, in the legend's order. */
const widths = ['narrow', 'wide'] as const;

/**
 * The same profile in a narrow frame and a wide one, one above the other, each named by the
 * legend's entry of the same place.
 */
function WidthsFigure({ legend }: { legend: readonly LegendEntry[] }) {
  return (
    <div className="catalogue-width-figures">
      {widths.map((width, index) => (
        <figure key={width} className="site-topic-figure" aria-label={legend[index]?.name}>
          <div className="site-foundation-stage" data-figure="example" inert>
            <div className="catalogue-width-sample" data-width={width}>
              <Profile />
            </div>
          </div>
          <figcaption className="catalogue-topic-text">
            <Text render={<p />} variant="title">
              {legend[index]?.name}
            </Text>
            <Text variant="body-sm" emphasis="muted">
              {legend[index]?.text}
            </Text>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** The figures docs/foundations/responsive.md places, by name. */
export const responsiveFigures: Record<string, FoundationFigure> = {
  Widths: { render: WidthsFigure, wide: true },
  TextSize: { render: ClassTextSizeFigure, wide: true },
};
