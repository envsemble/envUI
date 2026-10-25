import type { CSSProperties } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Column,
  Row,
  Surface,
  Text,
  Theme,
  useTheme,
  type ThemeContrast,
  type ThemeValue,
} from '@envsemble/envui';
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
      className="docs-marked-stage"
      legend={<NumberedLegend entries={legend} />}
    >
      <MarkedSubject>
        <Surface
          background="page"
          padding={5}
          radius="xl"
          data-docs-mark="1"
          className="docs-roles"
        >
          <Surface
            background="default"
            padding={5}
            radius="xl"
            data-docs-mark="2"
            render={<Column gap={5} />}
          >
            <Column gap={1} align="start">
              <Text render={<h3 />} variant="title" data-docs-mark="4">
                Quarterly report
              </Text>
              <Text emphasis="muted" data-docs-mark="5">
                Updated today by Priya Shah
              </Text>
            </Column>
            <Card
              background="muted"
              padding={4}
              data-docs-mark="3"
              headingLevel={4}
              title="Budget"
              description="Within the plan for this quarter"
            />
            <Row justify="between" align="center" gap={3}>
              <Badge tone="success" data-docs-mark="7">
                On track
              </Badge>
              <Button data-docs-mark="6">Share</Button>
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
    <div className="docs-role-groups">
      <div>
        {roleGroups.map((roles, group) => {
          const title = legend[group]?.name ?? '';
          return (
            <section key={group} className="docs-role-group">
              <Text render={<h4 />} variant="title">
                {title}
              </Text>
              <ul className="docs-role-swatches" aria-label={title}>
                {roles.map((colors, index) => (
                  <li key={colors.join()}>
                    <span className="docs-role-swatch" aria-hidden="true">
                      {colors.map((color) => (
                        <span key={color} style={{ background: `var(--env-color-${color})` }} />
                      ))}
                    </span>
                    <Text render={<span />} className="docs-topic-legend-name">
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

/** The same small screen in each theme and contrast, side by side. */
function ThemesFigure({ legend }: FigureWords) {
  return (
    <Figure label="One screen in each theme" className="docs-themes-stage">
      <div className="docs-themes" inert>
        {themes.map((each, index) => (
          <div key={`${each.theme}-${each.contrast}`} className="docs-theme-sample">
            <Theme theme={each.theme} contrast={each.contrast}>
              <Surface background="page" padding={4} radius="xl">
                <Surface background="default" padding={4} radius="xl" render={<Column gap={3} />}>
                  <Column gap={1}>
                    <Text render={<p />} variant="title">
                      Quarterly report
                    </Text>
                    <Text emphasis="muted">Updated today</Text>
                  </Column>
                  <Row justify="between" align="center" gap={2}>
                    <Badge tone="success">On track</Badge>
                    <Button size="sm">Share</Button>
                  </Row>
                </Surface>
              </Surface>
            </Theme>
            <Text variant="caption">{legend[index]?.name}</Text>
          </div>
        ))}
      </div>
    </Figure>
  );
}

/** The tones at work: badges in each, a warning, a note and a danger button. */
function StatusFigure() {
  return (
    <Figure label="Each tone at work" className="docs-status-stage">
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
