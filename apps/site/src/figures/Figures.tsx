import { Fragment, useMemo, useRef, type ReactNode } from 'react';
import type {
  DocumentationBlock,
  DocumentationSection,
  ExampleBlock,
  FoundationFigureBlock,
  PlacedBlock,
} from '../documentation/DocumentationTypes';
import { PageMarkdown } from '../markdown/PageMarkdown';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import { AnatomyFigure } from './anatomy/AnatomyFigure';
import { LiveExample, type Presentation } from './LiveExample';
import { VerdictFigure } from './VerdictFigure';
import { MarkdownWithLegends } from '../markdown/MarkdownWithLegends';
import {
  lastSubsection,
  leadParagraph,
  optionPieces,
  type OptionTable,
} from '../documentation/CatalogueContent';
import { Specimen } from './Specimen';
import { useFoundationFigures, type FoundationFigureEntry } from './foundations/FoundationFigures';
import { FigureCode, FigurePart } from './foundations/FoundationFrame';
import { pendingAttribute, useSectionOutline } from '../markdown/SectionOutline';
import { classNames } from '../shared/Attributes';
import { StageSkeleton } from '../loading/Skeletons';
import { useSubjectShown } from './useSubjectShown';

/**
 * A foundation's figure: the catalogue's own, registered for its page (FoundationFigures.ts),
 * with the legend its Markdown gives it, and its code where it has an example file of its name.
 */
function FoundationFigure({
  page,
  block,
}: {
  page: DocumentationEntry;
  block: FoundationFigureBlock;
}) {
  const figure = useFoundationFigures(page.id)?.[block.name];
  const code = useMemo(
    () => (block.code ? { page: page.id, name: block.name } : null),
    [block.code, block.name, page.id],
  );
  const place = useRef<HTMLDivElement>(null);
  const shown = useSubjectShown(place);
  if (!figure) return null;
  const part = `figure:${page.id}/${block.name}`;
  // On a pre-rendered page, the figure's place is held until it renders (useSubjectShown).
  if (!shown) return <StageSkeleton ref={place} part={part} what="figures" stage />;
  const Render = figure.render;
  return (
    <FigurePart value={part}>
      <FigureCode value={code}>
        <Render legend={block.legend ?? []} caption={block.caption} />
      </FigureCode>
    </FigurePart>
  );
}

/**
 * One figure of a section, by its kind. `options` is the option table right after a variants
 * figure, which it shows as its legend.
 */
function BlockFigure({
  page,
  block,
  options,
  live = false,
}: {
  page: DocumentationEntry;
  block: PlacedBlock;
  options?: OptionTable;
  /** Whether a figure shown open is live, as the Overview's are: the component, open, to use. */
  live?: boolean;
}) {
  // A section waiting its turn to show renders its headings alone (SectionOutline).
  if (useSectionOutline()) return null;
  if (block.kind === 'figure') return <FoundationFigure page={page} block={block} />;
  if (block.role === 'do' || block.role === 'dont' || block.role === 'caution')
    return (
      <VerdictFigure
        page={page.id}
        name={block.name}
        verdict={block.role}
        caption={block.caption ?? ''}
        shows={block.motion ? 'motion' : block.open ? 'open' : 'example'}
        wide={Boolean(block.wide)}
        stage={block.stage}
      />
    );
  if (block.role === 'anatomy' || block.role === 'variants')
    return (
      <AnatomyFigure
        page={page.id}
        name={block.name}
        title={block.heading}
        caption={block.caption}
        legend={block.legend}
        of={block.of ?? page.title}
        open={block.open}
        enlarge={block.enlarge}
        specimen={block.specimen}
        stage={block.stage}
        variants={block.role === 'variants'}
        options={options}
        width={block.width}
      />
    );
  return (
    <LiveExample
      page={page.id}
      name={block.name}
      title={block.heading}
      caption={block.caption}
      presentation={presentationOf(block, live)}
      stage={block.stage}
    />
  );
}

/**
 * How a live example's figure shows it, by its fence's attributes: played where it takes
 * `motion`, whatever else it takes; else in frames of its `widths`, sweeping or one to a row;
 * else open, or on its device.
 */
