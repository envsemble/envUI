import { useState, type CSSProperties, type ReactNode } from 'react';
import {
  NavigationBar,
  Button,
  Checkbox,
  Column,
  Progress,
  NavigationRail,
  Row,
  SearchField,
  SegmentedControl,
  Surface,
  Switch,
  Tabs,
  TextField,
  Theme,
  useTheme,
  type Destination,
  type ColorScheme,
} from '@envsemble/envui';
import { IconGroup } from '@envsemble/envui/icons/Group';
import { IconLuggage } from '@envsemble/envui/icons/Luggage';
import { IconMap } from '@envsemble/envui/icons/Map';
import { useTimeline } from '../../motion/Timeline';
import { CornerLabel } from './Steps';
import { Figure } from './Topic';
import { useHighContrast, useNarrow, type FigureWords } from './ColorFigures';

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
 * them to its hue: a pale tinted page with paler surfaces and cards and a deep accent in the light
 * theme, lighter again at high contrast, and deep tinted ones with a pale accent in the dark; a tint of the accent for what is selected, with
 * accent text on it; translucent tinted fills for quiet controls. At high contrast the accent goes
 * a step further from the page, and text and edges keep the theme's own, stronger colors.
 */
function schemeColors({ hue }: (typeof schemes)[number], theme: ColorScheme, high: boolean) {
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
          // As envUI's light theme: the page deepest, the surfaces a step lighter, cards the lightest.
          '--env-color-bg-page': high ? oklch(0.96, 0.02, hue) : oklch(0.935, 0.03, hue),
          '--env-color-bg-default': high ? oklch(0.98, 0.01, hue) : oklch(0.965, 0.018, hue),
          '--env-color-bg-raised': high ? oklch(0.98, 0.01, hue) : oklch(0.965, 0.018, hue),
          '--env-color-bg-muted': oklch(0.99, 0.006, hue),
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
    ...tone('bg-primary-emphasis', accent, chroma, true),
    ...tone('border-primary-emphasis', accent, chroma, true),
    '--env-color-bg-primary-solid': oklch(accent, chroma, hue),
    '--env-color-fg-primary': oklch(accent, chroma, hue),
    '--env-color-fg-on-selected': oklch(step(accent, high ? 0.05 : 0.03), chroma, hue),
    '--env-color-border-focus': oklch(accent, chroma, hue),
    '--env-color-border-primary': oklch(accent, chroma, hue, 0.55),
    '--env-color-bg-primary-muted': oklch(accent, chroma, hue, light ? 0.12 : 0.14),
    '--env-color-bg-primary-soft': oklch(accent, chroma, hue, light ? 0.08 : 0.14),
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

/** An area in a scheme, in a theme, at the reader's contrast. */
function SchemeArea({
  scheme,
  theme,
  className,
  children,
}: {
  scheme: number;
  theme: ColorScheme;
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
  const destination = (id: string) => ({ current: place === id, onClick: () => setPlace(id) });
  const destinations: Destination[] = [
    { label: 'Trips', icon: <IconLuggage />, ...destination('trips') },
    { label: 'Map', icon: <IconMap />, ...destination('map') },
    { label: 'Friends', icon: <IconGroup />, count: 2, ...destination('friends') },
  ];
  return (
    <SchemeArea scheme={scheme} theme={page.theme} className="catalogue-scheme-canvas">
      <CornerLabel>{names[scheme]}</CornerLabel>
      <div className="catalogue-scheme-tiles" data-narrow={narrow || undefined}>
        <Tile name="form">
          <Column gap={4}>
            <TextField label="Trip name" defaultValue="Spring in Lisbon" />
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
            <SearchField label="Search photos" placeholder="Search" />
          </Tile>
        )}
        <Tile name="nav">
          {narrow ? (
            <NavigationBar aria-label="Trip" destinations={destinations} />
          ) : (
            <NavigationRail aria-label="Trip" destinations={destinations} />
          )}
        </Tile>
      </div>
    </SchemeArea>
  );
}

/** The same components in each of a few pastel schemes of an application's own, chosen in turn. */
export function OwnColorsFigure({ legend }: FigureWords) {
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
