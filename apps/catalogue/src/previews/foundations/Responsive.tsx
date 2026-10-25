import {
  Avatar,
  Badge,
  Button,
  Column,
  DescriptionList,
  PageHeader,
  Surface,
  Text,
} from '@envsemble/envui';
import { ExampleStage } from '../Example';
import { Block, TagLegend, Topic } from './Topic';

/** A profile's header and details: the header and the list each follow their own width. */
function Profile() {
  return (
    <Surface background="default" padding={5} radius="xl" render={<Column gap={5} />}>
      <PageHeader
        title="Sam Lee"
        headingLevel={3}
        description="Product designer"
        start={<Avatar name="Sam Lee" />}
        meta={<Badge>Admin</Badge>}
        actions={
          <>
            <Button variant="secondary">Message</Button>
            <Button>Edit profile</Button>
          </>
        }
      />
      <DescriptionList.Root aria-label="Profile details">
        <DescriptionList.Item label="Team">Research</DescriptionList.Item>
        <DescriptionList.Item label="Location">Lisbon</DescriptionList.Item>
        <DescriptionList.Item label="Joined">4 March 2026</DescriptionList.Item>
      </DescriptionList.Root>
    </Surface>
  );
}

const frames = [
  {
    name: 'In a narrow pane',
    text: 'The actions move under the name, and each label sits above its value.',
    width: 'narrow',
  },
  {
    name: 'With room to spare',
    text: 'The same components spread out: the actions beside the name, labels beside values.',
    width: 'wide',
  },
] as const;

/** The same profile in a narrow frame and a wide one, one above the other. */
function WidthsFigure() {
  return (
    <div className="docs-width-figures">
      {frames.map((frame) => (
        <figure key={frame.name} className="docs-topic-figure" aria-label={frame.name}>
          <div className="docs-foundation-stage" data-figure="example" inert>
            <div className="docs-width-sample" data-width={frame.width}>
              <Profile />
            </div>
          </div>
          <figcaption className="docs-topic-text">
            <Text render={<p />} variant="title">
              {frame.name}
            </Text>
            <Text variant="body-sm" emphasis="muted">
              {frame.text}
            </Text>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** The window classes, narrowest first, each by where it falls. */
const windowClasses = [
  { tag: 'Compact', text: 'A phone held upright, or a narrow pane.' },
  { tag: 'Medium', text: 'A tablet held upright, or a narrow window.' },
  { tag: 'Expanded', text: 'A tablet held sideways, or a laptop window.' },
  { tag: 'Large', text: 'A desktop window.' },
] as const;

/** The words to ask for a layout that adapts, and what envUI does for each. */
const words = [
  {
    tag: 'On a phone',
    text: 'The compact window class: the narrowest layout, which every screen starts from.',
  },
  {
    tag: 'In a narrow pane',
    text: 'The same layout as on a phone, wherever the pane is.',
  },
  {
    tag: 'Side by side from expanded up',
    text: 'Two parts next to each other in a laptop or desktop window, one above the other below it.',
  },
  {
    tag: 'Stack on a phone',
    text: 'Puts parts one above the other in the compact window class.',
  },
  {
    tag: 'Wrap',
    text: 'Lets a row of buttons or tags run onto the next line instead of squeezing.',
  },
] as const;

export function ResponsivePreview() {
  return (
    // Each figure here chooses its own stage: an example on the canvas, the words on the page.
    <ExampleStage value={false}>
      <Topic
        title="Components follow their space"
        lead="An envUI component lays itself out for the space it sits in, not for the screen. In a narrow pane it looks as it would on a phone, and where there is room it spreads out, with nothing for an app to adjust."
      >
        <WidthsFigure />
        <Block
          title="Popups fit the window"
          text="Menus, dialogs and sheets size themselves to the window they open in, not to the pane they open from, so they always have room."
        />
      </Topic>
      <Topic
        title="Four window classes"
        lead="envUI names four widths of window, so you and an agent can say where a layout changes. Each is measured on the window around the app, not on the screen."
      >
        <TagLegend label="Window classes, narrowest first" entries={windowClasses} />
        <Block
          title="Larger text, narrower class"
          text="The window classes follow the reader's text size: with larger text, a window counts as a narrower class, so its layout never gets cramped."
        />
        <Block
          title="Start from the phone"
          text="A screen is laid out for the compact class first and spreads out from a class up, such as a list with its details beside it from expanded up and above it below."
        />
      </Topic>
      <Topic
        title="Words to use"
        lead="Ask an agent for a layout that adapts in these words; envUI turns each into a window class or a layout that follows its space."
      >
        <TagLegend label="Words for adapting to width" entries={words} />
      </Topic>
    </ExampleStage>
  );
}
