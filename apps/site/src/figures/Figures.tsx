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
import { partKey } from '../documentation/PartKeys';

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
  const part = partKey('figure', page.id, block.name);
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

function BlockFigure({
  page,
  block,
  options,
  live = false,
}: {
  page: DocumentationEntry;
  block: PlacedBlock;
  options?: OptionTable;
  live?: boolean;
}) {
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

function presentationOf(block: ExampleBlock, live: boolean): Presentation | undefined {
  const { motion, widths, sweep, classes, fit, open, device } = block;
  if (motion) return { kind: 'motion', device };
  if (widths && sweep) return { kind: 'sweep', widths, classes, fit };
  if (widths) return { kind: 'widths', widths };
  if (open) return { kind: 'open', live };
  return device && { kind: 'device', device };
}

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

function groupFigures(
  blocks: DocumentationBlock[],
  figures: Record<string, FoundationFigureEntry> | undefined,
) {
  const groups: (DocumentationBlock | PlacedBlock[])[] = [];
  for (const block of blocks) {
    if (block.kind === 'markdown' && !block.markdown.trim()) continue;
    const last = groups.at(-1);
    const sitsSideBySide =
      (block.kind === 'example' &&
        block.role !== 'anatomy' &&
        block.role !== 'variants' &&
        !block.widths &&
        !block.wide) ||
      (block.kind === 'figure' && !figures?.[block.name]?.wide);
    if (sitsSideBySide && Array.isArray(last)) last.push(block);
    else groups.push(sitsSideBySide ? [block] : block);
  }
  return groups;
}

export function sectionTitle(section: DocumentationSection): string {
  const first = section.blocks[0];
  return first?.kind === 'markdown' ? (first.markdown.split('\n')[0] ?? '') : '';
}

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
  const live = section.id === 'overview';
  const figure = (block: PlacedBlock, key?: string | number) => (
    <BlockFigure key={key} page={page} block={block} live={live} />
  );
  const outline = useSectionOutline();
  const subsectionBesideGroup = new Map<number, string>();
  const content: ReactNode[] = lead && !leadAfter ? [<Fragment key="lead">{lead}</Fragment>] : [];
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
    const text = subsectionBesideGroup.get(index);
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
      const previous = groups[index - 1];
      const followsAnatomy =
        previous &&
        !Array.isArray(previous) &&
        previous.kind === 'example' &&
        previous.role === 'anatomy';
      const isOneParagraph = leadParagraph(text)?.[1].trim() === '';
      const isNoteToAnatomy = followsAnatomy && isOneParagraph;
      if (isNoteToAnatomy) {
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
      const next = groups[index + 1];
      const split = Array.isArray(next) && next.length === 1 && lastSubsection(text);
      if (split) {
        if (split[0].trim()) content.push(markdown(index, split[0]));
        subsectionBesideGroup.set(index + 1, split[1]);
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
