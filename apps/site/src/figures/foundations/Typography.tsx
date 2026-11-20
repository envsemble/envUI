import { useContext } from 'react';
import {
  Badge,
  Button,
  Column,
  Row,
  Text,
  Theme,
  useTheme,
  type TextVariant,
} from '@envsemble/envui';
import { useTimeline } from '../../motion/Timeline';
import { WidthSweep } from '../../motion/WidthSweep';
import ChangingNumber from '../../examples/typography/ChangingNumber';
import type { FoundationFigureEntry } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import { AtTextSize, CornerLabel, StepStack } from './Steps';
import { FigurePart, FoundationFrame, NumberedLegend, type LegendEntry } from './FoundationFrame';

interface FigureWords {
  legend: readonly LegendEntry[];
}

function ScreenFigure({ legend }: FigureWords) {
  return (
    <FoundationFrame
      label="The text styles of a screen"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Column gap={6} className="catalogue-type-screen">
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
        </Column>
      </MarkedSubject>
    </FoundationFrame>
  );
}

const variants: readonly TextVariant[] = [
  'display',
  'headline',
  'title',
  'body',
  'body-sm',
  'caption',
];

function StylesFigure({ legend }: FigureWords) {
  return (
    <ol
      className="catalogue-type-styles"
      aria-label="Text styles"
      data-site-figure={useContext(FigurePart)}
    >
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

function HierarchyFigure({ legend }: FigureWords) {
  return (
    <FoundationFrame
      label="A lead, then quieter detail"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Column gap={5} className="catalogue-type-screen">
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
        </Column>
      </MarkedSubject>
    </FoundationFrame>
  );
}

function EmphasisFigure() {
  return (
    <FoundationFrame label="Quieter text">
      <Column gap={2} align="start" inert>
        <Text>Quarterly report</Text>
        <Text emphasis="muted">Updated today by Priya Shah</Text>
      </Column>
    </FoundationFrame>
  );
}

function BookClub() {
  return (
    <Column gap={3}>
      <Column gap={1}>
        <Text render={<p />} variant="title">
          Book club
        </Text>
        <Text>This month we read The Overstory, and meet on Thursday at seven in the library.</Text>
      </Column>
      <Row wrap gap={3} align="center" justify="between">
        <Text variant="body-sm">12 members going</Text>
        <Button size="sm">Join</Button>
      </Row>
    </Column>
  );
}

const textSteps: readonly { size: number; compact: boolean; label: string }[] = [
  { size: 1, compact: false, label: 'Usual text size' },
  { size: 1.25, compact: false, label: 'Larger text' },
  { size: 1.5, compact: false, label: 'Larger still' },
  { size: 1, compact: true, label: 'Compact' },
];
const textStepMs = 1440;

function TextSizeSteps() {
  const theme = useTheme();
  const step = useTimeline(textSteps.map(() => textStepMs));
  return (
    <>
      <CornerLabel>{textSteps[step]!.label}</CornerLabel>
      <StepStack
        className="catalogue-fixed-frame catalogue-text-size-frame"
        count={textSteps.length}
        at={step}
        render={(index) => {
          const { size, compact } = textSteps[index]!;
          return (
            <Theme
              {...theme}
              scale={compact ? 'compact' : theme.scale}
              className="catalogue-scale-theme"
            >
              <AtTextSize size={size}>
                <BookClub />
              </AtTextSize>
            </Theme>
          );
        }}
      />
    </>
  );
}

function TextSizeFigure() {
  return (
    <FoundationFrame label="Text follows the reader" motion="the card at each text size">
      <TextSizeSteps />
    </FoundationFrame>
  );
}

function MeasureFigure() {
  return (
    <FoundationFrame
      label="Lines a comfortable length"
      motion="the frame widening"
      className="catalogue-measure-stage"
    >
      <WidthSweep widths={[20, 44]} ruler={false}>
        <div className="catalogue-measure">
          <Column gap={2} className="catalogue-measure-text">
            <Text render={<p />} variant="title">
              Hollow Wood
            </Text>
            <Text>
              The path leaves the car park by the old mill and climbs gently through beech and oak.
              After the first kilometre it follows the stream to a wooden bridge, where most walkers
              stop for tea before the steeper stretch up to the ridge.
            </Text>
          </Column>
        </div>
      </WidthSweep>
    </FoundationFrame>
  );
}

function ChangingNumberFigure({ caption }: { caption?: string }) {
  return (
    <FoundationFrame label="A number that changes" caption={caption}>
      <ChangingNumber />
    </FoundationFrame>
  );
}

export const typographyFigures: Record<string, FoundationFigureEntry> = {
  Screen: { render: ScreenFigure, wide: true },
  Styles: { render: StylesFigure, wide: true },
  Emphasis: { render: EmphasisFigure },
  Hierarchy: { render: HierarchyFigure },
  TextSize: { render: TextSizeFigure },
  Measure: { render: MeasureFigure, wide: true },
  ChangingNumber: { render: ChangingNumberFigure },
};
