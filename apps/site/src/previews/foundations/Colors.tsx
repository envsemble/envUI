import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Badge,
  Bar,
  Button,
  Column,
  IconButton,
  Meter,
  Progress,
  Rail,
  Row,
  SegmentedControl,
  Surface,
  Text,
  Theme,
  Toolbar,
  useTheme,
  type BadgeTone,
  type Destination,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { AddAPhoto } from '@envsemble/envui/icons/AddAPhoto';
import { AddPhotoAlternate } from '@envsemble/envui/icons/AddPhotoAlternate';
import { Archive } from '@envsemble/envui/icons/Archive';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Crop } from '@envsemble/envui/icons/Crop';
import { Done } from '@envsemble/envui/icons/Done';
import { Error as ErrorIcon } from '@envsemble/envui/icons/Error';
import { Favorite } from '@envsemble/envui/icons/Favorite';
import { Group } from '@envsemble/envui/icons/Group';
import { Info } from '@envsemble/envui/icons/Info';
import { PhotoAlbum } from '@envsemble/envui/icons/PhotoAlbum';
import { PhotoLibrary } from '@envsemble/envui/icons/PhotoLibrary';
import { RadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { RotateRight } from '@envsemble/envui/icons/RotateRight';
import { Search } from '@envsemble/envui/icons/Search';
import { Share } from '@envsemble/envui/icons/Share';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { Tune } from '@envsemble/envui/icons/Tune';
import { Warning } from '@envsemble/envui/icons/Warning';
import { useTimeline } from '../Motion';
import type { FoundationFigure } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import { CornerLabel, StepStack } from './Steps';
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

/**
 * The color of each role, in the legend's order: the page, a surface, a filled card, text,
 * supporting text, the accent and a status's soft fill.
 */
const roleColors: readonly string[] = [
  'bg-page',
  'bg-default',
  'bg-muted',
  'fg-default',
  'fg-muted',
  'bg-brand-emphasis',
  'bg-success-muted',
];

/**
 * A small screen with a numbered callout on each part that takes a role, as an anatomy figure's
 * are: the page, a surface on it, a filled card inside, text, supporting text, the accent and a
 * status. Its legend is an anatomy figure's, each number's tag carrying a dot of the role's color
 * in the reader's theme.
 */
function RolesFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="The color roles of a screen"
      className="catalogue-marked-stage catalogue-roles-stage"
      legend={
        <ol className="site-anatomy-legend catalogue-topic-legend">
          {legend.map((entry, index) => (
            <li key={entry.name}>
              <span className="site-anatomy-number catalogue-role-tag" aria-hidden="true">
                {index + 1}
                <span
                  className="catalogue-role-dot"
                  style={{ background: `var(--env-color-${roleColors[index] ?? 'bg-page'})` }}
                />
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
          ))}
        </ol>
      }
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
              <Text render={<p />} variant="title" data-catalogue-mark="4">
                Quarterly report
              </Text>
              <Text emphasis="muted" data-catalogue-mark="5">
                Updated today by Priya Shah
              </Text>
            </Column>
            <Surface
              background="muted"
              padding={4}
              radius="sm"
              data-catalogue-mark="3"
              render={<Column gap={1} />}
            >
              <Text render={<p />} variant="title">
                Budget
              </Text>
              <Text emphasis="muted">Within the plan for this quarter</Text>
            </Surface>
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
  { theme: 'light', contrast: 'high' },
  { theme: 'dark', contrast: 'standard' },
  { theme: 'dark', contrast: 'high' },
];

/** Whether the figure is narrower than a width in rem, by the width of its element. */
function useNarrow(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const rem = parseFloat(getComputedStyle(element).fontSize) || 16;
      setNarrow((entry?.contentRect.width ?? 0) < width * rem);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);
  return [ref, narrow] as const;
}

/** How long the screen stays in each theme, in ms. */
const themeStep = 2200;

/**
 * One screen in each theme in turn, in the legend's order, each theme beside its high contrast,
 * named in the corner: the screen eases into each, its page, surface, filled card, text, meter,
 * badge and buttons alike.
 */
function ThemeSteps({ names }: { names: readonly string[] }) {
  const step = useTimeline(themes.map(() => themeStep));
  const { theme, contrast } = themes[step] ?? themes[0]!;
  return (
    <>
      <CornerLabel>{names[step]}</CornerLabel>
      <Theme theme={theme} contrast={contrast} className="catalogue-theme-screen">
        <Surface background="page" padding={4} radius="xl">
          <Surface background="default" padding={5} radius="xl" render={<Column gap={4} />}>
            <Row wrap justify="between" align="start" gap={3}>
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
    </>
  );
}

