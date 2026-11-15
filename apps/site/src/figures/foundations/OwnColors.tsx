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
import { FoundationFrame } from './FoundationFrame';
import { useHighContrast, useNarrow, type FigureWords } from './ColorFigures';

const schemes: readonly { hue: number }[] = [{ hue: 300 }, { hue: 165 }, { hue: 48 }];

const oklch = (lightness: number, chroma: number, hue: number, alpha?: number) =>
  `oklch(${lightness} ${chroma} ${hue}${alpha === undefined ? '' : ` / ${alpha}`})`;

function schemeColors(
  { hue }: (typeof schemes)[number],
  theme: ColorScheme,
  highContrast: boolean,
): CSSProperties {
  const light = theme === 'light';
  const step = (lightness: number, by: number) => lightness + (light ? -by : by);
  const tone = (role: string, lightness: number, chroma: number, deeper = false) => {
    const at = (by: number) => (deeper ? lightness - by : step(lightness, by));
    return {
      [`--env-color-${role}`]: oklch(lightness, chroma, hue),
      [`--env-color-${role}-hover`]: oklch(at(0.035), chroma, hue),
      [`--env-color-${role}-pressed`]: oklch(at(0.07), chroma, hue),
    };
  };
  const accentLightness = light ? (highContrast ? 0.36 : 0.43) : highContrast ? 0.9 : 0.84;
  const accentChroma = light ? 0.11 : highContrast ? 0.06 : 0.08;
  const translucentInk = (alpha: number) =>
    light ? oklch(0.25, 0.04, hue, alpha) : oklch(0.94, 0.02, hue, alpha);
  const fills = {
    ...(light
      ? {
          '--env-color-bg-page': highContrast ? oklch(0.96, 0.02, hue) : oklch(0.935, 0.03, hue),
          '--env-color-bg-default': highContrast
            ? oklch(0.98, 0.01, hue)
            : oklch(0.965, 0.018, hue),
          '--env-color-bg-raised': highContrast ? oklch(0.98, 0.01, hue) : oklch(0.965, 0.018, hue),
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
    ...tone('bg-primary-emphasis', accentLightness, accentChroma, true),
    ...tone('border-primary-emphasis', accentLightness, accentChroma, true),
    '--env-color-bg-primary-solid': oklch(accentLightness, accentChroma, hue),
    '--env-color-fg-primary': oklch(accentLightness, accentChroma, hue),
    '--env-color-fg-on-selected': oklch(
      step(accentLightness, highContrast ? 0.05 : 0.03),
      accentChroma,
      hue,
    ),
    '--env-color-border-focus': oklch(accentLightness, accentChroma, hue),
    '--env-color-border-primary': oklch(accentLightness, accentChroma, hue, 0.55),
    '--env-color-bg-primary-muted': oklch(accentLightness, accentChroma, hue, light ? 0.12 : 0.14),
    '--env-color-bg-primary-soft': oklch(accentLightness, accentChroma, hue, light ? 0.08 : 0.14),
    '--env-color-bg-neutral-muted': translucentInk(light ? 0.08 : 0.12),
    '--env-color-bg-neutral-muted-hover': translucentInk(light ? 0.14 : 0.19),
    '--env-color-bg-neutral-muted-pressed': translucentInk(light ? 0.2 : 0.26),
    '--env-color-bg-neutral-subtle-hover': translucentInk(0.08),
    '--env-color-bg-neutral-subtle-pressed': translucentInk(0.1),
  };
  const textAndEdges = light
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
  return highContrast ? fills : { ...fills, ...textAndEdges };
}

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
  const showsHighContrast = useHighContrast(contrast);
  return (
    <Theme
      theme={theme}
      contrast={contrast}
      className={className}
      style={schemeColors(schemes[scheme] ?? schemes[0]!, theme, showsHighContrast)}
    >
      {children}
    </Theme>
  );
}

const schemeStepMs = 1320;

function Tile({ name, children }: { name: string; children: ReactNode }) {
  return (
    <Surface padding={4} className="catalogue-scheme-tile" data-tile={name}>
      {children}
    </Surface>
  );
}

function SchemeChoice({ names, narrow }: { names: readonly string[]; narrow: boolean }) {
  const page = useTheme();
  const scheme = useTimeline(schemes.map(() => schemeStepMs));
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

export function OwnColorsFigure({ legend }: FigureWords) {
  return (
    <FoundationFrame
      label="Your own colors"
      motion="the components in each color scheme"
      className="catalogue-scheme-stage"
    >
      <SchemeSteps names={legend.map((entry) => entry.name)} />
    </FoundationFrame>
  );
}

const threeAcrossMinWidthRem = 38;

function SchemeSteps({ names }: { names: readonly string[] }) {
  const [ref, narrow] = useNarrow(threeAcrossMinWidthRem);
  return (
    <div ref={ref} className="catalogue-scheme-steps">
      <SchemeChoice key={narrow ? 'narrow' : 'wide'} names={names} narrow={narrow} />
    </div>
  );
}
