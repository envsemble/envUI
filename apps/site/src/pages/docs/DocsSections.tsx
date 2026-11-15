import { Column, DescriptionList, Text, type TableOfContentsItem } from '@envsemble/envui';
import { Code } from '@envsemble/envui/code';
import { ExampleSource } from '../../figures/LiveExample';
import { UsageFigure } from '../../figures/Figures';
import { ColorPaletteSkeleton } from '../../figures/foundations/ColorPaletteSkeleton';
import { SpecimenHeadingLevel } from '../../figures/SpecimenFrame';
import { partsOf } from '../../figures/anatomy/Parts';
import { pendingAttribute, useSectionOutline } from '../../markdown/SectionOutline';
import type { DocumentationEntry } from '../../documentation/DocumentationTypes';
import { PageMarkdown } from '../../markdown/PageMarkdown';
import { LoadedPart } from '../../loading/LoadedPart';
import { pageParts } from '../PageParts';
import { PropsTables } from './PropsTables';
import { providesOf } from '../../documentation/CatalogueContent';
import { guideSubsections, raisedHeadings, wordsInCode } from '../../documentation/DocsContent';
import { headingSlug } from '../../documentation/SearchAnchors';

export const docsHeadings = {
  palette: { id: 'palette', label: 'Try the palette' },
  partNames: { id: 'part-names', label: 'Part names' },
  provides: { id: 'provides', label: 'Accessibility' },
  wordsInCode: { id: 'words-in-code', label: 'Words in code' },
  colorProperties: { id: 'color-properties', label: 'Color properties' },
  props: { id: 'props', label: 'Props' },
  strings: { id: 'strings', label: 'Strings' },
} satisfies Record<string, TableOfContentsItem>;

function SectionHeading({ heading }: { heading: { id: string; label: string } }) {
  return (
    <Text render={<h2 />} variant="title" className="site-section-title" id={heading.id}>
      {heading.label}
    </Text>
  );
}

export function PaletteSection() {
  return (
    <Column render={<section />} gap={5} aria-labelledby={docsHeadings.palette.id}>
      <SectionHeading heading={docsHeadings.palette} />
      <Text emphasis="muted">
        Each swatch shows a token&apos;s value in the theme you are reading in. Press one to pick
        another color: the whole catalogue follows, in this theme only, until you reload.
      </Text>
      <SpecimenHeadingLevel value={3}>
        <LoadedPart
          part={pageParts.palette}
          what="palette"
          placeholder={<ColorPaletteSkeleton />}
        />
      </SpecimenHeadingLevel>
    </Column>
  );
}

function StateValues({ values }: { values: readonly string[] }) {
  if (!values.length) return <>Any value, or present</>;
  return values.map((value, index) => (
    <span key={value}>
      {index > 0 && ' · '}
      {value === '' ? 'Present' : <Code>{value}</Code>}
    </span>
  ));
}

export const partEntries = (components: readonly string[]) =>
  components.flatMap((name) => {
    const parts = partsOf(name);
    return parts ? [{ name, parts }] : [];
  });

export function PartNames({ components }: { components: readonly string[] }) {
  const entries = partEntries(components);
  const outline = useSectionOutline();
  if (!entries.length) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={docsHeadings.partNames.id}
      {...pendingAttribute(outline)}
    >
      <SectionHeading heading={docsHeadings.partNames} />
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

export const hasProvides = (document: DocumentationEntry) => {
  const { envui, app } = providesOf(document.sections ?? []);
  return Boolean(envui || app);
};

export function Provides({ document }: { document: DocumentationEntry }) {
  const { envui, app } = providesOf(document.sections ?? []);
  const outline = useSectionOutline();
  if (!envui && !app) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={docsHeadings.provides.id}
      className="docs-provides"
      {...pendingAttribute(outline)}
    >
      <SectionHeading heading={docsHeadings.provides} />
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

export const codeGuideContents = (document: DocumentationEntry): TableOfContentsItem[] =>
  guideSubsections(document.sections).map(({ title }) => ({
    id: headingSlug(title),
    label: title,
  }));

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

export function WordsInCode({ document }: { document: DocumentationEntry }) {
  const markdown = wordsInCode(document.sections);
  const outline = useSectionOutline();
  if (!markdown) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={docsHeadings.wordsInCode.id}
      {...pendingAttribute(outline)}
    >
      <SectionHeading heading={docsHeadings.wordsInCode} />
      <PageMarkdown markdown={markdown} path={document.path} />
    </Column>
  );
}

export const colorEntries = (components: readonly string[]) =>
  components.flatMap((name) => {
    const colors = partsOf(name)?.colors ?? [];
    return colors.length ? [{ name, colors }] : [];
  });

export function ColorProperties({ components }: { components: readonly string[] }) {
  const entries = colorEntries(components);
  const outline = useSectionOutline();
  if (!entries.length) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={docsHeadings.colorProperties.id}
      {...pendingAttribute(outline)}
    >
      <SectionHeading heading={docsHeadings.colorProperties} />
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

export function PropsSection({ document }: { document: DocumentationEntry }) {
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={docsHeadings.props.id}
      {...pendingAttribute(useSectionOutline())}
    >
      <SectionHeading heading={docsHeadings.props} />
      <PropsTables document={document} />
    </Column>
  );
}

export function Strings({ document }: { document: DocumentationEntry }) {
  const strings = document.strings ?? [];
  const outline = useSectionOutline();
  if (!strings.length) return null;
  return (
    <Column
      render={<section />}
      gap={5}
      aria-labelledby={docsHeadings.strings.id}
      {...pendingAttribute(outline)}
    >
      <SectionHeading heading={docsHeadings.strings} />
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
