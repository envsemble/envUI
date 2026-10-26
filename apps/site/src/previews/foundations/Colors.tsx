import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Column,
  Row,
  SegmentedControl,
  Surface,
  Switch,
  Text,
  TextField,
  Theme,
  useTheme,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';
import { Bedtime } from '@envsemble/envui/icons/Bedtime';
import { Forest } from '@envsemble/envui/icons/Forest';
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

/**
 * One green family, as an application gives an area of its own (customizing.md's GreenArea): the
 * roles the card paints, with their hover and press, in each theme. In the light theme a sage
 * surface, a moss fill and a forest action; in the dark theme deep forest with a light green
 * action. At high contrast its text and edges keep the theme's own, stronger colors.
 */
const green: Record<ThemeValue, { fills: CSSProperties; lines: CSSProperties }> = {
  light: {
    fills: {
      '--env-color-bg-page': '#f6faf6',
      '--env-color-bg-default': '#eef4ee',
      '--env-color-bg-muted': '#dde9de',
      '--env-color-bg-brand-emphasis': '#0a5c42',
      '--env-color-bg-brand-emphasis-hover': '#084c37',
      '--env-color-bg-brand-emphasis-pressed': '#063d2c',
      '--env-color-fg-on-emphasis': '#ffffff',
      '--env-color-bg-neutral-muted': 'rgb(10 92 66 / 0.12)',
      '--env-color-bg-neutral-muted-hover': 'rgb(10 92 66 / 0.19)',
      '--env-color-bg-neutral-muted-pressed': 'rgb(10 92 66 / 0.27)',
      '--env-color-bg-neutral-subtle-hover': 'rgb(10 92 66 / 0.08)',
      '--env-color-bg-neutral-subtle-pressed': 'rgb(10 92 66 / 0.14)',
      '--env-color-bg-selected': '#c3dfca',
      '--env-color-bg-selected-hover': '#b9d8c1',
      '--env-color-bg-selected-pressed': '#afd1b8',
      '--env-color-fg-on-selected': '#0a4d37',
      '--env-color-fg-accent': '#0a5c42',
      '--env-color-fg-control': '#173f30',
    } as CSSProperties,
    lines: {
      '--env-color-fg-muted': '#46594d',
      '--env-color-border-default': '#74877a',
      '--env-color-border-muted': '#c3d3c6',
    } as CSSProperties,
  },
  dark: {
    fills: {
      '--env-color-bg-page': '#0b1a13',
      '--env-color-bg-default': '#10241b',
      '--env-color-bg-muted': '#1a3528',
      '--env-color-bg-brand-emphasis': '#7ad197',
      '--env-color-bg-brand-emphasis-hover': '#5fbf80',
      '--env-color-bg-brand-emphasis-pressed': '#45ad69',
      '--env-color-fg-on-emphasis': '#10241b',
      '--env-color-bg-neutral-muted': 'rgb(122 209 151 / 0.14)',
      '--env-color-bg-neutral-muted-hover': 'rgb(122 209 151 / 0.21)',
      '--env-color-bg-neutral-muted-pressed': 'rgb(122 209 151 / 0.28)',
      '--env-color-bg-neutral-subtle-hover': 'rgb(122 209 151 / 0.08)',
      '--env-color-bg-neutral-subtle-pressed': 'rgb(122 209 151 / 0.14)',
      '--env-color-bg-selected': '#2c6347',
      '--env-color-bg-selected-hover': '#326b4e',
      '--env-color-bg-selected-pressed': '#387355',
      '--env-color-fg-on-selected': '#c4efd2',
      '--env-color-fg-accent': '#7ad197',
      '--env-color-fg-control': '#dcefe2',
    } as CSSProperties,
    lines: {
      '--env-color-fg-muted': '#b2c8ba',
      '--env-color-border-default': '#7f9b88',
      '--env-color-border-muted': '#2f4d3d',
    } as CSSProperties,
  },
};

/** An area in the green family, in a theme, at the reader's contrast. */
function GreenArea({
  theme,
  className,
  children,
}: {
  theme: ThemeValue;
  className?: string;
  children: ReactNode;
}) {
  const { contrast } = useTheme();
  const { fills, lines } = green[theme];
  return (
    <Theme
      theme={theme}
      contrast={contrast}
      className={className}
      style={contrast === 'high' ? fills : { ...fills, ...lines }}
    >
      {children}
    </Theme>
  );
}

/**
 * The pointer rests on the green action, presses it, then turns the switch off and on again, so
 * the green's own hover, press and switch play; it leaves with the switch on, as it began.
 */
const ownColorsScript: PointerStep[] = [
  { wait: 900 },
  { to: '.catalogue-walk-book', x: 0.2, y: 0.8 },
  { to: '.catalogue-walk-book', x: 0.55, y: 0.5, duration: 450 },
  { wait: 1100 },
  { press: true },
  { wait: 260 },
  { release: true },
  { wait: 900 },
  { to: '.catalogue-walk .env-switch-input', duration: 750 },
  { wait: 500 },
  { click: true },
  { wait: 1500 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 900 },
];

/**
 * A card in a green family of its own, a guided walk to book, with its route in a filled card and
 * its foot, a night walk, in the other theme; the pointer plays its green action and its switch.
 */
function ForestWalk() {
  const page = useTheme();
  const other: ThemeValue = page.theme === 'dark' ? 'light' : 'dark';
  const [route, setRoute] = useState('long');
  usePointer(ownColorsScript);
  return (
    <GreenArea theme={page.theme} className="catalogue-walk">
      <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
        <Row gap={3} align="start">
          <Forest className="catalogue-walk-icon" width="1.75rem" height="1.75rem" />
          <Column gap={1}>
            <Text render={<p />} variant="title">
              Guided forest walk
            </Text>
            <Text emphasis="muted">Saturday 9:00 · 6 km through Hollow Wood</Text>
          </Column>
        </Row>
        <Surface background="muted" padding={4} radius="sm" render={<Column gap={3} />}>
          <Row gap={3} align="center" justify="between">
            <Text>Route</Text>
            <SegmentedControl
              aria-label="Route"
              size="sm"
              value={route}
              onValueChange={setRoute}
              items={[
                { value: 'short', label: 'Short' },
                { value: 'long', label: 'Long' },
              ]}
            />
          </Row>
          <Switch label="Bring a dog" defaultChecked />
        </Surface>
        <Row gap={2} align="center" justify="between">
          <Badge tone="success">8 places left</Badge>
          <Row gap={2}>
            <Button variant="secondary">Not now</Button>
            <Button className="catalogue-walk-book">Book a place</Button>
          </Row>
        </Row>
        <GreenArea theme={other} className="catalogue-walk-foot">
          <Surface
            background="default"
            padding={3}
            radius="sm"
            render={<Row gap={3} align="center" justify="between" />}
          >
            <Row gap={2} align="center">
              <Bedtime className="catalogue-walk-icon" />
              <Text>Night walk · Friday 21:00</Text>
            </Row>
            <Button size="sm">Join</Button>
          </Surface>
        </GreenArea>
      </Surface>
    </GreenArea>
  );
}

/** A card in a color family of its own, with an area in the other theme, played by the pointer. */
function OwnColorsFigure() {
  return (
    <Figure label="Colors of its own" motion="the card in its own colors">
      <ForestWalk />
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
