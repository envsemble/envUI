import { Column, DescriptionList, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/code';
import { lazyPart } from '../loading/LoadBoundary';
import { ExampleSource } from '../figures/LiveExample';
import { UsageFigure } from '../figures/Figures';
import { ColorPaletteSkeleton } from '../figures/foundations/ColorPaletteSkeleton';
import { SpecimenHeadingLevel } from '../figures/SpecimenFrame';
import { partsOf } from '../template/Parts';
import { pendingAttribute, useSectionOutline } from '../template/SectionOutline';
import type { DocumentationEntry } from '@docs-model/DocumentationTypes';
import { PageMarkdown } from './PageMarkdown';
import { LoadedPart } from './LoadedPart';
import { PropsTables } from './PropsTables';
import { providesOf } from '@docs-model/CatalogueContent';
import { guideSubsections, raisedHeadings, wordsInCode } from '@docs-model/DocsContent';
import { headingSlug } from '@docs-model/SearchAnchors';

/*
 * The sections of the Docs' pages, each from what a page's file writes or its exports generate,
 * as the route views place them (DocsPages.tsx).
 */

/** The palette's swatches, with their color picker, which load with the page that shows them. */
const colorPalette = lazyPart(
  () => import('../figures/foundations/ColorPalette'),
  (module) => module.ColorPalette,
  'src/figures/foundations/ColorPalette.tsx',
);

/**
 * The colors guide's editable palette: every role a component paints, by its token, with its value
 * in the current theme, each a swatch that picks another color for this visit.
 */
export function PaletteSection() {
  return (
    <Column render={<section />} gap={5} aria-labelledby="palette">
      <Text render={<h2 />} variant="title" className="site-section-title" id="palette">
        Try the palette
      </Text>
      <Text emphasis="muted">
        Each swatch shows a token&apos;s value in the theme you are reading in. Press one to pick
        another color: the whole catalogue follows, in this theme only, until you reload.
      </Text>
      <SpecimenHeadingLevel value={3}>
        <LoadedPart part={colorPalette} what="palette" placeholder={<ColorPaletteSkeleton />} />
      </SpecimenHeadingLevel>
    </Column>
  );
}

/**
 * The values a state attribute takes: each as code, except the empty value of an attribute set
 * without one, which reads as Present; with no values listed, any value or presence alone selects it.
 */
function StateValues({ values }: { values: readonly string[] }) {
  if (!values.length) return <>Any value, or present</>;
  return values.map((value, index) => (
    <span key={value}>
      {index > 0 && ' · '}
      {value === '' ? 'Present' : <Code>{value}</Code>}
    </span>
  ));
}

/** The part names and state attributes of the exports a page documents, as simple lists. */
export function PartNames({ components }: { components: readonly string[] }) {
  const entries = components.flatMap((name) => {
    const parts = partsOf(name);
    return parts ? [{ name, parts }] : [];
  });
  const outline = useSectionOutline();
  if (!entries.length) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="part-names"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="part-names">
        Part names
      </Text>
      <Text emphasis="muted">
        Each part&apos;s class and state attributes are public and versioned, for an
        application&apos;s CSS to style.
      </Text>
      {!outline &&
        entries.map(({ name, parts }) => (
          <Column key={name} gap={3}>
            {entries.length > 1 && (
              <Text render={<h3 />} variant="title">
                <Code>{name}</Code>
              </Text>
            )}
            <DescriptionList.Root className="docs-parts">
              {parts.parts.map((part) => (
                <DescriptionList.Item key={part.class} label={<Code>{part.class}</Code>}>
                  {part.description}
                </DescriptionList.Item>
              ))}
              {parts.states.map((state) => (
                <DescriptionList.Item key={state.attribute} label={<Code>{state.attribute}</Code>}>
                  <StateValues values={state.values} />
                  {state.parts.length > 1 || state.parts[0] !== parts.root ? (
                    <Text render={<span />} emphasis="muted">
                      {` on ${state.parts.join(', ')}`}
                    </Text>
                  ) : null}
                </DescriptionList.Item>
              ))}
            </DescriptionList.Root>
          </Column>
        ))}
    </Column>
  );
}

/**
 * What an application adds for a component or pattern to be accessible, and what envUI does for
 * it, as the Accessibility section of its page writes them: plain lists under a heading, `title`,
 * of the section's own.
 */