/** One screen stepping through each theme and contrast, the one shown named in the corner. */
function ThemesFigure({ legend }: FigureWords) {
  return (
    <Figure label="One screen in each theme" motion="the screen in each theme">
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

/** How long the card stays in each tone, in ms. */
const toneStep = 1800;

/**
 * One card in each tone in turn, in the legend's order, the tone named in the corner: a word in
 * the tone's text color with its icon, what the tone means, and the tone's soft and solid badges.
 * The cards are stacked in one place, so the figure keeps the height of the tallest.
 */
function StatusSteps({ legend }: FigureWords) {
  const step = useTimeline(legend.map(() => toneStep));
  return (
    <>
      <CornerLabel>{legend[step]?.name}</CornerLabel>
      <StepStack
        className="catalogue-tone-steps"
        count={legend.length}
        at={step}
        render={(index) => {
          const tone = tones[index] ?? tones[0]!;
          return (
            <Surface
              background="default"
              padding={6}
              radius="xl"
              className="catalogue-tone-card"
              data-tone={tone.badge ?? 'info'}
              render={<Column gap={4} />}
            >
              <Column gap={2}>
                <span className="catalogue-tone-word">
                  {tone.icon}
                  {tone.word}
                </span>
                <Text render={<p />} emphasis="muted">
                  {legend[index]?.text}
                </Text>
              </Column>
              <Row gap={3} wrap>
                <Badge tone={tone.badge ?? 'accent'} style={tone.soft}>
                  {tone.word}
                </Badge>
                <Badge tone={tone.badge ?? 'accent'} variant="solid" style={tone.solid}>
                  {tone.word}
                </Badge>
              </Row>
            </Surface>
          );
        }}
      />
    </>
  );
}

/** The card in each tone, on an animated figure. */
function StatusFigure({ legend }: FigureWords) {
  return (
    <Figure label="What each color means" motion="the card in each tone">
      <StatusSteps legend={legend} />
    </Figure>
  );
}

/**
 * A pastel color scheme of an application's own: the hue of its surfaces and main actions, and the
 * hue of its second accent, the Important fill, in OKLCH, in the legend's order. Each takes the
 * same grades in each theme, so the three are one family of schemes.
 */
const schemes: readonly { hue: number; accent: number }[] = [
  { hue: 300, accent: 350 },
  { hue: 165, accent: 215 },
  { hue: 48, accent: 10 },
];

/** A color in OKLCH: its lightness, chroma and hue. */
const oklch = (lightness: number, chroma: number, hue: number) =>
  `oklch(${lightness} ${chroma} ${hue})`;

/**
 * The roles a scheme gives its area, with their hover and press, as an application gives an area
 * colors of its own (customizing.md's Recolor an area): pale tinted surfaces, mid-tone quiet
 * actions and selection, and a deep main action in the light theme; deep tinted surfaces and pale
 * actions in the dark. Its text and edges are tinted too, except at high contrast, where they keep
 * the theme's own, stronger colors.
 */
function schemeColors(
  { hue, accent }: (typeof schemes)[number],
  theme: ThemeValue,
  high: boolean,
): CSSProperties {
  const light = theme === 'light';
  const step = (lightness: number, by: number) => lightness + (light ? -by : by);
  const tone = (role: string, lightness: number, chroma: number, at = hue) => ({
    [`--env-color-${role}`]: oklch(lightness, chroma, at),
    [`--env-color-${role}-hover`]: oklch(step(lightness, 0.035), chroma, at),
    [`--env-color-${role}-pressed`]: oklch(step(lightness, 0.07), chroma, at),
  });
  const fills = light
    ? {
        '--env-color-bg-page': oklch(0.985, 0.012, hue),
        '--env-color-bg-default': oklch(0.995, 0.006, hue),
        '--env-color-bg-raised': oklch(0.995, 0.006, hue),
        '--env-color-bg-muted': oklch(0.935, 0.034, hue),
        ...tone('bg-brand-emphasis', 0.43, 0.11),
        '--env-color-fg-on-emphasis': oklch(1, 0, 0),
        ...tone('bg-important-strong', 0.86, 0.08, accent),
        '--env-color-fg-on-strong': oklch(0.27, 0.07, accent),
        ...tone('bg-neutral-muted', 0.88, 0.055),
        '--env-color-bg-neutral-subtle-hover': oklch(0.89, 0.04, hue),
        '--env-color-bg-neutral-subtle-pressed': oklch(0.86, 0.05, hue),
        ...tone('bg-selected', 0.83, 0.075),
        '--env-color-fg-on-selected': oklch(0.25, 0.07, hue),
        '--env-color-bg-navigation-hover': oklch(0.9, 0.04, hue),
        '--env-color-bg-navigation-pressed': oklch(0.87, 0.05, hue),
        '--env-color-fg-accent': oklch(0.43, 0.11, hue),
        '--env-color-border-focus': oklch(0.43, 0.11, hue),
      }
    : {
        '--env-color-bg-page': oklch(0.19, 0.018, hue),
        '--env-color-bg-default': oklch(0.23, 0.024, hue),
        '--env-color-bg-raised': oklch(0.25, 0.026, hue),
        '--env-color-bg-muted': oklch(0.26, 0.032, hue),
        ...tone('bg-brand-emphasis', 0.84, 0.08),
        '--env-color-fg-on-emphasis': oklch(0.22, 0.05, hue),
        ...tone('bg-important-strong', 0.84, 0.08, accent),
        '--env-color-fg-on-strong': oklch(0.22, 0.05, accent),
        ...tone('bg-neutral-muted', 0.35, 0.05),
        '--env-color-bg-neutral-subtle-hover': oklch(0.33, 0.04, hue),
        '--env-color-bg-neutral-subtle-pressed': oklch(0.37, 0.045, hue),
        ...tone('bg-selected', 0.42, 0.075),
        '--env-color-fg-on-selected': oklch(0.95, 0.025, hue),
        '--env-color-bg-navigation-hover': oklch(0.31, 0.035, hue),
        '--env-color-bg-navigation-pressed': oklch(0.35, 0.04, hue),
        '--env-color-fg-accent': oklch(0.84, 0.08, hue),
        '--env-color-border-focus': oklch(0.84, 0.08, hue),
      };
  const lines = light
    ? {
        '--env-color-fg-default': oklch(0.24, 0.035, hue),
        '--env-color-fg-control': oklch(0.27, 0.045, hue),
        '--env-color-fg-muted': oklch(0.4, 0.04, hue),
        '--env-color-border-default': oklch(0.55, 0.045, hue),
        '--env-color-border-muted': oklch(0.86, 0.03, hue),
      }
    : {
        '--env-color-fg-default': oklch(0.95, 0.012, hue),
        '--env-color-fg-control': oklch(0.92, 0.02, hue),
        '--env-color-fg-muted': oklch(0.8, 0.03, hue),
        '--env-color-border-default': oklch(0.62, 0.04, hue),
        '--env-color-border-muted': oklch(0.34, 0.03, hue),
      };
  return (high ? fills : { ...fills, ...lines }) as CSSProperties;
}

/**
 * Whether a Theme of this contrast shows the high-contrast colors: `high`, or `system` while the
 * system asks for more contrast, followed as it changes.
 */
function useHighContrast(contrast: ThemeContrast) {
  const [system, setSystem] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-contrast: more)');
    const change = () => setSystem(query.matches);
    change();
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return contrast === 'high' || (contrast === 'system' && system);
}

/** An area in a scheme, in a theme, at the reader's contrast. */
function SchemeArea({
  scheme,
  theme,
  className,
  children,
}: {
  scheme: number;
  theme: ThemeValue;
  className?: string;
  children: ReactNode;
}) {
  const { contrast } = useTheme();
  const high = useHighContrast(contrast);
  return (
    <Theme
      theme={theme}
      contrast={contrast}
      className={className}
      style={schemeColors(schemes[scheme] ?? schemes[0]!, theme, high)}
    >
      {children}
    </Theme>
  );
}

/** How long the components stay in each scheme, in ms. */
const schemeStep = 1700;

/**
 * The same components in a scheme of the application's own, each on a tile of the scheme's filled
 * surface, as one canvas: a column of quiet actions above the main one, a photo's toolbar beside
 * its save action, a choice of view, two uploads and, in the other theme, the navigation. It
 * steps through the schemes, the one shown named in the corner.
 */
function SchemeChoice({ names, narrow }: { names: readonly string[]; narrow: boolean }) {
  const page = useTheme();
  const other: ThemeValue = page.theme === 'dark' ? 'light' : 'dark';
  const scheme = useTimeline(schemes.map(() => schemeStep));
  const [period, setPeriod] = useState('month');
  const [place, setPlace] = useState('photos');
  const destination = (id: string) => ({ current: place === id, onSelect: () => setPlace(id) });
  const destinations: Destination[] = [
    { label: 'Photos', icon: <PhotoLibrary />, ...destination('photos') },
    { label: 'Albums', icon: <PhotoAlbum />, ...destination('albums') },
    { label: 'Shared', icon: <Group />, ...destination('shared') },
  ];
  const actions = [
    <Button key="select" variant="secondary" startIcon={<CheckCircle />}>
      Select
    </Button>,
    <Button key="add" variant="secondary" startIcon={<AddPhotoAlternate />}>
      Add photos
    </Button>,
    <Button key="share" variant="secondary" startIcon={<Share />}>
      Share
    </Button>,
    <Button key="search" variant="secondary" startIcon={<Search />}>
      Search
    </Button>,
    <IconButton key="new" variant="primary" size="lg" icon={<Add />} aria-label="New album" />,
  ];
  return (
    <>
      <CornerLabel>{names[scheme]}</CornerLabel>
      <SchemeArea scheme={scheme} theme={page.theme} className="catalogue-scheme-canvas">
        <div className="catalogue-scheme-tiles" data-narrow={narrow || undefined}>
          <Surface
            background="muted"
            radius="xl"
            className="catalogue-scheme-tile"
            data-tile="menu"
          >
            {narrow ? (
              <Row wrap gap={2} align="center" justify="center">
                {actions}
              </Row>
            ) : (
              <Column gap={2} align="end">
                {actions}
              </Column>
            )}
          </Surface>
          <Surface
            background="muted"
            radius="xl"
            className="catalogue-scheme-tile"
            data-tile="toolbar"
          >
            <Row gap={2} align="center" justify="center">
              <Surface
                background="default"
                padding={1}
                radius="full"
                render={<Toolbar.Root aria-label="Edit photo" size="sm" />}
              >
                <Toolbar.Button icon={<Crop />} label="Crop" />
                <Toolbar.Button icon={<Tune />} label="Adjust" />
                <Toolbar.Button icon={<RotateRight />} label="Rotate" />
                <Toolbar.Button icon={<Favorite />} label="Favorite" pressed />
              </Surface>
              <IconButton variant="primary" tone="accent" icon={<Done />} aria-label="Save" />
            </Row>
          </Surface>
          <Surface
            background="muted"
            radius="xl"
            className="catalogue-scheme-tile"
            data-tile="choice"
          >
            <SegmentedControl
              aria-label="Group photos by"
              size="sm"
              value={period}
              onValueChange={setPeriod}
              items={[
                { value: 'day', label: 'Day' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
            />
          </Surface>
          <Surface
            background="muted"
            radius="xl"
            className="catalogue-scheme-tile"
            data-tile="progress"
            render={<Column gap={3} />}
          >
            <Progress label="Lisbon" value={18} max={24} valueText="18 of 24" />
            <Progress label="Porto" value={6} max={20} valueText="6 of 20" />
          </Surface>
          <SchemeArea
            scheme={scheme}
            theme={other}
            className="catalogue-scheme-tile catalogue-scheme-other"
          >
            {narrow ? (
              <Bar aria-label="Photos" background="page" destinations={destinations} />
            ) : (
              <Rail
                aria-label="Photos"
                background="page"
                header={
                  <IconButton
                    variant="primary"
                    tone="accent"
                    icon={<AddAPhoto />}
                    aria-label="Take a photo"
                  />
                }
                destinations={destinations}
              />
            )}
          </SchemeArea>
        </div>
      </SchemeArea>
    </>
  );
}

/** The same components in each of a few pastel schemes of an application's own, chosen in turn. */
function OwnColorsFigure({ legend }: FigureWords) {
  return (
    <Figure label="Your own colors" motion="the components in each color scheme">
      <SchemeSteps names={legend.map((entry) => entry.name)} />
    </Figure>
  );
}

/** The narrowest the figure shows the canvas three across in, in rem. */
const schemesWidth = 30;

/**
 * The canvas at the figure's width: on a narrower one, as on a phone, the quiet actions wrap in a
 * row, and the navigation is a bar, as an application shows it there.
 */
function SchemeSteps({ names }: { names: readonly string[] }) {
  const [ref, narrow] = useNarrow(schemesWidth);
  return (
    <div ref={ref} className="catalogue-scheme-steps">
      <SchemeChoice key={narrow ? 'narrow' : 'wide'} names={names} narrow={narrow} />
    </div>
  );
}

/** The figures docs/foundations/colors.md places, by name. */
export const colorsFigures: Record<string, FoundationFigure> = {
  Roles: { render: RolesFigure, wide: true },
  Swatches: { render: SwatchesFigure, wide: true },
  Themes: { render: ThemesFigure },
  Status: { render: StatusFigure },
  OwnColors: { render: OwnColorsFigure, wide: true },
};