function presentationOf(block: ExampleBlock, live: boolean): Presentation | undefined {
  const { motion, widths, sweep, classes, fit, open, device } = block;
  if (motion) return { kind: 'motion', device };
  if (widths && sweep) return { kind: 'sweep', widths, classes, fit };
  if (widths) return { kind: 'widths', widths };
  if (open) return { kind: 'open', live };
  return device && { kind: 'device', device };
}

/**
 * A component's figure at the top of its Usage in the Docs: its catalogue's first overview
 * example, live as the Overview shows it, without its code, which Usage gives right under it. It
 * is the one figure a Docs page shows, so a reader sees what the code makes without switching
 * parts; the catalogue's Overview section itself isn't repeated.
 */
export function UsageFigure({ page }: { page: DocumentationEntry }) {
  const block = page.sections
    ?.find((section) => section.id === 'overview')
    ?.blocks.find((item): item is ExampleBlock => item.kind === 'example');
  if (!block) return null;
  return (
    <div className="docs-usage-figure">
      <LiveExample
        page={page.id}
        name={block.name}
        title={block.heading}
        presentation={
          block.open
            ? { kind: 'open', live: true }
            : block.device && { kind: 'device', device: block.device }
        }
        stage={block.stage}
        code={false}
      />
    </div>
  );
}

/**
 * The blocks of a section in the order they are written, with figures that follow each other, such
 * as a do and a don't, side by side; Markdown that is only blank lines between them doesn't count.
 */
function groupFigures(
  blocks: DocumentationBlock[],
  figures: Record<string, FoundationFigureEntry> | undefined,
) {
  const groups: (DocumentationBlock | PlacedBlock[])[] = [];
  for (const block of blocks) {
    if (block.kind === 'markdown' && !block.markdown.trim()) continue;
    const last = groups.at(-1);
    // A figure that needs the whole column, such as a foundation's run of pictures or an example
    // marked wide, stands alone.
    const figure =
      (block.kind === 'example' &&
        block.role !== 'anatomy' &&
        block.role !== 'variants' &&
        !block.widths &&
        !block.wide) ||
      (block.kind === 'figure' && !figures?.[block.name]?.wide);
    if (figure && Array.isArray(last)) last.push(block);
    else groups.push(figure ? [block] : block);
  }
  return groups;
}

/**
 * A section's "## Title" line, which its first Markdown block opens with and its heading shows;
 * empty where it opens otherwise.
 */
export function sectionTitle(section: DocumentationSection): string {
  const first = section.blocks[0];
  return first?.kind === 'markdown' ? (first.markdown.split('\n')[0] ?? '') : '';
}

/**
 * One section of a page: its heading, then its content in the order it is
 * written, with figures that follow each other side by side and a subsection beside its one
 * figure. `lead` comes right after the heading, before the authored content, or with `leadAfter`
 * after the section's own lead paragraph, as Use it when follows a page's Rules lead.
 * `headingHidden` keeps the heading for the page's contents and assistive technology alone.
 */
