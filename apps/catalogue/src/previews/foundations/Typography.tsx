import { Badge, Column, Row, Surface, Text, type TextVariant } from '@envsemble/envui';
import { ExampleStage } from '../Example';
import { MarkedSubject } from './Marks';
import { Block, Figure, NumberedLegend, TagLegend, Topic } from './Topic';

/** A small report screen with each text style it uses marked. */
function ScreenFigure() {
  return (
    <Figure
      label="The text styles of a screen"
      className="docs-marked-stage"
      legend={
        <NumberedLegend
          entries={[
            { name: 'Headline', text: 'The title of the page.' },
            { name: 'Title', text: 'The title of a section, a card or a dialog.' },
            { name: 'Body', text: 'Most text: paragraphs, descriptions and values.' },
            { name: 'Small body', text: 'Supporting text, a step smaller and quieter.' },
            { name: 'Caption', text: 'A note under a figure or a chart, at the small size.' },
          ]}
        />
      }
    >
      <MarkedSubject>
        <Surface
          background="default"
          padding={6}
          radius="xl"
          className="docs-type-screen"
          render={<Column gap={6} />}
        >
          <Text render={<p />} variant="headline" data-docs-mark="1">
            Quarterly report
          </Text>
          <Column gap={2} align="start">
            <Row gap={2} align="center">
              <Text render={<p />} variant="title" data-docs-mark="2">
                Budget
              </Text>
              <Badge tone="success">On track</Badge>
            </Row>
            <Text data-docs-mark="3">
              Spending is within the plan, with most of the quarter&apos;s travel already booked.
            </Text>
            <Text variant="body-sm" data-docs-mark="4">
              Updated today by Priya Shah
            </Text>
          </Column>
          <Text variant="caption" data-docs-mark="5">
            Figures include tax.
          </Text>
        </Surface>
      </MarkedSubject>
    </Figure>
  );
}

/** Every text style, largest first, by its name and its job. */
const styles: readonly { variant: TextVariant; name: string; use: string }[] = [
  {
    variant: 'display',
    name: 'Display',
    use: 'The one large line that opens a page, at most once.',
  },
  { variant: 'headline', name: 'Headline', use: 'The title of a page.' },
  { variant: 'title', name: 'Title', use: 'The title of a section, a card or a dialog.' },
  { variant: 'body', name: 'Body', use: 'Most text: paragraphs, descriptions and values.' },
  { variant: 'body-sm', name: 'Small body', use: 'Supporting text, a step smaller and quieter.' },
  { variant: 'caption', name: 'Caption', use: 'A note under a figure or a chart.' },
];

/** The text styles as a specimen of the system, on the page: each sample in its style. */
function StyleList() {
  return (
    <ol className="docs-type-styles" aria-label="Text styles">
      {styles.map((style) => (
        <li key={style.variant}>
          <Text render={<span />} variant={style.variant} className="docs-type-sample">
            Quarterly report
          </Text>
          <span className="docs-type-name">
            <Text render={<span />} className="docs-topic-legend-name">
              {style.name}
            </Text>
            <Text render={<span />} variant="body-sm" emphasis="muted">
              {style.use}
            </Text>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The same size of text in the main color and the quieter one. */
function EmphasisFigure() {
  return (
    <Figure label="Quieter text">
      <Column gap={2} align="start" inert>
        <Text>Quarterly report</Text>
        <Text emphasis="muted">Updated today by Priya Shah</Text>
      </Column>
    </Figure>
  );
}

/** The words to ask for text with, and what envUI does for each. */
const words = [
  { tag: 'A hero line', text: 'The display style: one large line that opens a page.' },
  { tag: 'A page title', text: 'The headline style, as the page’s main heading.' },
  { tag: 'A section title', text: 'The title style, for a section, a card or a dialog.' },
  { tag: 'Supporting text', text: 'Text a step smaller and quieter, for details and hints.' },
  { tag: 'A caption', text: 'A small, quiet note under a figure or a chart.' },
  { tag: 'Quieter text', text: 'The same size in the quieter color of supporting text.' },
] as const;

export function TypographyPreview() {
  return (
    // Each figure here chooses its own stage: an example on the canvas, a specimen on the page.
    <ExampleStage value={false}>
      <Topic
        title="A few styles, each with a job"
        lead="envUI sets text in six styles, from the one large line that opens a page to small notes. Each style has one job, so a title or a note looks the same on every screen."
      >
        <ScreenFigure />
        <Block
          title="Every style"
          text="Each style, largest first, in the theme you are reading in, with what it is for."
          stacked
        >
          <StyleList />
        </Block>
      </Topic>
      <Topic
        title="Quieter, not smaller"
        lead="Text can step back without getting smaller: supporting text takes a quieter color than the main text, at any size."
      >
        <Block
          title="Two colors of text"
          text="The main color for what people read first, and a quieter one for details, dates and hints. Both keep their contrast in every theme, high contrast included."
        >
          <EmphasisFigure />
        </Block>
      </Topic>
      <Topic
        title="One typeface, two weights"
        lead="Everything is set in one typeface, at a regular weight for reading and a medium weight for headings and labels. A bold weight is kept for the strongest emphasis in a small space, such as today in a calendar."
      >
        <Block
          title="Text follows the reader"
          text="Text grows with the text size people choose in their browser, and the compact scale makes every style a step smaller. Choose Compact under Scale in the Display menu to see it on this site."
        />
        <Block
          title="Space belongs to the layout"
          text="Text adds no space around itself. The space between a title and its paragraph comes from the group they are in, so text sits the same in every component."
        />
      </Topic>
      <Topic
        title="Words to use"
        lead="Ask an agent for text in these words; envUI turns each into a style, so the result matches the rest of the app."
      >
        <TagLegend label="Words for text" entries={words} />
      </Topic>
    </ExampleStage>
  );
}
