import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Column,
  Combobox,
  IconButton,
  Row,
  SearchField,
  SegmentedControl,
  Select,
  Surface,
  Switch,
  Table,
  Text,
  TextField,
  Theme,
  useTheme,
  type ComboboxItem,
  type RowDensity,
  type ThemeScale,
} from '@envsemble/envui';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { useState } from 'react';
import type { FoundationFigure } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { useTimeline } from '../../motion/Timeline';
import { CornerLabel, StepStack } from './Steps';
import { Figure, NumberedLegend, type LegendEntry } from './Topic';

/*
 * The figures of the Spacing & density foundation. Its words are in docs/foundations/spacing.md,
 * the page's one source, which places each figure by name and gives it its legend: the name of each
 * numbered mark, or of each picture of a run, and what it means.
 */

/** A figure's words, from the page's Markdown. */
interface FigureWords {
  legend: readonly LegendEntry[];
}

const reviewers: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => ({
    value: name.toLowerCase().replace(' ', '.'),
    label: name,
    start: <Avatar name={name} />,
  }),
);

/**
 * A settings card, measured: the space inside each group (1), between the groups of a section (2)
 * and between its sections (3).
 */
function GroupingFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="How space groups a settings card"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Surface
          background="default"
          padding={6}
          radius="xl"
          className="catalogue-spacing-subject"
          render={<Column gap={8} data-catalogue-space="3" />}
        >
          <Column gap={4} data-catalogue-space="2">
            <Column gap={1} data-catalogue-space="1">
              <Text render={<h3 />} variant="title">
                Profile
              </Text>
              <Text emphasis="muted">How other people see you.</Text>
            </Column>
            <TextField label="Name" defaultValue="Priya Shah" />
            <TextField label="Email" defaultValue="priya@example.com" />
          </Column>
          <Column gap={4} data-catalogue-space="2">
            <Column gap={1} data-catalogue-space="1">
              <Text render={<h3 />} variant="title">
                Notifications
              </Text>
              <Text emphasis="muted">What we send you by email.</Text>
            </Column>
            <Switch label="A weekly summary" defaultChecked />
            <Switch label="When someone mentions you" />
          </Column>
        </Surface>
      </MarkedSubject>
    </Figure>
  );
}

/** A toolbar of five kinds of control at one size, with guides along their tops and bottoms. */
function AlignFigure() {
  return (
    <Figure label="Controls of one size line up" className="catalogue-marked-stage">
      <MarkedSubject>
        <Row wrap gap={2} align="center" data-catalogue-guides className="catalogue-align-subject">
          <SearchField label="Search reports" showLabel={false} defaultValue="Budget" />
          <Select
            aria-label="Owner"
            items={[
              { value: 'anyone', label: 'Anyone' },
              { value: 'me', label: 'Me' },
            ]}
            defaultValue="anyone"
          />
          <SegmentedControl
            aria-label="View"
            value="list"
            onValueChange={() => {}}
            items={[
              { value: 'list', label: 'List' },
              { value: 'board', label: 'Board' },
            ]}
          />
          <IconButton variant="secondary" icon={<IconMoreVert />} aria-label="More" />
          <Button startIcon={<IconAdd />}>New report</Button>
        </Row>
      </MarkedSubject>
    </Figure>
  );
}

/**
 * One small screen with the four kinds of corner on it, each numbered: its surface, an alert
 * inside it, the round ends of a button, and a person's circle.
 */
function ShapesFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="Corners say what a thing is"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Surface
          background="default"
          padding={5}
          radius="xl"
          className="catalogue-shape-screen"
          data-catalogue-mark="1"
          render={<Column gap={4} />}
        >
          <Row gap={3} align="center" justify="between">
            <Text render={<p />} variant="title">
              Reports
            </Text>
            <Avatar name="Priya Shah" data-catalogue-mark="4" />
          </Row>
          <SearchField label="Search reports" showLabel={false} placeholder="Search reports" />
          <Alert tone="info" title="Two reports need a review" data-catalogue-mark="2" />
          <Row gap={2} align="center" justify="between">
            <Badge tone="primary">New</Badge>
            <Button data-catalogue-mark="3">Share</Button>
          </Row>
        </Surface>
      </MarkedSubject>
    </Figure>
  );
}

/** A small dialog's content, which the figure shows in each scale. */
function ScaleSample() {
  return (
    <Surface
      background="default"
      padding={5}
      radius="xl"
      className="catalogue-scale-sample"
      render={<Column gap={4} />}
    >
      <Column gap={1}>
        <Text render={<p />} variant="title">
          Rename report
        </Text>
        <Text emphasis="muted">Everyone on the team sees the new name.</Text>
      </Column>
      <TextField label="Title" defaultValue="Quarterly report" />
      <Row gap={2} justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button>Rename</Button>
      </Row>
    </Surface>
  );
}

/** The scales the figure switches between, in the legend's order. */
const scales: readonly ThemeScale[] = ['comfortable', 'compact'];

