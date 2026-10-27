import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Badge,
  Bar,
  Button,
  Checkbox,
  Column,
  Meter,
  Progress,
  Rail,
  Row,
  SearchField,
  SegmentedControl,
  Surface,
  Switch,
  Tabs,
  Text,
  TextField,
  Theme,
  useTheme,
  type BadgeTone,
  type BadgeVariant,
  type Destination,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';
import { ColorSwatch } from '@envsemble/envui/color';
import { Archive } from '@envsemble/envui/icons/Archive';
import { CheckCircle } from '@envsemble/envui/icons/CheckCircle';
import { Error as ErrorIcon } from '@envsemble/envui/icons/Error';
import { Group } from '@envsemble/envui/icons/Group';
import { Info } from '@envsemble/envui/icons/Info';
import { Luggage } from '@envsemble/envui/icons/Luggage';
import { Map as MapIcon } from '@envsemble/envui/icons/Map';
import { RadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';
import { Warning } from '@envsemble/envui/icons/Warning';
import { useTimeline } from '../Motion';
import type { FoundationFigure } from './FoundationFigures';
import { MarkedSubject } from './Marks';
import { CornerLabel } from './Steps';
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
 * supporting text and the accent.
 */
const roleColors: readonly string[] = [
  'bg-page',
  'bg-default',
  'bg-muted',
  'fg-default',
  'fg-muted',
  'bg-brand-emphasis',
];

/**
 * The colors of envUI color tokens, such as `bg-page`, in the reader's theme and contrast, as CSS
 * colors a ColorSwatch takes, such as rgb(250, 249, 247): ColorSwatch takes a color, not a custom
 * property, so a hidden probe in the figure's theme takes each token as its color, and a pixel
 * painted in that color gives it in sRGB, whatever the token's color space. Measured again when
 * the theme or contrast changes, before the figure is painted; none until the probe is placed.
 */
function useTokenColors(tokens: readonly string[]) {
  const probe = useRef<HTMLSpanElement>(null);
  const { theme, contrast } = useTheme();
  const high = useHighContrast(contrast);
  const [colors, setColors] = useState<readonly string[]>([]);
  useLayoutEffect(() => {
    const element = probe.current;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const pixel = canvas.getContext('2d', { willReadFrequently: true });
    if (!element || !pixel) return;
    setColors(
      tokens.map((token) => {
        element.style.color = `var(--env-color-${token})`;
        pixel.clearRect(0, 0, 1, 1);
        pixel.fillStyle = getComputedStyle(element).color;
        pixel.fillRect(0, 0, 1, 1);
        const [red = 0, green = 0, blue = 0, alpha = 255] = pixel.getImageData(0, 0, 1, 1).data;
        return `rgba(${red}, ${green}, ${blue}, ${Math.round((alpha / 255) * 100) / 100})`;
      }),
    );
  }, [tokens, theme, contrast, high]);
  const element = <span ref={probe} hidden style={{ transition: 'none' }} />;
  return [element, colors] as const;
}

/**
 * A swatch of a color beside its name, the name saying what it is: decorative, so a screen reader
 * reads the name alone. Nothing until its color is measured.
 */
function Swatch({ color }: { color: string | undefined }) {
  return color ? <ColorSwatch color={color} aria-hidden="true" /> : null;
}

/**
 * A small screen with a callout on each part that takes a role: the page, a surface on it, a
 * filled card inside, text, supporting text and the accent. Each callout ends in a swatch of the
 * role's color in the reader's theme and the role's name, in one column at the screen's end, so a
 * part, its color and its name read as one, with no legend below.
 */
function RolesFigure({ legend }: FigureWords) {
  const [probe, colors] = useTokenColors(roleColors);
  const [frame, narrow] = useNarrow(rolesWidth);
  // On a phone the screen takes less padding and the names may wrap, so both fit side by side.
  const room = narrow
    ? ({ page: 3, surface: 4, card: 3 } as const)
    : ({ page: 5, surface: 5, card: 4 } as const);
  return (
    <Figure
      label="The color roles of a screen"
      className="catalogue-marked-stage catalogue-roles-stage"
    >
      {probe}
      <div ref={frame} className="catalogue-roles-frame" data-narrow={narrow || undefined}>
        <MarkedSubject
          named={legend.map((entry, index) => (
            <span key={entry.name} className="catalogue-role-name">
              <Swatch color={colors[index]} />
              <Text render={<span />} variant="body-sm">
                {entry.name}
              </Text>
            </span>
          ))}
        >
          <Surface
            background="page"
            padding={room.page}
            radius="xl"
            data-catalogue-mark="1"
            className="catalogue-roles"
          >
            <Surface
              background="default"
              padding={room.surface}
              radius="xl"
              data-catalogue-mark="2"
              render={<Column gap={5} />}
            >
              <Text render={<p />} variant="title" data-catalogue-mark="4">
                Quarterly report
              </Text>
              <Surface
                background="muted"
                padding={room.card}
                radius="sm"
                data-catalogue-mark="3"
                render={<Column gap={1} />}
              >
                <Text render={<p />} variant="title">
                  £34,000
                </Text>
                <Text emphasis="muted" data-catalogue-mark="5">
                  Spent of £50,000
                </Text>
              </Surface>
              <Row justify="end">
                <Button data-catalogue-mark="6">Share</Button>
              </Row>
            </Surface>
          </Surface>
        </MarkedSubject>
      </div>
    </Figure>
  );
}

/** The narrowest the roles figure keeps its screen's full padding and its names on one line, in rem. */
const rolesWidth = 26;

/**
 * The colors of each role, in four groups, seven surfaces and six of each other kind, in the
 * legend's order: each group is a legend entry, its name the group's and its text the names of its
 * roles, separated by commas. A status shows its three colors in one swatch: its text, its soft fill
 * and its solid fill.
 */
const roleGroups: readonly (readonly (readonly string[])[])[] = [
  [
    ['bg-page'],
    ['bg-recessed'],
    ['bg-default'],
    ['bg-muted'],
    ['bg-raised'],
    ['bg-field'],
    ['bg-overlay'],
  ],
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
                    <span
                      className="catalogue-role-swatch"
                      aria-hidden="true"
                      style={
                        {
                          '--catalogue-card-fill': `var(--env-color-${colors.at(-1)})`,
                        } as CSSProperties
                      }
                    >
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

/**
 * Whether the figure is narrower than a width in rem, by the width of its element: measured before
 * the figure is first painted, so it never shows its wide layout on a phone for a moment, which
 * its stage would keep the height of.
 */
function useNarrow(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = (inline: number) => {
      const rem = parseFloat(getComputedStyle(element).fontSize) || 16;
      setNarrow(inline < width * rem);
    };
    measure(element.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => measure(entry?.contentRect.width ?? 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);
  return [ref, narrow] as const;
}

/** How long the screen stays in each theme, in ms. */
const themeStep = 2000;

/**
 * One screen in each theme in turn, in the legend's order, each theme beside its high contrast,
 * named in the corner: the screen cuts to each, its page, surface, filled card, text, meter, badge
 * and buttons at once.
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
 * Each tone as a badge paints it, with a word in the tone and its icon:
 * Badge's tones, and Info, which only alerts and toasts take, in their colors: the accent tint of
 * an alert, soft; the strong fill of a toast, solid; the accent's edge, outlined.
 */
const tones: readonly {
  badge?: BadgeTone;
  own?: Record<BadgeVariant, CSSProperties>;
  icon: ReactNode;
  word: string;
}[] = [
  { badge: 'neutral', icon: <Archive />, word: 'Archived' },
  { badge: 'accent', icon: <RadioButtonChecked />, word: 'Current' },
  {
    own: {
      soft: {
        '--env-badge-container': 'var(--env-color-bg-accent-muted)',
        '--env-badge-content': 'var(--env-color-fg-accent)',
      } as CSSProperties,
      solid: {
        '--env-badge-container': 'var(--env-color-bg-info-strong)',
        '--env-badge-content': 'var(--env-color-fg-on-strong)',
      } as CSSProperties,
      outline: {
        '--env-badge-content': 'var(--env-color-fg-accent)',
        '--env-badge-outline': 'var(--env-color-border-accent)',
      } as CSSProperties,
    },
    icon: <Info />,
    word: 'Tip',
  },
  { badge: 'success', icon: <CheckCircle />, word: 'Ready' },
  { badge: 'warning', icon: <Warning />, word: 'Due soon' },
  { badge: 'danger', icon: <ErrorIcon />, word: 'Failed' },
  { badge: 'done', icon: <TaskAlt />, word: 'Completed' },
];

/** Badge's variants, each with its name in the corner, in the order the figure shows them. */
const badgeVariants: readonly { variant: BadgeVariant; name: string }[] = [
  { variant: 'soft', name: 'Soft' },
  { variant: 'solid', name: 'Solid' },
  { variant: 'outline', name: 'Outline' },
];

/** How long the badges stay in each variant, in ms. */
const variantStep = 2000;

/**
 * Every tone's badge side by side, all in one variant at a time: soft,
 * solid, then outlined, the variant named in the corner. The badges cut from one to the next
 * together, at one size, so nothing moves.
 */
function StatusSteps() {
  const step = useTimeline(badgeVariants.map(() => variantStep));
  const { variant, name } = badgeVariants[step] ?? badgeVariants[0]!;
  return (
    <>
      <CornerLabel>{name}</CornerLabel>
      <div className="catalogue-tone-badges">
        {tones.map((tone, index) => (
          <Fragment key={tone.word}>
            {index === 4 && <span className="catalogue-tone-break" />}
            <Badge
              tone={tone.badge ?? 'accent'}
              variant={variant}
              icon={tone.icon}
              style={tone.own?.[variant]}
            >
              {tone.word}
            </Badge>
          </Fragment>
        ))}
      </div>
    </>
  );
}

/**
 * Every tone's badge in each of Badge's variants in turn, on an animated figure: the badges' words
 * and icons say what each tone is for, so it has no legend; the tones' meanings are in Compose.
 */
function StatusFigure() {
  return (
    <Figure label="What each color means" motion="the badges in each variant">
      <StatusSteps />
    </Figure>
  );
}

/**
 * A pastel color scheme of an application's own: the hue, in OKLCH, that tints its surfaces, text
 * and edges and colors its accent, in the legend's order. Each takes the same grades in each theme,
 * so the three are one family of schemes.
 */
const schemes: readonly { hue: number }[] = [{ hue: 300 }, { hue: 165 }, { hue: 48 }];

/** A color in OKLCH: its lightness, chroma and hue, and its opacity if it has one. */
const oklch = (lightness: number, chroma: number, hue: number, alpha?: number) =>
  `oklch(${lightness} ${chroma} ${hue}${alpha === undefined ? '' : ` / ${alpha}`})`;

/**
 * The roles a scheme gives its area, with their hover and press, as an application gives an area
 * colors of its own (customizing.md's Recolor an area). It keeps envUI's own grades and only moves
 * them to its hue: a pale tinted page and surfaces with a deep accent in the light theme, deep
 * tinted ones with a pale accent in the dark; a tint of the accent for what is selected, with
 * accent text on it; translucent tinted fills for quiet controls. At high contrast the accent goes
 * a step further from the page, and text and edges keep the theme's own, stronger colors.
 */
function schemeColors({ hue }: (typeof schemes)[number], theme: ThemeValue, high: boolean) {
  const light = theme === 'light';
  const step = (lightness: number, by: number) => lightness + (light ? -by : by);
  // A fill's hover and press: a step further from the page, or, for the accent, deeper in both
  // themes, as envUI's own accent fills.
  const tone = (role: string, lightness: number, chroma: number, deeper = false) => {
    const at = (by: number) => (deeper ? lightness - by : step(lightness, by));
    return {
      [`--env-color-${role}`]: oklch(lightness, chroma, hue),
      [`--env-color-${role}-hover`]: oklch(at(0.035), chroma, hue),
      [`--env-color-${role}-pressed`]: oklch(at(0.07), chroma, hue),
    };
  };
  // The accent: a deep color on light surfaces, a pale one on dark.
  const accent = light ? (high ? 0.36 : 0.43) : high ? 0.9 : 0.84;
  const chroma = light ? 0.11 : high ? 0.06 : 0.08;
  // The ink a translucent fill is mixed from: dark on light surfaces, pale on dark.
  const ink = (alpha: number) =>
    light ? oklch(0.25, 0.04, hue, alpha) : oklch(0.94, 0.02, hue, alpha);
  const fills = {
    ...(light
      ? {
          '--env-color-bg-page': oklch(0.99, 0.008, hue),
          '--env-color-bg-default': oklch(0.955, 0.024, hue),
          '--env-color-bg-raised': oklch(0.955, 0.024, hue),
          '--env-color-bg-muted': oklch(0.92, 0.032, hue),
          '--env-color-fg-on-emphasis': oklch(1, 0, 0),
          ...tone('bg-selected', 0.9, 0.05),
          '--env-color-bg-navigation-hover': oklch(0.9, 0.04, hue),
          '--env-color-bg-navigation-pressed': oklch(0.87, 0.05, hue),
        }
      : {
          '--env-color-bg-page': oklch(0.19, 0.016, hue),
          '--env-color-bg-default': oklch(0.235, 0.022, hue),
          '--env-color-bg-raised': oklch(0.235, 0.022, hue),
          '--env-color-bg-muted': oklch(0.275, 0.026, hue),
          '--env-color-fg-on-emphasis': oklch(0.2, 0.04, hue),
          ...tone('bg-selected', 0.34, 0.06),
          '--env-color-bg-navigation-hover': oklch(0.32, 0.03, hue),
          '--env-color-bg-navigation-pressed': oklch(0.36, 0.035, hue),
        }),
    ...tone('bg-brand-emphasis', accent, chroma, true),
    ...tone('border-accent-emphasis', accent, chroma, true),
    '--env-color-bg-accent-emphasis': oklch(accent, chroma, hue),
    '--env-color-fg-accent': oklch(accent, chroma, hue),
    '--env-color-fg-on-selected': oklch(step(accent, high ? 0.05 : 0.03), chroma, hue),
    '--env-color-border-focus': oklch(accent, chroma, hue),
    '--env-color-border-accent': oklch(accent, chroma, hue, 0.55),
    '--env-color-bg-accent-muted': oklch(accent, chroma, hue, light ? 0.12 : 0.14),
    '--env-color-bg-accent-badge': oklch(accent, chroma, hue, light ? 0.08 : 0.14),
    '--env-color-bg-neutral-muted': ink(light ? 0.08 : 0.12),
    '--env-color-bg-neutral-muted-hover': ink(light ? 0.14 : 0.19),
    '--env-color-bg-neutral-muted-pressed': ink(light ? 0.2 : 0.26),
    '--env-color-bg-neutral-subtle-hover': ink(0.08),
    '--env-color-bg-neutral-subtle-pressed': ink(0.1),
  };
  const lines = light
    ? {
        '--env-color-fg-default': oklch(0.24, 0.035, hue),
        '--env-color-fg-control': oklch(0.3, 0.045, hue),
        '--env-color-fg-muted': oklch(0.42, 0.04, hue),
        '--env-color-border-default': oklch(0.58, 0.04, hue),
        '--env-color-border-muted': oklch(0.86, 0.03, hue),
      }
    : {
        '--env-color-fg-default': oklch(0.94, 0.012, hue),
        '--env-color-fg-control': oklch(0.92, 0.016, hue),
        '--env-color-fg-muted': oklch(0.8, 0.025, hue),
        '--env-color-border-default': oklch(0.62, 0.035, hue),
        '--env-color-border-muted': oklch(0.4, 0.03, hue),
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
const schemeStep = 2200;

/** A tile of the canvas: a component or two on a surface, as envUI draws it. */
function Tile({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Surface padding={4} className="catalogue-scheme-tile" data-tile={name}>
      {children}
    </Surface>
  );
}

/**
 * The same components in a scheme of the application's own, filling the stage: a trip planner's
 * page with surfaces for its tiles, each a component or two in its usual variant: a short form, tabs,
 * a switch, a choice of answers, uploads under way, a search, and the navigation with a count. It
 * steps through the schemes, the one shown named in the corner.
 */
function SchemeChoice({ names, narrow }: { names: readonly string[]; narrow: boolean }) {
  const page = useTheme();
  const scheme = useTimeline(schemes.map(() => schemeStep));
  const [answer, setAnswer] = useState('going');
  const [place, setPlace] = useState('trips');
  const destination = (id: string) => ({ current: place === id, onSelect: () => setPlace(id) });
  const destinations: Destination[] = [
    { label: 'Trips', icon: <Luggage />, ...destination('trips') },
    { label: 'Map', icon: <MapIcon />, ...destination('map') },
    { label: 'Friends', icon: <Group />, count: 2, ...destination('friends') },
  ];
  return (
    <SchemeArea scheme={scheme} theme={page.theme} className="catalogue-scheme-canvas">
      <CornerLabel>{names[scheme]}</CornerLabel>
      <div className="catalogue-scheme-tiles" data-narrow={narrow || undefined}>
        <Tile name="form">
          <Column gap={4}>
            <TextField variant="floating" label="Trip name" defaultValue="Spring in Lisbon" />
            <Column gap={2}>
              <Checkbox label="Share with travelers" defaultChecked />
              <Checkbox label="Save maps offline" />
            </Column>
            <Row gap={2} justify="end">
              <Button variant="secondary">Cancel</Button>
              <Button>Save</Button>
            </Row>
          </Column>
        </Tile>
        <Tile name="tabs">
          <Tabs
            aria-label="Trip"
            defaultValue="photos"
            items={[
              { value: 'days', button: <Button>Days</Button>, content: null },
              { value: 'photos', button: <Button>Photos</Button>, content: null },
              { value: 'budget', button: <Button>Budget</Button>, content: null },
            ]}
          />
        </Tile>
        <Tile name="switch">
          <Switch label="Sync" defaultChecked />
        </Tile>
        <Tile name="choice">
          <SegmentedControl
            aria-label="Going on the trip"
            value={answer}
            onValueChange={setAnswer}
            items={[
              { value: 'going', label: 'Yes' },
              { value: 'maybe', label: 'Maybe' },
              { value: 'no', label: 'No' },
            ]}
          />
        </Tile>
        <Tile name="progress">
          <Column gap={3}>
            <Progress label="Lisbon" value={18} max={24} valueText="18 of 24" />
            <Progress label="Porto" value={6} max={20} valueText="6 of 20" />
          </Column>
        </Tile>
        {/* A phone leaves the search out, as it shows the navigation as a bar. */}
        {!narrow && (
          <Tile name="search">
            <SearchField variant="floating" label="Search photos" placeholder="Search" />
          </Tile>
        )}
        <Tile name="nav">
          {narrow ? (
            <Bar aria-label="Trip" destinations={destinations} />
          ) : (
            <Rail aria-label="Trip" destinations={destinations} />
          )}
        </Tile>
      </div>
    </SchemeArea>
  );
}

/** The same components in each of a few pastel schemes of an application's own, chosen in turn. */
function OwnColorsFigure({ legend }: FigureWords) {
  return (
    <Figure
      label="Your own colors"
      motion="the components in each color scheme"
      className="catalogue-scheme-stage"
    >
      <SchemeSteps names={legend.map((entry) => entry.name)} />
    </Figure>
  );
}

/** The narrowest the figure shows its tiles three across in, in rem. */
const schemesWidth = 38;

/**
 * The canvas at the figure's width: on a narrower one, as on a phone, the tiles one under another,
 * the quiet actions in a row, and the navigation a bar, as an application shows it there.
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
  Status: { render: StatusFigure, wide: true },
  OwnColors: { render: OwnColorsFigure, wide: true },
};
