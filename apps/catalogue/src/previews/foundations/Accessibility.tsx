import { Button, Checkbox, Column, IconButton, Kbd, Row, TextField } from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { ExampleStage } from '../Example';
import { Block, Figure, TagLegend, Topic } from './Topic';

/** A small form to move through with the keyboard: the focus ring shows where it is. */
function KeyboardFigure() {
  return (
    <Figure
      label="Move through a form with the keyboard"
      caption={
        <>
          <Kbd>Tab</Kbd> moves forward and <Kbd keys={['Shift', 'Tab']} /> back; <Kbd>Space</Kbd>{' '}
          checks the box and <Kbd>Enter</Kbd> presses a button.
        </>
      }
    >
      <Column gap={4} className="docs-keyboard-sample">
        <TextField label="Report title" defaultValue="Quarterly report" />
        <Checkbox label="Share with the team" defaultChecked />
        <Row gap={2} justify="end" align="center">
          <IconButton variant="ghost" icon={<MoreVert />} aria-label="More options" />
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </Row>
      </Column>
    </Figure>
  );
}

/** What every component does for people, without the app doing anything. */
const promises = [
  { tag: 'Keyboard', text: 'Everything works from the keyboard, in the order it shows.' },
  { tag: 'Visible focus', text: 'A clear ring shows where the keyboard is.' },
  {
    tag: 'Screen readers',
    text: 'Controls, regions and messages are announced by their name and state.',
  },
  { tag: 'Contrast', text: 'Text, edges and focus are checked for contrast in all four themes.' },
  { tag: 'Reduced motion', text: 'When people ask for less motion, things fade instead of move.' },
  {
    tag: 'Forced colors',
    text: "With the system's own high-contrast colors, every state stays visible.",
  },
  { tag: 'Touch', text: 'On a touchscreen, controls grow big enough for a finger.' },
] as const;

/** What only the app knows, so it supplies. */
const supplies = [
  {
    tag: 'Labels',
    text: 'A visible label for every field, and a name for every button that is only an icon.',
  },
  { tag: 'Text for pictures', text: 'A description of every image that carries meaning.' },
  { tag: 'Headings', text: 'Headings in order, so people can find their way around a page.' },
  { tag: 'Error messages', text: 'Messages that say what went wrong and how to put it right.' },
] as const;

/** The words to ask for accessibility with, and what envUI does for each. */
const words = [
  {
    tag: 'Name this button',
    text: 'Gives a button that is only an icon a name that screen readers say.',
  },
  {
    tag: 'Keyboard order',
    text: 'Puts controls in the order they show, so the keyboard moves through them as people read.',
  },
  {
    tag: 'High contrast',
    text: 'Stronger text and edges, chosen by the reader or followed from their system.',
  },
  {
    tag: 'Respect reduced motion',
    text: "Makes the app's own animations fade instead of move when people ask for less motion.",
  },
] as const;

export function AccessibilityPreview() {
  return (
    // Each figure here chooses its own stage: an example on the canvas, the words on the page.
    <ExampleStage value={false}>
      <Topic
        title="What every component does"
        lead="Every envUI component works for everyone without extra work: from the keyboard, with a screen reader, in high contrast and with less motion. Each component's page says what it does in detail."
      >
        <TagLegend label="What every component does" entries={promises} />
        <Block
          title="Try the keyboard"
          text="Press Tab to move into the example and through it, and watch the focus follow the keyboard in the order the controls show."
        >
          <KeyboardFigure />
        </Block>
        <Block
          title="Try high contrast"
          text="Choose High under Contrast in the Display menu, at the top of the page, and every page here shows stronger text and edges."
        />
      </Topic>
      <Topic
        title="What an app still supplies"
        lead="envUI can't know an app's own words. The app, or the agent that builds it, still supplies them."
      >
        <TagLegend label="What an app supplies" entries={supplies} />
      </Topic>
      <Topic
        title="Words to use"
        lead="Ask an agent for accessibility in these words; envUI does the rest in every component."
      >
        <TagLegend label="Words for accessibility" entries={words} />
      </Topic>
    </ExampleStage>
  );
}
