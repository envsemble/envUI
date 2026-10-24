import { Alert, Button, Column, IconButton, Row } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Person } from '@envsemble/envui/icons/Person';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Star } from '@envsemble/envui/icons/Star';
import { ExampleStage } from '../Example';
import { IconCatalogue } from './IconCatalogue';
import { Block, Figure, FigureRun, TagLegend, Topic } from './Topic';

/** Icons in buttons, an icon button and a message, each in the color of its words. */
function FollowTextFigure() {
  return (
    <Figure label="Icons take the color of their text">
      <Column gap={4} align="center" inert className="docs-icons-sample">
        <Row gap={2} wrap justify="center" align="center">
          <Button startIcon={<Add />}>New report</Button>
          <Button variant="secondary" startIcon={<Edit />}>
            Rename
          </Button>
          <Button variant="ghost" tone="danger" startIcon={<Delete />}>
            Delete
          </Button>
          <IconButton variant="ghost" icon={<MoreVert />} aria-label="More" />
        </Row>
        <Alert tone="success" title="The report is shared with your team" />
      </Column>
    </Figure>
  );
}

const sample = [Home, Inbox, Star, Person, Settings] as const;

/** The same icons outlined and filled. */
function FormsFigure() {
  return (
    <FigureRun
      className="docs-icons-forms"
      figures={[
        {
          name: 'Outlined',
          text: 'The usual form, light beside text.',
          picture: (
            <Row gap={4} justify="center">
              {sample.map((Symbol, index) => (
                <Symbol key={index} width="2rem" height="2rem" />
              ))}
            </Row>
          ),
        },
        {
          name: 'Filled',
          text: 'For what is selected, or an icon that stands alone.',
          picture: (
            <Row gap={4} justify="center">
              {sample.map((Symbol, index) => (
                <Symbol key={index} filled width="2rem" height="2rem" />
              ))}
            </Row>
          ),
        },
      ]}
    />
  );
}

/** The words to ask for icons with, and what envUI does for each. */
const words = [
  {
    tag: 'An icon button',
    text: 'A button that is only an icon, with a name that screen readers say.',
  },
  { tag: 'An icon before the label', text: 'An icon at the start of a button or a menu item.' },
  { tag: 'A filled icon', text: 'The filled form, for what is selected or stands alone.' },
  {
    tag: 'Our own logo',
    text: "The app's own mark drawn as an icon, so it takes the color of the text around it.",
  },
] as const;

export function IconsPreview() {
  return (
    // Each figure here chooses its own stage: an example on the canvas, the list on the page.
    <ExampleStage value={false}>
      <Topic
        title="Icons follow their text"
        lead="An icon takes the color and the size of the words around it, so in a button, a menu or a message it always matches its label, in every theme."
      >
        <FollowTextFigure />
        <Block
          title="A name when it stands alone"
          text="An icon beside a label adds nothing for a screen reader, so it stays silent. An icon that stands alone, such as a button that is only an icon, gets a name of its own."
        />
      </Topic>
      <Topic
        title="Outlined and filled"
        lead="Every icon comes in two forms. Navigation and tabs fill the icon of the place that is selected, so it stands out from the rest."
      >
        <FormsFigure />
      </Topic>
      <Topic
        title="Every icon"
        lead="Thousands of icons come with envUI. Search them by name, switch to filled, and choose one to see how to use it."
      >
        <IconCatalogue />
      </Topic>
      <Topic
        title="Words to use"
        lead="Ask an agent for icons in these words, and name the icon you chose from the list above."
      >
        <TagLegend label="Words for icons" entries={words} />
      </Topic>
    </ExampleStage>
  );
}