/**
 * One dialog switching between the comfortable and the compact scale, its controls, text, corners
 * and gaps stepping together, with the scale named in the corner.
 */
function ScaleSteps({ legend }: FigureWords) {
  const theme = useTheme();
  const step = useTimeline(scales.map(() => 4200));
  return (
    <>
      <CornerLabel>{legend[step]?.name}</CornerLabel>
      <StepStack
        className="catalogue-scale-steps"
        count={scales.length}
        at={step}
        render={(index) => (
          <Theme {...theme} scale={scales[index]} className="catalogue-scale-theme">
            <ScaleSample />
          </Theme>
        )}
      />
    </>
  );
}

function ScalesFigure({ legend }: FigureWords) {
  return (
    <Figure label="Comfortable or compact" motion="the dialog in each scale">
      <ScaleSteps legend={legend} />
    </Figure>
  );
}

const reports = [
  { name: 'Quarterly report', owner: 'Priya Shah' },
  { name: 'Accessibility audit', owner: 'Sam Lee' },
  { name: 'Pricing research', owner: 'Alex Morgan' },
];

/** The row densities the figure moves between, in the legend's order. */
const densities: readonly RowDensity[] = ['sm', 'md'];

function ReportsTable({ density }: { density: RowDensity }) {
  return (
    <Table.Root aria-label="Reports" density={density} className="catalogue-breathing-table">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Report</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {reports.map((report) => (
          <Table.Row key={report.name}>
            <Table.Cell>{report.name}</Table.Cell>
            <Table.Cell>{report.owner}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

/**
 * One table whose rows close up and open out again, the text keeping its size, with the density
 * named in the corner. A copy at the regular density, unseen, keeps the figure at its height.
 */
function RowSteps({ legend }: FigureWords) {
  const step = useTimeline(densities.map(() => 3600));
  return (
    <>
      <CornerLabel>{legend[step]?.name}</CornerLabel>
      <StepStack
        className="catalogue-rows-steps"
        count={2}
        at={1}
        render={(index) => <ReportsTable density={index ? densities[step]! : 'md'} />}
      />
    </>
  );
}

function RowsFigure({ legend }: FigureWords) {
  return (
    <Figure label="Tighter rows" motion="the rows closing up and opening out">
      <RowSteps legend={legend} />
    </Figure>
  );
}

const reviewersInput = '.catalogue-tall .env-combobox-input';
const reviewer = (index: number) => `.env-combobox-item:nth-child(${index} of .env-combobox-item)`;

/**
 * The pointer adds four reviewers, one by one, and the field grows to a second line and a third;
 * the button's container then narrows, so its label wraps. The pointer clears the field, the
 * container widens again, and the figure is back at its start.
 */
const tallScript: PointerStep[] = [
  { wait: 700 },
  { to: reviewersInput, x: 0.5, y: 0.8 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  ...[1, 2, 3, 4].flatMap((index): PointerStep[] => [
    { to: reviewer(index), x: 0.4, duration: 350 },
    { wait: 250 },
    { click: true },
    { wait: 550 },
  ]),
  { to: '.catalogue-tall .env-combobox-trigger', duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 400 },
  { to: '.catalogue-tall-save', x: 0.5, y: 0.5, duration: 600 },
  { cue: 'narrow' },
  { wait: 2600 },
  { to: '.catalogue-tall .env-combobox-clear', duration: 600 },
  { wait: 250 },
  { click: true },
  { cue: 'widen' },
  { wait: 1200 },
  { leave: true },
  { wait: 600 },
];

/** One line tall, round ends; taller, as it fills or wraps, the same corners make a rectangle. */
function TallSteps() {
  const [narrow, setNarrow] = useState(false);
  usePointer(tallScript, { onCue: (cue) => setNarrow(cue === 'narrow') });
  return (
    <Row align="start" justify="center" gap={6} className="catalogue-tall">
      <div className="catalogue-tall-slot">
        <Box className="catalogue-tall-box" data-narrow={narrow || undefined}>
          {/* It fills its container, so it wraps its label as that narrows, as a button does that
              can't move to a line of its own. */}
          <Button className="catalogue-tall-save" fullWidth>
            Save the changes
          </Button>
        </Box>
      </div>
      <Box className="catalogue-tall-field">
        <Combobox multiple clearable label="Reviewers" placeholder="Add people" items={reviewers} />
      </Box>
    </Row>
  );
}

function TallFigure() {
  return (
    <Figure
      label="Tall things keep sensible corners"
      motion="the field filling and the button wrapping"
      className="catalogue-tall-stage"
    >
      <TallSteps />
    </Figure>
  );
}

/** The figures docs/foundations/spacing.md places, by name. */
export const spacingFigures: Record<string, FoundationFigure> = {
  Grouping: { render: GroupingFigure, wide: true },
  Align: { render: AlignFigure, wide: true },
  Scales: { render: ScalesFigure, wide: true },
  Rows: { render: RowsFigure, wide: true },
  Shapes: { render: ShapesFigure, wide: true },
  Tall: { render: TallFigure },
};
