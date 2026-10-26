import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Column,
  Combobox,
  IconButton,
  List,
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
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Add } from '@envsemble/envui/icons/Add';
import type { ReactNode } from 'react';
import type { FoundationFigure } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import { Figure, FigureRun, NumberedLegend, type LegendEntry } from './Topic';

/*
 * The figures of the Spacing & density foundation. Its words are in docs/foundations/spacing.md,
 * the page's one source, which places each figure by name and gives it its legend: the name of each
 * numbered mark, or of each picture of a run, and what it means.
 */

/** A figure's words, from the page's Markdown. */
interface FigureWords {
  legend: readonly LegendEntry[];
}

/** Pictures side by side, each named by the legend's entry of the same place. */
function Run({
  legend,
  pictures,
  className,
}: FigureWords & { pictures: readonly ReactNode[]; className?: string }) {
  return (
    <FigureRun
      className={className}
      figures={pictures.map((picture, index) => ({
        name: legend[index]?.name ?? '',
        text: legend[index]?.text ?? '',
        picture,
      }))}
    />
  );
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
          <IconButton variant="secondary" icon={<MoreVert />} aria-label="More" />
          <Button startIcon={<Add />}>New report</Button>
        </Row>
      </MarkedSubject>
    </Figure>
  );
}

/**
 * The shapes envUI gives what it draws, each a real component: a surface, what sits inside one,
 * what is fully rounded, and circles.
 */
const shapes = [
  <Card
    key="surfaces"
    title="Quarterly report"
    description="Updated today"
    className="catalogue-shape-card"
  />,
  <Surface
    key="inside"
    background="default"
    padding={3}
    radius="xl"
    className="catalogue-shape-inner"
    render={<Column gap={3} />}
  >
    <Alert tone="info" title="Two reports need a review" />
    <List.Root aria-label="Reports">
      <List.Item label="Accessibility audit" />
      <List.Item label="Pricing research" />
    </List.Root>
  </Surface>,
  <Column key="rounded" gap={3} align="center">
    <Row gap={2} align="center">
      <Button>Save</Button>
      <Badge tone="accent">New</Badge>
    </Row>
    <SearchField label="Search" showLabel={false} />
  </Column>,
  <Row key="circles" gap={3} align="center">
    <Avatar name="Alex Morgan" size="lg" />
    <Avatar name="Sam Lee" size="lg" />
    <IconButton variant="secondary" icon={<MoreVert />} aria-label="More" />
  </Row>,
];

function ShapesFigure({ legend }: FigureWords) {
  return <Run legend={legend} pictures={shapes} className="catalogue-shape-stage" />;
}

/** A small dialog's content, the same in each scale, so the two compare. */
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

/** The scales the run compares, in the legend's order. */
const scales: readonly ThemeScale[] = ['comfortable', 'compact'];

/** The same content in the comfortable and the compact scale. */
function ScalesFigure({ legend }: FigureWords) {
  const theme = useTheme();
  return (
    <Run
      legend={legend}
      pictures={scales.map((scale) => (
        <Theme key={scale} {...theme} scale={scale} className="catalogue-scale-theme">
          <ScaleSample />
        </Theme>
      ))}
    />
  );
}

const reports = [
  { name: 'Quarterly report', owner: 'Priya Shah' },
  { name: 'Accessibility audit', owner: 'Sam Lee' },
  { name: 'Pricing research', owner: 'Alex Morgan' },
];

/** The row densities the run compares, in the legend's order. */
const densities: readonly RowDensity[] = ['sm', 'md'];

/** One table with tight rows and with regular ones: only the space in the rows changes. */
function RowsFigure({ legend }: FigureWords) {
  return (
    <Run
      legend={legend}
      pictures={densities.map((density, index) => (
        <Table.Root
          key={density}
          aria-label={`Reports, ${(legend[index]?.name ?? density).toLowerCase()}`}
          density={density}
        >
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
      ))}
    />
  );
}

/** One line tall, round ends; taller, the same corners make a rounded rectangle. */
function TallFigure() {
  return (
    <Figure label="Tall things keep sensible corners">
      <Row wrap align="start" justify="center" gap={6}>
        <Button>Save</Button>
        <Box style={{ inlineSize: '9rem' }}>
          <Button>Save the changes to every page</Button>
        </Box>
        <Box style={{ inlineSize: '16rem' }}>
          <Combobox
            multiple
            label="Reviewers"
            placeholder="Add people"
            items={reviewers}
            defaultValue={['alex.morgan', 'sam.lee', 'priya.shah', 'jordan.ellis']}
          />
        </Box>
      </Row>
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