export function FigureSection({
  page,
  section,
  lead,
  leadAfter = false,
  headingHidden = false,
}: {
  page: DocumentationEntry;
  section: DocumentationSection;
  lead?: ReactNode;
  leadAfter?: boolean;
  headingHidden?: boolean;
}) {
  const blocks = [...section.blocks];
  const title = sectionTitle(section);
  const first = blocks[0];
  if (first?.kind === 'markdown')
    blocks[0] = { kind: 'markdown', markdown: first.markdown.split('\n').slice(1).join('\n') };
  // An option table right after a variants figure is the figure's legend: each variant's name,
  // which its callout tags, followed by what it is for.
  const options = new Map<string, OptionTable>();
  blocks.forEach((block, index) => {
    const next = blocks[index + 1];
    if (block.kind !== 'example' || block.role !== 'variants' || next?.kind !== 'markdown') return;
    const pieces = optionPieces(next.markdown);
    const lead = pieces.findIndex((piece) => !('markdown' in piece) || piece.markdown.trim());
    const table = pieces[lead];
    if (!table || !('options' in table)) return;
    options.set(block.name, table.options);
    blocks[index + 1] = {
      kind: 'markdown',
      markdown: pieces
        .slice(lead + 1)
        .map((piece) => ('markdown' in piece ? piece.markdown : piece.raw))
        .join(''),
    };
  });
  const groups = groupFigures(blocks, useFoundationFigures(page.id));
  // The Overview's figures shown open are the components at rest, open, which people can use.
  const live = section.id === 'overview';
  const figure = (block: PlacedBlock, key?: string | number) => (
    <BlockFigure key={key} page={page} block={block} live={live} />
  );
  const outline = useSectionOutline();
  /** Subsections of text shown beside the figure at an index of groups. */
  const beside = new Map<number, string>();
  const content: ReactNode[] = lead && !leadAfter ? [<Fragment key="lead">{lead}</Fragment>] : [];
  /** Shows `lead` after the section's own lead paragraph, or first where it has none. */
  let leadShown = !lead || !leadAfter;
  const showLead = () => {
    if (!leadShown) content.push(<Fragment key="lead">{lead}</Fragment>);
    leadShown = true;
  };
  const markdown = (key: number, text: string) => (
    <MarkdownWithLegends key={key} markdown={text} path={page.path} />
  );
  groups.forEach((group, index) => {
    const opensWithLead =
      index === 0 &&
      !Array.isArray(group) &&
      group.kind === 'markdown' &&
      leadParagraph(group.markdown);
    if (!opensWithLead) showLead();
    const text = beside.get(index);
    if (Array.isArray(group) && text !== undefined)
      content.push(
        <div key={index} className="site-figure-split">
          <div>
            <PageMarkdown markdown={text} path={page.path} />
          </div>
          {figure(group[0])}
        </div>,
      );
    else if (Array.isArray(group))
      content.push(
        group.length === 1 ? (
          figure(group[0], index)
        ) : (
          <div
            key={index}
            className="site-figure-run"
            data-count={group.length}
            data-verdicts={
              group.every((block) => block.kind === 'example' && block.role) || undefined
            }
          >
            {group.map((block) => figure(block, block.name))}
          </div>
        ),
      );
    else if (group.kind === 'markdown') {
      let text = group.markdown;
      // The paragraph that opens a section is its lead.
      const lead = index === 0 && leadParagraph(text);
      if (lead) {
        content.push(
          <PageMarkdown
            key="section-lead"
            markdown={lead[0]}
            path={page.path}
            className="site-lead"
          />,
        );
        text = lead[1];
        showLead();
      }
      // The sentence after an anatomy legend, on the parts the figure can't show, is a note to it.
      const previous = groups[index - 1];
      if (
        previous &&
        !Array.isArray(previous) &&
        previous.kind === 'example' &&
        previous.role === 'anatomy' &&
        leadParagraph(text)?.[1].trim() === ''
      ) {
        content.push(
          <PageMarkdown
            key={index}
            markdown={text}
            path={page.path}
            className="site-figure-note"
          />,
        );
        return;
      }
      // A last subsection of text with one figure after it sits beside that figure.
      const next = groups[index + 1];
      const split = Array.isArray(next) && next.length === 1 && lastSubsection(text);
      if (split) {
        if (split[0].trim()) content.push(markdown(index, split[0]));
        beside.set(index + 1, split[1]);
      } else if (text.trim()) content.push(markdown(index, text));
    } else if (group.kind === 'example' || group.kind === 'figure')
      content.push(
        <BlockFigure
          key={index}
          page={page}
          block={group}
          options={options.get(group.name)}
          live={live}
        />,
      );
    else if (group.kind === 'specimen' && !outline)
      content.push(<Specimen key={index} page={page.id} name={group.name} headingLevel={3} />);
  });
  showLead();
  // The changelog is its Markdown alone.
  if (section.id === 'changelog')
    return (
      <section data-section={section.id} {...pendingAttribute(outline)}>
        <PageMarkdown markdown={title} path={page.path} />
        {content}
      </section>
    );
  return (
    <section
      className="site-figure-section"
      data-section={section.id}
      {...pendingAttribute(outline)}
    >
      <div
        className={classNames(
          'site-figure-section-heading',
          headingHidden && 'site-visually-hidden',
        )}
      >
        <PageMarkdown markdown={title} path={page.path} />
      </div>
      {content}
    </section>
  );
}