export function Provides({
  document,
  title,
  id,
}: {
  document: DocumentationEntry;
  title: string;
  id: string;
}) {
  const { envui, app } = providesOf(document.sections ?? []);
  const outline = useSectionOutline();
  if (!envui && !app) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={id}
      className="docs-provides"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id={id}>
        {title}
      </Text>
      {app && (
        <Column gap={3}>
          <Text render={<h3 />} variant="title">
            You provide
          </Text>
          <PageMarkdown markdown={app} path={document.path} />
        </Column>
      )}
      {envui && (
        <Column gap={3}>
          <Text render={<h3 />} variant="title">
            envUI provides
          </Text>
          <PageMarkdown markdown={envui} path={document.path} />
        </Column>
      )}
    </Column>
  );
}

/**
 * The guide at the top of a page in the Docs, from the page's "## Compose": how to import it, its
 * common uses in code, how its parts compose and how to customize it, each a section of its own,
 * with an example file of the page shown as code where the page names one. With `showExample`, as a
 * component's, Usage opens with the component, live and compact (UsageFigure).
 */
export function CodeGuide({
  document,
  showExample = false,
}: {
  document: DocumentationEntry;
  showExample?: boolean;
}) {
  return guideSubsections(document.sections).map(({ title, content }) => {
    const id = headingSlug(title);
    return (
      <Column key={title} render={<section />} gap={5} aria-labelledby={id} className="docs-guide">
        <Text render={<h2 />} variant="title" className="site-section-title" id={id}>
          {title}
        </Text>
        {showExample && title === 'Usage' && <UsageFigure page={document} />}
        {content.map((part, index) =>
          part.kind === 'source' ? (
            <ExampleSource key={index} page={document.id} name={part.name} />
          ) : (
            <PageMarkdown
              key={index}
              markdown={raisedHeadings(part.markdown)}
              path={document.path}
            />
          ),
        )}
      </Column>
    );
  });
}

/**
 * The words a page gives people, from its "## Words to use", each with the code it means: the
 * table's In code column, which the catalogue leaves out, beside the words. Nothing where the
 * page has no such column.
 */
export function WordsInCode({ document }: { document: DocumentationEntry }) {
  const markdown = wordsInCode(document.sections);
  const outline = useSectionOutline();
  if (!markdown) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="words-in-code"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="words-in-code">
        Words in code
      </Text>
      <PageMarkdown markdown={markdown} path={document.path} />
    </Column>
  );
}

/** The color properties of the exports a page documents, from docs/generated/parts.json. */
export function ColorProperties({ components }: { components: readonly string[] }) {
  const entries = components.flatMap((name) => {
    const colors = partsOf(name)?.colors ?? [];
    return colors.length ? [{ name, colors }] : [];
  });
  const outline = useSectionOutline();
  if (!entries.length) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="color-properties"
      {...pendingAttribute(outline)}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="color-properties">
        Color properties
      </Text>
      <Text emphasis="muted">
        Each sets a color of one instance, through <Code>style</Code> or CSS; its hover, focus and
        press follow it. They are public and versioned.
      </Text>
      {!outline &&
        entries.map(({ name, colors }) => (
          <Column key={name} gap={3}>
            {entries.length > 1 && (
              <Text render={<h3 />} variant="title">
                <Code>{name}</Code>
              </Text>
            )}
            <DescriptionList.Root className="docs-parts">
              {colors.map((color) => (
                <DescriptionList.Item key={color.property} label={<Code>{color.property}</Code>}>
                  {color.description}
                </DescriptionList.Item>
              ))}
            </DescriptionList.Root>
          </Column>
        ))}
    </Column>
  );
}

/** Every export's props, generated from their types, under Props. */
export function PropsSection({ document }: { document: DocumentationEntry }) {
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby="props"
      {...pendingAttribute(useSectionOutline())}
    >
      <Text render={<h2 />} variant="title" className="site-section-title" id="props">
        Props
      </Text>
      <PropsTables document={document} />
    </Column>
  );
}

/** The built-in strings a page's exports show, each a key of EnvUIProvider's `messages`. */
export function Strings({ document }: { document: DocumentationEntry }) {
  const strings = document.strings ?? [];
  const outline = useSectionOutline();
  if (!strings.length) return null;
  return (
    <Column render={<section />} gap={5} aria-labelledby="strings" {...pendingAttribute(outline)}>
      <Text render={<h2 />} variant="title" className="site-section-title" id="strings">
        Strings
      </Text>
      <Text emphasis="muted">
        EnvUIProvider&apos;s <Code>messages</Code> overrides each, and a component&apos;s own label
        prop wins over it.
      </Text>
      {!outline && (
        <DescriptionList.Root className="docs-parts">
          {strings.map((string) => (
            <DescriptionList.Item
              key={`${string.namespace}.${string.key}`}
              label={<Code>{`messages.${string.namespace}.${string.key}`}</Code>}
            >
              <Code>{string.value}</Code> {string.description}
            </DescriptionList.Item>
          ))}
        </DescriptionList.Root>
      )}
    </Column>
  );
}
