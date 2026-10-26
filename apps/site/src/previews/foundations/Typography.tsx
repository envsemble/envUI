import { Badge, Column, Row, Surface, Text, type TextVariant } from '@envsemble/envui';
import type { FoundationFigure } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import { Figure, NumberedLegend, type LegendEntry } from './Topic';

/*
 * The figures of the Typography foundation. Its words are in docs/foundations/typography.md, the
 * page's one source, which places each figure by name and gives it its legend: the name of each
 * numbered mark, or of each style, and what it means.
 */

/** A figure's words, from the page's Markdown. */
interface FigureWords {
  legend: readonly LegendEntry[];
}

/** A small report screen with each text style it uses marked. */
function ScreenFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="The text styles of a screen"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Surface
          background="default"
          padding={6}
          radius="xl"
          className="catalogue-type-screen"
          render={<Column gap={6} />}
        >
          <Text render={<p />} variant="headline" data-catalogue-mark="1">
            Quarterly report
          </Text>
          <Column gap={2} align="start">
            <Row gap={2} align="center">
              <Text render={<p />} variant="title" data-catalogue-mark="2">
                Budget
              </Text>
              <Badge tone="success">On track</Badge>
            </Row>
            <Text data-catalogue-mark="3">
              Spending is within the plan, with most of the quarter&apos;s travel already booked.
            </Text>
            <Text variant="body-sm" data-catalogue-mark="4">
              Updated today by Priya Shah
            </Text>
          </Column>
          <Text variant="caption" data-catalogue-mark="5">
            Figures include tax.
          </Text>
        </Surface>
      </MarkedSubject>
    </Figure>
  );
}

/** Every text style, largest first, in the legend's order. */
const variants: readonly TextVariant[] = [
  'display',
  'headline',
  'title',
  'body',
  'body-sm',
  'caption',
];

/**
 * The text styles as a specimen of the system, on the page: each sample in its style, with the
 * legend's name and job of the style in the same place.
 */
function StylesFigure({ legend }: FigureWords) {
  return (
    <ol className="catalogue-type-styles" aria-label="Text styles">
      {variants.map((variant, index) => (
        <li key={variant}>
          <Text render={<span />} variant={variant} className="catalogue-type-sample">
            Quarterly report
          </Text>
          <span className="catalogue-type-name">
            <Text render={<span />} className="catalogue-topic-legend-name">
              {legend[index]?.name}
            </Text>
            <Text render={<span />} variant="body-sm" emphasis="muted">
              {legend[index]?.text}
            </Text>
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * A short screen whose text reads in order: a lead in the main color, the detail after it quieter,
 * and a section's note in the small style.
 */
function HierarchyFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="A lead, then quieter detail"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Surface
          background="default"
          padding={6}
          radius="xl"
          className="catalogue-type-screen"
          render={<Column gap={5} />}
        >
          <Column gap={2}>
            <Text render={<p />} variant="headline">
              Billing
            </Text>
            <Text data-catalogue-mark="1">
              Your plan renews on the first of July for the whole team.
            </Text>
            <Text emphasis="muted" data-catalogue-mark="2">
              The owner of the workspace gets a receipt after each payment, and can change the card
              or the plan at any time.
            </Text>
          </Column>
          <Column gap={1}>
            <Text render={<p />} variant="title">
              Payment method
            </Text>
            <Text variant="body-sm" data-catalogue-mark="3">
              The card we charge each month
            </Text>
          </Column>
        </Surface>
      </MarkedSubject>
    </Figure>
  );
}

/** The same size of text in the main color and the quieter one. */
function EmphasisFigure() {
  return (
    <Figure label="Quieter text">
      <Column gap={2} align="start" inert>
        <Text>Quarterly report</Text>
        <Text emphasis="muted">Updated today by Priya Shah</Text>
      </Column>
    </Figure>
  );
}

/** The figures docs/foundations/typography.md places, by name. */
export const typographyFigures: Record<string, FoundationFigure> = {
  Screen: { render: ScreenFigure, wide: true },
  Styles: { render: StylesFigure, wide: true },
  Emphasis: { render: EmphasisFigure },
  Hierarchy: { render: HierarchyFigure },
};
