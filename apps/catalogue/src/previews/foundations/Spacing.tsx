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
  Link,
  List,
  Row,
  SearchField,
  SegmentedControl,
  Select,
  Surface,
  Switch,
  Text,
  TextField,
  type ComboboxItem,
} from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Add } from '@envsemble/envui/icons/Add';
import { routeHref } from '../../navigation/Address';
import { ExampleStage } from '../Example';
import { MarkedSubject } from './Marks';
import { Block, Figure, NumberedLegend, TagLegend, Topic } from './Topic';

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
function GroupingFigure() {
  return (
    <Figure
      label="How space groups a settings card"
      className="docs-marked-stage"
      legend={
        <NumberedLegend
          entries={[
            {
              name: 'Tight, inside a group',
              text: 'A title and its description, or a label and its field, read as one thing.',
            },
            {
              name: 'Roomier, between groups',
              text: 'One field and the next, or a form and its buttons, stay apart but together.',
            },
            {
              name: 'The most, between sections',
              text: 'Profile and notifications are separate topics, so the widest space parts them.',
            },
          ]}
        />
      }
    >
      <MarkedSubject>
        <Surface
          background="default"
          padding={6}
          radius="xl"
          className="docs-spacing-subject"
          render={<Column gap={8} data-docs-space="3" />}
        >
          <Column gap={4} data-docs-space="2">
            <Column gap={1} data-docs-space="1">
              <Text render={<h3 />} variant="title">
                Profile
              </Text>
              <Text emphasis="muted">How other people see you.</Text>
            </Column>
            <TextField label="Name" defaultValue="Priya Shah" />
            <TextField label="Email" defaultValue="priya@example.com" />
          </Column>
          <Column gap={4} data-docs-space="2">
            <Column gap={1} data-docs-space="1">
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
    <Figure label="Controls of one size line up" className="docs-marked-stage">
      <MarkedSubject>
        <Row wrap gap={2} align="center" data-docs-guides className="docs-align-subject">
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

/** The shapes envUI gives what it draws, each a real component with its name and meaning. */
const shapes = [
  {
    name: 'Surfaces',
    text: 'Panes, cards and dialogs have the largest, softest corners.',
    picture: (
      <Card title="Quarterly report" description="Updated today" className="docs-shape-card" />
    ),
  },
  {
    name: 'Inside a surface',
    text: 'Rows, messages and tables sit inside with smaller corners, so they nest neatly.',
    picture: (
      <Surface
        background="default"
        padding={3}
        radius="xl"
        className="docs-shape-inner"
        render={<Column gap={3} />}
      >
        <Alert tone="info" title="Two reports need a review" />
        <List.Root aria-label="Reports">
          <List.Item label="Accessibility audit" />
          <List.Item label="Pricing research" />
        </List.Root>
      </Surface>
    ),
  },
  {
    name: 'Fully rounded',
    text: 'Buttons, fields, badges and switches have round ends: things you act on or read at a glance.',
    picture: (
      <Column gap={3} align="center">
        <Row gap={2} align="center">
          <Button>Save</Button>
          <Badge tone="accent">New</Badge>
        </Row>
        <SearchField label="Search" showLabel={false} />
      </Column>
    ),
  },
  {
    name: 'Circles',
    text: 'Pictures of people and buttons that are only an icon are round.',
    picture: (
      <Row gap={3} align="center">
        <Avatar name="Alex Morgan" size="lg" />
        <Avatar name="Sam Lee" size="lg" />
        <IconButton variant="secondary" icon={<MoreVert />} aria-label="More" />
      </Row>
    ),
  },
] as const;

function ShapesFigure() {
  return (
    <div className="docs-figure-run" data-count={shapes.length}>
      {shapes.map((shape) => (
        <figure key={shape.name} className="docs-topic-figure" aria-label={shape.name}>
          <div className="docs-foundation-stage docs-shape-stage" data-figure="example" inert>
            {shape.picture}
          </div>
          <figcaption className="docs-topic-text">
            <Text render={<p />} variant="title">
              {shape.name}
            </Text>
            <Text variant="body-sm" emphasis="muted">
              {shape.text}
            </Text>
          </figcaption>
        </figure>
      ))}
    </div>
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

/** The words to ask for space and shape with, and what envUI does for each. */
const words = [
  {
    tag: 'More room between these',
    text: 'Moves two things or two sections further apart, to the next larger step.',
  },
  {
    tag: 'Group these closer',
    text: 'Pulls things that belong together into one tight group, such as a title and its line.',
  },
  {
    tag: 'Separate sections',
    text: 'Gives unrelated parts of a page the widest space, instead of a line between them.',
  },
  {
    tag: 'Line these up',
    text: 'Gives controls in one row the same size, so their tops and bottoms meet.',
  },
  {
    tag: 'Tighter rows',
    text: 'Makes the rows of a table or list shorter, while their text stays the same size.',
  },
  {
    tag: 'Compact',
    text: 'Makes the whole app denser: smaller controls and space everywhere.',
  },
  {
    tag: 'On a surface',
    text: 'Puts content on a pane or card with the soft corners of a surface.',
  },
  {
    tag: 'Fully rounded',
    text: 'Gives an action round ends; a tall one keeps the same corners rather than a pill.',
  },
] as const;

export function SpacingPreview() {
  return (
    // Each figure here chooses its own stage: an example on the canvas, the words on the page.
    <ExampleStage value={false}>
      <Topic
        title="Space shows what belongs together"
        lead="envUI spaces things by how closely they belong: close inside a group, further apart between groups, and furthest between sections. You never pick a distance; you say what belongs together."
      >
        <GroupingFigure />
        <Block
          title="Components bring their own padding"
          text="The space inside a button, a field or a card is part of the component, so it looks the same wherever it goes. What a screen arranges is the space between things."
        />
      </Topic>
      <Topic
        title="Things line up"
        lead="Fields, menus, toggles and buttons of one size are exactly as tall as each other, so a toolbar or a form row lines up without any adjusting."
      >
        <AlignFigure />
        <Block
          title="Denser or roomier"
          text={
            <>
              A dense tool can use the compact scale, which makes every control and space a little
              smaller, and tables and lists can take tighter rows on their own.{' '}
              <Link href={routeHref('foundations/scale')}>Scale & density</Link> shows both.
            </>
          }
        />
      </Topic>
      <Topic
        title="Corners say what a thing is"
        lead="The roundness of a corner tells you what you are looking at: a surface that holds things, a part inside it, something to act on, or a person."
      >
        <ShapesFigure />
        <Block
          title="Tall things keep sensible corners"
          text="A button one line tall has round ends. When its label wraps, or a field fills with people, the same corners make a rounded rectangle instead of a stretched pill."
        >
          <TallFigure />
        </Block>
      </Topic>
      <Topic
        title="Words to use"
        lead="Ask an agent for space and shape in these words; envUI turns each into the right amount of space or the right corner, so the result matches the rest of the app."
      >
        <TagLegend label="Words for space and shape" entries={words} />
      </Topic>
    </ExampleStage>
  );
}
