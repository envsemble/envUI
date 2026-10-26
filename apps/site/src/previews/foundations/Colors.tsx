import { useState, type CSSProperties } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Column,
  Row,
  SegmentedControl,
  Surface,
  Text,
  TextField,
  Theme,
  useTheme,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';
import { usePointer, type PointerStep } from '../Motion';
import type { FoundationFigure } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import { Figure, NumberedLegend, type LegendEntry } from './Topic';

/*
 * The figures of the Colors & themes foundation. Its words are in docs/foundations/colors.md, the
 * page's one source, which places each figure by name and gives it its legend: the name of each
 * numbered mark, group or theme, and what it means.
 */

/** A figure's words, from the page's Markdown. */
interface FigureWords {
  legend: readonly LegendEntry[];
}

/**
 * A small screen with each color role marked: the page, a surface on it, a filled card inside,
 * text, supporting text, the accent and a status.
 */
function RolesFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="The color roles of a screen"
      className="catalogue-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Surface
          background="page"
          padding={5}
          radius="xl"
          data-catalogue-mark="1"
          className="catalogue-roles"
        >
          <Surface
            background="default"
            padding={5}
            radius="xl"
            data-catalogue-mark="2"
            render={<Column gap={5} />}
          >
            <Column gap={1} align="start">
              <Text render={<h3 />} variant="title" data-catalogue-mark="4">
                Quarterly report
              </Text>
              <Text emphasis="muted" data-catalogue-mark="5">
                Updated today by Priya Shah
              </Text>
            </Column>
            <Card
              background="muted"
              padding={4}
              data-catalogue-mark="3"
              headingLevel={4}
              title="Budget"
              description="Within the plan for this quarter"
            />
            <Row justify="between" align="center" gap={3}>
              <Badge tone="success" data-catalogue-mark="7">
                On track
              </Badge>
              <Button data-catalogue-mark="6">Share</Button>
            </Row>
          </Surface>
        </Surface>
      </MarkedSubject>
    </Figure>
  );
}

/**
 * The colors of each role, in four groups of six, in the legend's order: each group is a legend
 * entry, its name the group's and its text the names of its roles, separated by commas. A status
 * shows its three colors in one swatch: its text, its soft fill and its solid fill.
 */
const roleGroups: readonly (readonly (readonly string[])[])[] = [
  [['bg-page'], ['bg-default'], ['bg-muted'], ['bg-raised'], ['bg-field'], ['bg-overlay']],
  [
    ['fg-default'],
    ['fg-muted'],
    ['fg-link'],
    ['border-default'],
    ['border-muted'],
    ['border-focus'],
  ],
  [
    ['bg-brand-emphasis'],
    ['fg-on-emphasis'],
    ['bg-neutral-muted'],
    ['bg-important-strong'],
    ['bg-selected'],
    ['fg-on-selected'],
  ],
  [
    ['fg-muted', 'bg-neutral-muted', 'bg-neutral-emphasis'],
    ['fg-accent', 'bg-accent-badge', 'bg-accent-emphasis'],
    ['fg-success', 'bg-success-muted', 'bg-success-emphasis'],
    ['fg-warning', 'bg-warning-muted', 'bg-warning-emphasis'],
    ['fg-danger', 'bg-danger-muted', 'bg-danger-emphasis'],
    ['fg-done', 'bg-done-muted', 'bg-done-emphasis'],
  ],
];

/** A role's name from a group's legend text, "Page, Surface, Filled surface…", by its place. */
const roleName = (text: string | undefined, index: number) =>
  (text ?? '').replace(/\.$/, '').split(/,\s*/)[index] ?? '';

