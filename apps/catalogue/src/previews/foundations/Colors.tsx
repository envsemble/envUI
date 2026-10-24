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
import { ExampleStage } from '../Example';
import { MarkedSubject } from './Marks';
import { Block, Figure, NumberedLegend, TagLegend, Topic } from './Topic';

/**
 * A small screen with each color role marked: the page, a surface on it, a filled card inside,
 * text, supporting text, the accent and a status.
 */
function RolesFigure() {
  return (
    <Figure
      label="The color roles of a screen"
      className="docs-marked-stage"
      legend={
        <NumberedLegend
          entries={[
            { name: 'Page', text: 'The background behind everything.' },
            { name: 'Surface', text: 'Panes, dialogs and menus that sit on the page.' },
            { name: 'Filled card', text: 'A soft fill for a card or a group inside a surface.' },
            { name: 'Text', text: 'Headings and the main words.' },
            { name: 'Supporting text', text: 'Details, captions and hints, a step quieter.' },
            { name: 'Accent', text: 'The main action, links and what is selected.' },
            { name: 'Status', text: 'Success, warning, danger and done, always with words.' },
          ]}
        />
      }
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

/** Each role's swatch, named by what it is and what it is for. */
const roles = [
  { name: 'Page', use: 'The background behind everything', color: 'bg-page' },
  { name: 'Surface', use: 'Panes, dialogs and menus', color: 'bg-default' },
  { name: 'Filled surface', use: 'Cards and tab rails', color: 'bg-muted' },
  { name: 'Text', use: 'Headings and body text', color: 'fg-default' },
  { name: 'Supporting text', use: 'Details, captions and icons', color: 'fg-muted' },
  { name: 'Edges', use: 'The outline of fields and outline buttons', color: 'border-default' },
  { name: 'Accent', use: 'The main action', color: 'bg-brand-emphasis' },
  { name: 'Selected', use: 'What is chosen in navigation and lists', color: 'bg-selected' },
  { name: 'Success', use: 'Healthy or ready', color: 'fg-success' },
  { name: 'Warning', use: 'Needs attention', color: 'fg-warning' },
  { name: 'Danger', use: 'Failed or destructive', color: 'fg-danger' },
  { name: 'Done', use: 'Completed work', color: 'fg-done' },
] as const;

/** The roles as swatches in the reader's theme: a specimen of the system, on the page. */
function RoleSwatches() {
  return (
    <ul className="docs-role-swatches" aria-label="Color roles">
      {roles.map((role) => (
        <li key={role.name}>
          <span
            className="docs-role-swatch"
            style={{ background: `var(--env-color-${role.color})` }}
            aria-hidden="true"
          />
          <Text render={<span />} className="docs-topic-legend-name">
            {role.name}
          </Text>
          <Text render={<span />} variant="body-sm" emphasis="muted">
            {role.use}
          </Text>
        </li>
      ))}
    </ul>
  );
}

const themes: readonly { name: string; theme: ThemeValue; contrast: ThemeContrast }[] = [
  { name: 'Light', theme: 'light', contrast: 'standard' },
  { name: 'Dark', theme: 'dark', contrast: 'standard' },
  { name: 'Light, high contrast', theme: 'light', contrast: 'high' },
  { name: 'Dark, high contrast', theme: 'dark', contrast: 'high' },
];

/** The same small screen in each theme and contrast, side by side. */
function ThemesFigure() {
  return (
    <Figure label="One screen in each theme" className="docs-themes-stage">
      <div className="docs-themes" inert>
        {themes.map((each) => (
          <div key={each.name} className="docs-theme-sample">
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
            <Text variant="caption">{each.name}</Text>
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

/** The words to ask for color with, and what each means in envUI. */
const words = [
  { tag: 'A quieter surface', text: 'A fill closer to the page, so a panel draws less attention.' },
  { tag: 'A filled card', text: 'A card with the soft fill, for a group inside a surface.' },
  { tag: 'Supporting text', text: 'Quieter text for details, captions and hints.' },
  { tag: 'The accent', text: 'The color of the main action, links and what is selected.' },
  {
    tag: 'Success or warning',
    text: 'A tone that says how something stands, with words or an icon.',
  },
  { tag: 'A danger button', text: 'A red action for deleting or anything that can’t be undone.' },
  { tag: 'Its own color', text: 'One element in a color of its own, keeping its hover and press.' },
  { tag: 'A dark area', text: 'One part of a light page in the dark theme, or the other way.' },
  {
    tag: 'High contrast',
    text: 'Stronger text and edges for people who need them, on every page.',
  },
] as const;

export function ColorsPreview() {
  return (
    // Each figure here chooses its own stage: an example on the canvas, a specimen on the page.
    <ExampleStage value={false}>
      <Topic
        title="Colors are roles"
        lead="envUI never colors a screen by hand. Each part takes a role, such as the page, a surface or supporting text, and the theme gives every role its color, so a screen looks right in light, dark and high contrast at once."
      >
        <RolesFigure />
        <Block
          title="Every role in this theme"
          text="Each swatch shows a role in the theme you are reading in. Switch the theme in the Display menu, and each takes the color its role has there."
          stacked
        >
          <RoleSwatches />
        </Block>
      </Topic>
      <Topic
        title="Light, dark and high contrast"
        lead="Every role has a color in the light and the dark theme, and a high-contrast version of each, with stronger text and edges. People choose, or the app follows their system, and every screen follows without changes."
      >
        <ThemesFigure />
        <Block
          title="Try it on this site"
          text="Choose a theme and a contrast in the Display menu, at the top of the page, and every page and example here follows."
        />
      </Topic>
      <Topic
        title="What each color means"
        lead="A tone means the same on every component, on badges, alerts, buttons, toasts and charts alike. A tone always comes with words or an icon, so nobody has to tell colors apart."
      >
        <StatusFigure />
        <TagLegend
          label="What each tone means"
          entries={[
            { tag: 'Neutral', text: 'No particular state, such as archived, and most actions.' },
            { tag: 'Accent', text: 'The main action, and the current or highlighted state.' },
            { tag: 'Info', text: 'Something to know, neither good nor bad, such as a tip.' },
            { tag: 'Success', text: 'Healthy, ready or saved.' },
            { tag: 'Warning', text: 'Needs attention soon.' },
            { tag: 'Danger', text: 'Failed, or an action that destroys something.' },
            { tag: 'Done', text: 'Completed work.' },
          ]}
        />
      </Topic>
      <Topic
        title="Colors of its own"
        lead="Where a screen needs a color the roles don't give, most components, such as buttons, fields, cards, badges, alerts, menus and navigation, can take colors of their own, and one area can take the other theme."
      >
        <Block
          title="One element, one area"
          text="A button in a brand color keeps its hover and press, made from its own color, and its label stays readable in every state. An area in the other theme, such as a dark banner on a light page, brings all its roles along."
        >
          <OwnColorsFigure />
        </Block>
      </Topic>
      <Topic
        title="Words to use"
        lead="Ask an agent for color in these words; envUI turns each into a role, so the result works in every theme."
      >
        <TagLegend label="Words for color" entries={words} />
      </Topic>
    </ExampleStage>
  );
}
