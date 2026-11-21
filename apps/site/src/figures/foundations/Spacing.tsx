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
import type { FoundationFigureEntry } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { useTimeline } from '../../motion/Timeline';
import { CornerLabel, StepStack } from './Steps';
import { FoundationFrame, NumberedLegend, type LegendEntry } from './FoundationFrame';

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

function GroupingFigure({ legend }: FigureWords) {
  return (
    <FoundationFrame
      label="How space groups a settings form"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Column gap={8} data-catalogue-space="3" className="catalogue-spacing-subject">
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
        </Column>
      </MarkedSubject>
    </FoundationFrame>
  );
}

function AlignFigure() {
  return (
    <FoundationFrame label="Controls of one size line up" className="catalogue-marked-stage">
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
          <Button start={<IconAdd />}>New report</Button>
        </Row>
      </MarkedSubject>
    </FoundationFrame>
  );
}

function ShapesFigure({ legend }: FigureWords) {
  return (
    <FoundationFrame
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
    </FoundationFrame>
  );
}

function ScaleSample() {
  return (
    <Column gap={4} className="catalogue-scale-sample">
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
    </Column>
  );
}

const scales: readonly ThemeScale[] = ['comfortable', 'compact'];
const scaleStepMs = 2520;

function ScaleSteps({ legend }: FigureWords) {
  const theme = useTheme();
  const step = useTimeline(scales.map(() => scaleStepMs));
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
    <FoundationFrame label="Comfortable or compact" motion="the form in each scale">
      <ScaleSteps legend={legend} />
    </FoundationFrame>
  );
}

const reports = [
  { name: 'Quarterly report', owner: 'Priya Shah' },
  { name: 'Accessibility audit', owner: 'Sam Lee' },
  { name: 'Pricing research', owner: 'Alex Morgan' },
];

const densities: readonly RowDensity[] = ['sm', 'md'];
const densityStepMs = 2160;
const shownTable = 1;

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

function RowSteps({ legend }: FigureWords) {
  const step = useTimeline(densities.map(() => densityStepMs));
  return (
    <>
      <CornerLabel>{legend[step]?.name}</CornerLabel>
      <StepStack
        className="catalogue-rows-steps"
        count={2}
        at={shownTable}
        render={(index) => (
          <ReportsTable density={index === shownTable ? densities[step]! : 'md'} />
        )}
      />
    </>
  );
}

function RowsFigure({ legend }: FigureWords) {
  return (
    <FoundationFrame label="Tighter rows" motion="the rows closing up and opening out">
      <RowSteps legend={legend} />
    </FoundationFrame>
  );
}

const reviewersInput = '.catalogue-tall .env-combobox-input';
const reviewerOption = (position: number) =>
  `.env-combobox-item:nth-child(${position} of .env-combobox-item)`;

const tallScript: PointerStep[] = [
  { wait: 420 },
  { to: reviewersInput, x: 0.5, y: 0.8 },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  ...[1, 2, 3, 4].flatMap((index): PointerStep[] => [
    { to: reviewerOption(index), x: 0.4, duration: 350 },
    { wait: 150 },
    { click: true },
    { wait: 330 },
  ]),
  { to: '.catalogue-tall .env-combobox-trigger', duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 240 },
  { to: '.catalogue-tall-save', x: 0.5, y: 0.5, duration: 600 },
  { cue: 'narrow' },
  { wait: 1560 },
  { to: '.catalogue-tall .env-combobox-clear', duration: 600 },
  { wait: 150 },
  { click: true },
  { cue: 'widen' },
  { wait: 720 },
  { leave: true },
  { wait: 360 },
];

function TallSteps() {
  const [narrow, setNarrow] = useState(false);
  usePointer(tallScript, { onCue: (cue) => setNarrow(cue === 'narrow') });
  return (
    <Row align="start" justify="center" gap={6} className="catalogue-tall">
      <div className="catalogue-tall-slot">
        <Box className="catalogue-tall-box" data-narrow={narrow || undefined}>
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
    <FoundationFrame
      label="Tall things keep sensible corners"
      motion="the field filling and the button wrapping"
      className="catalogue-tall-stage"
    >
      <TallSteps />
    </FoundationFrame>
  );
}

export const spacingFigures: Record<string, FoundationFigureEntry> = {
  Grouping: { render: GroupingFigure, wide: true },
  Align: { render: AlignFigure, wide: true },
  Scales: { render: ScalesFigure, wide: true },
  Rows: { render: RowsFigure, wide: true },
  Shapes: { render: ShapesFigure, wide: true },
  Tall: { render: TallFigure },
};