/** The roles in the reader's theme, each group a continuous strip of swatches: a specimen of the system. */
function SwatchesFigure({ legend }: FigureWords) {
  return (
    <div className="catalogue-role-groups">
      <div>
        {roleGroups.map((roles, group) => {
          const title = legend[group]?.name ?? '';
          return (
            <section key={group} className="catalogue-role-group">
              <Text render={<h4 />} variant="title">
                {title}
              </Text>
              <ul className="catalogue-role-swatches" aria-label={title}>
                {roles.map((colors, index) => (
                  <li key={colors.join()}>
                    <span className="catalogue-role-swatch" aria-hidden="true">
                      {colors.map((color) => (
                        <span key={color} style={{ background: `var(--env-color-${color})` }} />
                      ))}
                    </span>
                    <Text render={<span />} className="catalogue-topic-legend-name">
                      {roleName(legend[group]?.text, index)}
                    </Text>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** The theme and contrast of each sample, in the legend's order. */
const themes: readonly { theme: ThemeValue; contrast: ThemeContrast }[] = [
  { theme: 'light', contrast: 'standard' },
  { theme: 'dark', contrast: 'standard' },
  { theme: 'light', contrast: 'high' },
  { theme: 'dark', contrast: 'high' },
];

/** A segment of the theme control, by its place from 1. */
const segment = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/*
 * The pointer chooses each theme in turn, about two and a half seconds apart, and Light again,
 * then leaves: the loop starts again from Light.
 */
const themeScript: PointerStep[] = [
  { wait: 1500 },
  { to: segment(2) },
  { wait: 300 },
  { click: true },
  ...[3, 4, 1].flatMap((index): PointerStep[] => [
    { wait: 3300 },
    { to: segment(index), duration: index === 1 ? 700 : 500 },
    { wait: 200 },
    { click: true },
  ]),
  { wait: 3300 },
  { leave: true },
];

/**
 * One screen above a control of the four themes, each chosen in turn by the pointer: the screen
 * eases into each, its page, surface, text, field, badge and buttons alike.
 */
function ThemeSteps({ names }: { names: readonly string[] }) {
  const [chosen, setChosen] = useState('0');
  usePointer(themeScript);
  const { theme, contrast } = themes[Number(chosen)]!;
  return (
    <Column gap={5} align="center" className="catalogue-theme-steps">
      <Theme theme={theme} contrast={contrast} className="catalogue-theme-screen">
        <Surface background="page" padding={5} radius="xl">
          <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
            <Row justify="between" align="start" gap={3}>
              <Column gap={1}>
                <Text render={<p />} variant="title">
                  Quarterly report
                </Text>
                <Text emphasis="muted">Updated today by Priya Shah</Text>
              </Column>
              <Badge tone="success">On track</Badge>
            </Row>
            <TextField label="Note for the team" defaultValue="The figures are final." />
            <Row justify="end" gap={2}>
              <Button variant="secondary">Preview</Button>
              <Button>Share</Button>
            </Row>
          </Surface>
        </Surface>
      </Theme>
      <SegmentedControl
        aria-label="Theme"
        size="sm"
        value={chosen}
        onValueChange={setChosen}
        items={names.map((name, index) => ({ value: String(index), label: name }))}
      />
    </Column>
  );
}

/** One screen stepping through each theme and contrast, chosen on a control below it. */
function ThemesFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="One screen in each theme"
      motion="the screen in each theme"
      className="catalogue-themes-stage"
    >
      <ThemeSteps names={legend.map((entry) => entry.name)} />
    </Figure>
  );
}

/** The tones at work: badges in each, a warning, a note and a danger button. */
function StatusFigure() {
  return (
    <Figure label="Each tone at work" className="catalogue-status-stage">
      <Column gap={4} align="center" inert>
        <Row wrap justify="center" gap={2}>
          <Badge tone="accent">Current</Badge>
          <Badge tone="success">Ready</Badge>
          <Badge tone="warning">Needs review</Badge>
          <Badge tone="danger">Failed</Badge>
          <Badge tone="done">Done</Badge>
          <Badge tone="neutral">Archived</Badge>
        </Row>
        <Alert tone="warning" title="Two reports need a review">
          They are due on Friday.
        </Alert>
        <Alert tone="info" title="Reports now show who changed them last" />
        <Button tone="danger">Delete report</Button>
      </Column>
    </Figure>
  );
}

/** One button's own colors, which its hover and press follow. */
const forest = {
  '--env-button-container': '#0a5c42',
  '--env-button-content': '#ffffff',
} as CSSProperties;

/** One button in a color of its own, and one area in the other theme. */
function OwnColorsFigure() {
  const theme = useTheme();
  const other: ThemeValue = theme.theme === 'dark' ? 'light' : 'dark';
  return (
    <Figure label="Colors of its own">
      <Column gap={5} align="center">
        <Row gap={2} wrap justify="center">
          <Button style={forest}>Start trial</Button>
          <Button variant="secondary">Not now</Button>
        </Row>
        <Theme {...theme} theme={other}>
          <Surface background="page" padding={5} radius="xl" render={<Column gap={3} />}>
            <Column gap={1}>
              <Text render={<p />} variant="title">
                Try the team plan
              </Text>
              <Text emphasis="muted">An area in the other theme, on this page.</Text>
            </Column>
            <Row gap={2}>
              <Button size="sm">See plans</Button>
            </Row>
          </Surface>
        </Theme>
      </Column>
    </Figure>
  );
}

/** The figures docs/foundations/colors.md places, by name. */
export const colorsFigures: Record<string, FoundationFigure> = {
  Roles: { render: RolesFigure, wide: true },
  Swatches: { render: SwatchesFigure, wide: true },
  Themes: { render: ThemesFigure, wide: true },
  Status: { render: StatusFigure, wide: true },
  OwnColors: { render: OwnColorsFigure },
};
