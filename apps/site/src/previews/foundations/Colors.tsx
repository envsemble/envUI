import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Column,
  Meter,
  Row,
  SegmentedControl,
  Surface,
  Switch,
  Text,
  Theme,
  useTheme,
  type BadgeTone,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { BakeryDining } from '@envsemble/envui/icons/BakeryDining';
import { Bedtime } from '@envsemble/envui/icons/Bedtime';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Error as ErrorIcon } from '@envsemble/envui/icons/Error';
import { Info } from '@envsemble/envui/icons/Info';
import { RadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { Warning } from '@envsemble/envui/icons/Warning';
import { usePointer, type PointerStep } from '../Motion';
import type { FoundationFigure } from './FoundationFigures';
import { Figure } from './Topic';
import type { LegendEntry } from './Topic';

/*
 * The figures of the Colors & themes foundation. Its words are in docs/foundations/colors.md, the
 * page's one source, which places each figure by name and gives it its legend: the name of each
 * numbered part, family, theme or tone, and what it means.
 */

/** A figure's words, from the page's Markdown. */
interface FigureWords {
  legend: readonly LegendEntry[];
}

/** A numbered pin on a part of the roles screen: on a container's corner, or after a leaf part. */
function Pin({ number, corner }: { number: number; corner?: 'start' | 'end' }) {
  return (
    <span
      className="site-anatomy-number catalogue-role-pin"
      data-corner={corner}
      aria-hidden="true"
    >
      {number}
    </span>
  );
}

/**
 * The color of each role in the roles figure's key, in the legend's order, and the role its number
 * takes on it: a background carries the text, a text role the surface, the accent its own ink and
 * the status its tone over its tint.
 */
const roleKey: readonly { fill: string; ink: string }[] = [
  { fill: 'bg-page', ink: 'fg-default' },
  { fill: 'bg-default', ink: 'fg-default' },
  { fill: 'bg-muted', ink: 'fg-default' },
  { fill: 'fg-default', ink: 'bg-default' },
  { fill: 'fg-muted', ink: 'bg-default' },
  { fill: 'bg-brand-emphasis', ink: 'fg-on-emphasis' },
  { fill: 'bg-success-muted', ink: 'fg-success' },
];

/**
 * A small screen with a numbered pin on each part that takes a role: the page, a surface on it, a
 * filled card inside, text, supporting text, the accent and a status. Beside it, or below it on a
 * narrower page, its key: each role's color in the reader's theme, with its number, name and use.
 */
function RolesFigure({ legend }: FigureWords) {
  return (
    <div className="catalogue-roles-figure">
      <Figure
        label="The color roles of a screen"
        className="catalogue-roles-stage"
        legend={
          <ol className="catalogue-role-key">
            {legend.map((entry, index) => {
              const { fill, ink } = roleKey[index] ?? roleKey[0]!;
              return (
                <li key={entry.name}>
                  <span
                    className="catalogue-role-key-swatch"
                    style={{
                      background: `var(--env-color-${fill})`,
                      color: `var(--env-color-${ink})`,
                    }}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <Text render={<p />} className="catalogue-topic-legend-name">
                      {entry.name}
                    </Text>
                    <Text render={<p />} variant="body-sm" emphasis="muted">
                      {entry.text}
                    </Text>
                  </div>
                </li>
              );
            })}
          </ol>
        }
      >
        <div className="catalogue-roles-screen" inert>
          <Surface background="page" padding={5} radius="xl" className="catalogue-role-part">
            <Pin number={1} corner="start" />
            <Surface
              background="default"
              padding={5}
              radius="xl"
              className="catalogue-role-part"
              render={<Column gap={5} />}
            >
              <Pin number={2} corner="end" />
              <Column gap={1} align="start">
                <Row gap={2} align="center">
                  <Text render={<p />} variant="title">
                    Quarterly report
                  </Text>
                  <Pin number={4} />
                </Row>
                <Row gap={2} align="center">
                  <Text emphasis="muted">Updated today by Priya Shah</Text>
                  <Pin number={5} />
                </Row>
              </Column>
              <Surface
                background="muted"
                padding={4}
                radius="sm"
                className="catalogue-role-part"
                render={<Column gap={1} />}
              >
                <Pin number={3} corner="end" />
                <Text render={<p />} variant="title">
                  Budget
                </Text>
                <Text emphasis="muted">Within the plan for this quarter</Text>
              </Surface>
              <Row justify="between" align="center" gap={3}>
                <Row gap={2} align="center">
                  <Badge tone="success">On track</Badge>
                  <Pin number={7} />
                </Row>
                <Row gap={2} align="center">
                  <Pin number={6} />
                  <Button>Share</Button>
                </Row>
              </Row>
            </Surface>
          </Surface>
        </div>
      </Figure>
    </div>
  );
}

/**
 * The color of each role of a family, in the legend's order, and the three colors of each status:
 * its text, its soft fill and its solid fill.
 */
const families: readonly (readonly string[])[] = [
  ['bg-page', 'bg-default', 'bg-muted', 'bg-raised', 'bg-field', 'bg-overlay'],
  ['fg-default', 'fg-muted', 'fg-link', 'fg-on-emphasis', 'fg-on-selected'],
  ['border-default', 'border-muted', 'border-focus'],
  ['bg-brand-emphasis', 'bg-neutral-muted', 'bg-important-strong', 'bg-selected'],
];
const statusColors: readonly (readonly string[])[] = [
  ['fg-muted', 'bg-neutral-muted', 'bg-neutral-emphasis'],
  ['fg-accent', 'bg-accent-badge', 'bg-accent-emphasis'],
  ['fg-success', 'bg-success-muted', 'bg-success-emphasis'],
  ['fg-warning', 'bg-warning-muted', 'bg-warning-emphasis'],
  ['fg-danger', 'bg-danger-muted', 'bg-danger-emphasis'],
  ['fg-done', 'bg-done-muted', 'bg-done-emphasis'],
];

/** The names a legend entry lists, "Page, Surface, Filled surface…", in order. */
const listed = (text: string | undefined) =>
  (text ?? '').replace(/\.$/, '').split(/,\s*/).filter(Boolean);

/** A swatch of one color, or a status's three stacked, each with a hairline edge. */
function Swatch({ colors }: { colors: readonly string[] }) {
  return (
    <span className="catalogue-role-swatch" aria-hidden="true">
      {colors.map((color) => (
        <span key={color} style={{ background: `var(--env-color-${color})` }} />
      ))}
    </span>
  );
}

/**
 * Every role in the reader's theme, on the page: a row of swatches for each family, its name at
 * the start, on one grid of six columns; then the statuses on the same columns, one for each tone,
 * with a row for each of its colors.
 */
function SwatchesFigure({ legend }: FigureWords) {
  const status = legend[families.length];
  const tones = listed(status?.text);
  const parts = listed(legend[families.length + 1]?.text);
  return (
    <div className="catalogue-palette">
      <div className="catalogue-palette-grid">
        {families.map((colors, family) => {
          const entry = legend[family];
          const roles = listed(entry?.text);
          return (
            <section key={family} className="catalogue-palette-family">
              <Text render={<h4 />} variant="title">
                {entry?.name}
              </Text>
              <ul aria-label={entry?.name}>
                {colors.map((color, index) => (
                  <li key={color}>
                    <Swatch colors={[color]} />
                    <Text render={<span />} variant="body-sm">
                      {roles[index]}
                    </Text>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <section className="catalogue-palette-family catalogue-palette-status">
          <div className="catalogue-palette-parts">
            <Text render={<h4 />} variant="title">
              {status?.name}
            </Text>
            {parts.map((part) => (
              <Text key={part} render={<span />} variant="body-sm" emphasis="muted">
                {part}
              </Text>
            ))}
          </div>
          <ul aria-label={status?.name}>
            {statusColors.map((colors, index) => (
              <li key={colors[0]}>
                <Text render={<span />} variant="body-sm">
                  {tones[index]}
                </Text>
                <Swatch colors={colors} />
              </li>
            ))}
          </ul>
        </section>
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
 * eases into each, its page, surface, filled card, text, meter, badge and buttons alike.
 */
function ThemeSteps({ names }: { names: readonly string[] }) {
  const [chosen, setChosen] = useState('0');
  usePointer(themeScript);
  const { theme, contrast } = themes[Number(chosen)]!;
  return (
    <Column gap={5} align="center" className="catalogue-theme-steps">
      <Theme theme={theme} contrast={contrast} className="catalogue-theme-screen">
        <Surface background="page" padding={4} radius="xl">
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
            <Surface background="muted" padding={4} radius="sm">
              <Meter label="Budget" value={34} max={50} valueText="£34,000 of £50,000" />
            </Surface>
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

/**
 * Each tone, in the legend's order, as the components paint it: its soft fill, as a badge's, and
 * its solid fill, from Badge's tones; and Info, which only alerts and toasts take, from the accent
 * tint of an alert and the strong fill of a toast. A word in the tone's text, with an icon, and on
 * its solid fill shows it at work.
 */
const tones: readonly {
  badge?: BadgeTone;
  soft?: CSSProperties;
  solid?: CSSProperties;
  icon: ReactNode;
  word: string;
}[] = [
  { badge: 'neutral', icon: <Archive />, word: 'Archived' },
  { badge: 'accent', icon: <RadioButtonChecked />, word: 'Current' },
  {
    soft: {
      '--env-badge-container': 'var(--env-color-bg-accent-muted)',
      '--env-badge-content': 'var(--env-color-fg-accent)',
    } as CSSProperties,
    solid: {
      '--env-badge-container': 'var(--env-color-bg-info-strong)',
      '--env-badge-content': 'var(--env-color-fg-on-strong)',
    } as CSSProperties,
    icon: <Info />,
    word: 'Tip',
  },
  { badge: 'success', icon: <CheckCircle />, word: 'Ready' },
  { badge: 'warning', icon: <Warning />, word: 'Due soon' },
  { badge: 'danger', icon: <ErrorIcon />, word: 'Failed' },
  { badge: 'done', icon: <TaskAlt />, word: 'Completed' },
];

/**
 * The tones as a list on the page, one row each: the tone's name on its own soft fill, what it
 * means, and the tone at work, a word in its text color and on its solid fill, so the tones compare
 * down the page.
 */
function StatusFigure({ legend }: FigureWords) {
  return (
    <ul className="catalogue-tones" aria-label="Each tone at work">
      {legend.map((entry, index) => {
        const tone = tones[index] ?? tones[0]!;
        return (
          <li key={entry.name}>
            <Badge tone={tone.badge ?? 'accent'} style={tone.soft} className="catalogue-tone-name">
              {entry.name}
            </Badge>
            <Text render={<p />} emphasis="muted" className="catalogue-tone-text">
              {entry.text}
            </Text>
            <span className="catalogue-tone-at-work" data-tone={tone.badge ?? 'info'}>
              <span className="catalogue-tone-word">
                {tone.icon}
                {tone.word}
              </span>
              <Badge tone={tone.badge ?? 'accent'} variant="solid" style={tone.solid}>
                {tone.word}
              </Badge>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A terracotta family of its own, as an application gives an area of its own (customizing.md's
 * GreenArea does the same in green): the roles the card paints, with their hover and press, in
 * each theme. Warm cream surfaces with a deep terracotta action in the light theme; warm charcoal
 * with the same terracotta, a step deeper under the pointer, in the dark. At high contrast its
 * text and edges keep the theme's own, stronger colors.
 */
const clay: Record<ThemeValue, { fills: CSSProperties; lines: CSSProperties }> = {
  light: {
    fills: {
      '--env-color-bg-page': '#fbf8f5',
      '--env-color-bg-default': '#f9f3ed',
      '--env-color-bg-muted': '#f0e5da',
      '--env-color-bg-brand-emphasis': '#9b4526',
      '--env-color-bg-brand-emphasis-hover': '#883c20',
      '--env-color-bg-brand-emphasis-pressed': '#76331b',
      '--env-color-fg-on-emphasis': '#ffffff',
      '--env-color-bg-neutral-muted': 'rgb(155 69 38 / 0.1)',
      '--env-color-bg-neutral-muted-hover': 'rgb(155 69 38 / 0.16)',
      '--env-color-bg-neutral-muted-pressed': 'rgb(155 69 38 / 0.23)',
      '--env-color-bg-neutral-subtle-hover': 'rgb(155 69 38 / 0.07)',
      '--env-color-bg-neutral-subtle-pressed': 'rgb(155 69 38 / 0.12)',
      '--env-color-bg-selected': '#f1d9ca',
      '--env-color-bg-selected-hover': '#ecd0be',
      '--env-color-bg-selected-pressed': '#e6c6b2',
      '--env-color-fg-on-selected': '#6b2d16',
      '--env-color-fg-accent': '#9b4526',
      '--env-color-bg-accent-badge': '#f3dfd2',
      '--env-color-fg-control': '#4a2a1d',
    } as CSSProperties,
    lines: {
      '--env-color-fg-muted': '#6b5a50',
      '--env-color-border-default': '#9a877b',
      '--env-color-border-muted': '#e4d6ca',
    } as CSSProperties,
  },
  dark: {
    fills: {
      '--env-color-bg-page': '#171311',
      '--env-color-bg-default': '#211b18',
      '--env-color-bg-muted': '#2d2521',
      '--env-color-bg-brand-emphasis': '#b4532f',
      '--env-color-bg-brand-emphasis-hover': '#a44a29',
      '--env-color-bg-brand-emphasis-pressed': '#934124',
      '--env-color-fg-on-emphasis': '#ffffff',
      '--env-color-bg-neutral-muted': 'rgb(232 170 140 / 0.12)',
      '--env-color-bg-neutral-muted-hover': 'rgb(232 170 140 / 0.18)',
      '--env-color-bg-neutral-muted-pressed': 'rgb(232 170 140 / 0.25)',
      '--env-color-bg-neutral-subtle-hover': 'rgb(232 170 140 / 0.07)',
      '--env-color-bg-neutral-subtle-pressed': 'rgb(232 170 140 / 0.12)',
      '--env-color-bg-selected': '#4a2e23',
      '--env-color-bg-selected-hover': '#533428',
      '--env-color-bg-selected-pressed': '#5c3a2d',
      '--env-color-fg-on-selected': '#f6d8c8',
      '--env-color-fg-accent': '#e8aa8c',
      '--env-color-bg-accent-badge': '#3e2a22',
      '--env-color-fg-control': '#f1e3db',
    } as CSSProperties,
    lines: {
      '--env-color-fg-muted': '#c0aea4',
      '--env-color-border-default': '#8f7b70',
      '--env-color-border-muted': '#3a302b',
    } as CSSProperties,
  },
};

/** An area in the terracotta family, in a theme, at the reader's contrast. */
function ClayArea({
  theme,
  className,
  children,
}: {
  theme: ThemeValue;
  className?: string;
  children: ReactNode;
}) {
  const { contrast } = useTheme();
  const { fills, lines } = clay[theme];
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
 * The pointer rests on the terracotta action, presses it, then turns the switch off and on again,
 * so the family's own hover, press and switch play; it leaves with the switch on, as it began.
 */
const ownColorsScript: PointerStep[] = [
  { wait: 900 },
  { to: '.catalogue-bakery-book', x: 0.2, y: 0.8 },
  { to: '.catalogue-bakery-book', x: 0.55, y: 0.5, duration: 450 },
  { wait: 1100 },
  { press: true },
  { wait: 260 },
  { release: true },
  { wait: 900 },
  { to: '.catalogue-bakery .env-switch-input', duration: 750 },
  { wait: 500 },
  { click: true },
  { wait: 1500 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 900 },
];

/**
 * A card in a terracotta family of its own, a bread-baking class to book, with its choices in a
 * filled group and its foot, an evening class, in the other theme; the pointer plays its action
 * and its switch.
 */
function BakingClass() {
  const page = useTheme();
  const other: ThemeValue = page.theme === 'dark' ? 'light' : 'dark';
  const [level, setLevel] = useState('first');
  usePointer(ownColorsScript);
  return (
    <ClayArea theme={page.theme} className="catalogue-bakery">
      <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
        <Row gap={3} align="start">
          <span className="catalogue-bakery-mark" aria-hidden="true">
            <BakeryDining width="1.5rem" height="1.5rem" />
          </span>
          <Column gap={1}>
            <Text render={<p />} variant="title">
              Sourdough for beginners
            </Text>
            <Text emphasis="muted">Saturday 10:00 · Mill Lane Bakery</Text>
          </Column>
        </Row>
        <Surface background="muted" padding={4} radius="sm" render={<Column gap={3} />}>
          <Row gap={3} align="center" justify="between" wrap>
            <Text>Level</Text>
            <SegmentedControl
              aria-label="Level"
              size="sm"
              value={level}
              onValueChange={setLevel}
              items={[
                { value: 'first', label: 'First loaf' },
                { value: 'more', label: 'Improver' },
              ]}
            />
          </Row>
          <Switch label="Borrow an apron" defaultChecked />
        </Surface>
        <Row gap={2} align="center" justify="between" wrap>
          <Badge tone="accent">4 seats left</Badge>
          <Row gap={2}>
            <Button variant="secondary">Not now</Button>
            <Button className="catalogue-bakery-book">Book a seat</Button>
          </Row>
        </Row>
        <ClayArea theme={other} className="catalogue-bakery-foot">
          <Surface
            background="default"
            padding={3}
            radius="sm"
            render={<Row gap={3} align="center" justify="between" />}
          >
            <Row gap={2} align="center">
              <Bedtime className="catalogue-bakery-icon" />
              <Text>Pizza night · Thursday 19:00</Text>
            </Row>
            <Button size="sm" className="catalogue-bakery-join">
              Join
            </Button>
          </Surface>
        </ClayArea>
      </Surface>
    </ClayArea>
  );
}

/** A card in a color family of its own, with an area in the other theme, played by the pointer. */
function OwnColorsFigure() {
  return (
    <Figure label="Colors of its own" motion="the card in its own colors">
      <BakingClass />
    </Figure>
  );
}

/** The figures docs/foundations/colors.md places, by name. */
export const colorsFigures: Record<string, FoundationFigure> = {
  Roles: { render: RolesFigure, wide: true },
  Swatches: { render: SwatchesFigure, wide: true },
  Themes: { render: ThemesFigure },
  Status: { render: StatusFigure, wide: true },
  OwnColors: { render: OwnColorsFigure },
};
