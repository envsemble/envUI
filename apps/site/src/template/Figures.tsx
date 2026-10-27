import {
  Fragment,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { Column, Theme, useTheme } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { Close } from '@envsemble/envui/icons/Close';
import { Warning } from '@envsemble/envui/icons/Warning';
import type { DocumentationBlock, DocumentationSection, StageFill } from '../DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import type { Documentation as Document } from '../Reference';
import { AnatomyFigure } from './AnatomyFigure';
import { CodeSlot, ExampleCode, ExampleRender, keepLinksInPlace, LiveExample } from './LiveExample';
import { OpenExample } from './OpenExample';
import { SiteMarkdown } from './OptionLegend';
import { optionPieces, type OptionTable } from '../shared/CatalogueContent';
import { InteractiveMark } from './InteractiveMark';
import { Specimen, SpecimenRender } from './Specimen';
import { VerdictMotion } from '../previews/MotionStage';
import { foundationFigure } from '../previews/foundations/FoundationFigures';
import { useVerdictFit } from './VerdictFit';

type ExampleBlock = Extract<DocumentationBlock, { kind: 'example' }>;
type FoundationBlock = Extract<DocumentationBlock, { kind: 'figure' }>;
type FigureBlock = ExampleBlock | FoundationBlock;

/**
 * A foundation's figure: the catalogue's own, from its page's preview,
 * with the legend its Markdown gives it.
 */
function FoundationFigure({ page, block }: { page: Document; block: FoundationBlock }) {
  const figure = foundationFigure(page.id, block.name);
  if (!figure) return null;
  const Render = figure.render;
  return <Render legend={block.legend ?? []} caption={block.caption} />;
}

/** The bar under a do, a don't or a caution: its word and its icon. */
const verdicts = {
  do: { label: 'Do', icon: <Check /> },
  dont: { label: 'Don’t', icon: <Close /> },
  caution: { label: 'Caution', icon: <Warning /> },
};

/**
 * A do, don't or caution figure: the live example on a square stage with a green Do, red Don't or
 * amber Caution bar, a caution being acceptable with care rather than a mistake, and its one
 * sentence below, and the example's code under it. The example is drawn smaller where it
 * needs more room than the square (useVerdictFit). With `motion`, its animated specimen of the same
 * name plays it on the stage. A `wide` figure, whose point is a change across the column's width,
 * keeps a stage as wide as the column and as tall as its example. A foundation page's preview
 * passes its sample as `children` instead, which has no code of its own.
 */
export function VerdictFigure({
  page,
  name,
  verdict,
  caption,
  open = false,
  motion = false,
  wide = false,
  children,
  stage,
}: {
  verdict: 'do' | 'dont' | 'caution';
  caption: string;
  /** Whether the example's overlays are shown open, as a picture. */
  open?: boolean;
  /** Whether its animated specimen of the same name plays the example in place of the stage. */
  motion?: boolean;
  /** Whether it keeps a stage as wide as the column, rather than a square. */
  wide?: boolean;
  /** The stage's fill, where the page's would hide the subject. */
  stage?: StageFill;
} & (
  | { page: string; name: string; children?: never }
  | { page?: never; name?: never; children: ReactNode }
)) {
  const theme = useTheme();
  const { label, icon } = verdicts[verdict];
  const id = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useVerdictFit(stageRef, box, !wide && !(motion && page));
  return (
    // Named by its bar and its sentence, each read once.
    <figure
      className="site-verdict"
      data-verdict={verdict}
      data-shape={wide ? 'wide' : 'square'}
      aria-labelledby={`${id}-verdict ${id}-caption`}
    >
      {/* The stage and the bar are two connected rows: envUI's connected-row parts give the outer
          corners the large radius and the inner ones the small radius. */}
      <div className="site-verdict-frame env-connected-rows">
        {motion && page ? (
          <VerdictMotion value={wide ? 'wide' : 'square'}>
            <SpecimenRender page={page} name={name ?? ''} />
          </VerdictMotion>
        ) : (
          <Column
            ref={stageRef}
            render={<Theme {...theme} />}
            gap={0}
            className="site-verdict-stage env-connected-row"
            data-example={name}
            data-stage={stage}
            {...keepLinksInPlace}
          >
            <div ref={box} className="site-verdict-fit">
              {!page ? (
                children
              ) : open ? (
                <OpenExample name={name ?? ''}>
                  <ExampleRender page={page} name={name ?? ''} />
                </OpenExample>
              ) : (
                <ExampleRender page={page} name={name ?? ''} />
              )}
            </div>
            <InteractiveMark enabled={!open} />
          </Column>
        )}
        <div className="site-verdict-bar env-connected-row" id={`${id}-verdict`}>
          {icon}
          <span>{label}</span>
        </div>
      </div>
      <figcaption className="site-verdict-caption" id={`${id}-caption`}>
        {caption}
      </figcaption>
      {page && <ExampleCode page={page} name={name ?? ''} />}
    </figure>
  );
}

/**
 * One figure of a section, by its kind. `options` is the option table right after a variants
 * figure, which it shows as its legend.
 */
function Figure({
  page,
  block,
  options,
}: {
  page: Document;
  block: FigureBlock;
  options?: OptionTable;
}) {
  if (block.kind === 'figure') return <FoundationFigure page={page} block={block} />;
  if (block.role === 'do' || block.role === 'dont' || block.role === 'caution')
    return (
      <VerdictFigure
        page={page.id}
        name={block.name}
        verdict={block.role}
        caption={block.caption ?? ''}
        open={block.open}
        motion={block.motion}
        wide={block.wide}
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
      widths={block.widths}
      sweep={block.sweep}
      classes={block.classes}
      fit={block.fit}
      open={block.open}
      stage={block.stage}
      motion={block.motion}
    />
  );
}

/**
 * Markdown cut before its last `###` subsection, when that subsection is text a figure can sit
 * beside: no table, no fence, and not only a list.
 */
export function lastSubsection(markdown: string): [string, string] | undefined {
  const lines = markdown.split('\n');
  let fence = false;
  let start = -1;
  lines.forEach((line, index) => {
    if (/^\s{0,3}(`{3,}|~{3,})/.test(line)) fence = !fence;
    if (!fence && /^### /.test(line)) start = index;
  });
  if (start === -1) return undefined;
  const body = lines.slice(start + 1).filter((line) => line.trim());
  if (!body.length || body.some((line) => /^\s*(\||`{3,}|~{3,})/.test(line))) return undefined;
  if (/^([-*+]|\d+[.)]) /.test(body[0])) return undefined;
  return [lines.slice(0, start).join('\n'), lines.slice(start).join('\n')];
}

/**
 * Markdown cut after the paragraph that opens it, when it opens with one: a section's lead, which
 * the catalogue sets larger than the text below it (CatalogueText.css).
 */
export function leadParagraph(markdown: string): [string, string] | undefined {
  const text = markdown.replace(/^(?:[ \t]*\n)+/, '');
  if (!text.trim() || /^\s{0,3}(#|\||[-*+] |\d+[.)] |`{3,}|~{3,}|<!--)/.test(text))
    return undefined;
  const end = text.search(/\n[ \t]*\n/);
  return end === -1 ? [text, ''] : [text.slice(0, end), text.slice(end)];
}

/**
 * The blocks of a section in the order they are written, with figures that follow each other, such
 * as a do and a don't, side by side; Markdown that is only blank lines between them doesn't count.
 */
function groupFigures(blocks: DocumentationBlock[], page: string) {
  const groups: (DocumentationBlock | FigureBlock[])[] = [];
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
      (block.kind === 'figure' && !foundationFigure(page, block.name)?.wide);
    if (figure && Array.isArray(last)) last.push(block);
    else groups.push(figure ? [block] : block);
  }
  return groups;
}

/**
 * Cells that share a row, figures side by side or a subsection beside its figure, and below them a
 * slot across the whole content column where their open code shows.
 */
function SharedRow(props: ComponentPropsWithoutRef<'div'>) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  return (
    <div className="site-shared-row">
      <CodeSlot value={slot}>
        <div {...props} />
      </CodeSlot>
      <div ref={setSlot} className="site-code-slot" />
    </div>
  );
}

/**
 * One section of a page: its heading, then its content in the order it is
 * written, with figures that follow each other side by side and a subsection beside its one
 * figure. `lead` comes right after the heading, before the authored content, or with `leadAfter`
 * after the section's own lead paragraph, as Use it when follows a page's Rules lead.
 */
export function FigureSection({
  reference,
  section,
  lead,
  leadAfter = false,
}: {
  reference: Document;
  section: DocumentationSection;
  lead?: ReactNode;
  leadAfter?: boolean;
}) {
  const blocks = [...section.blocks];
  // The first Markdown block opens with the section's "## Title" line, which the heading shows.
  const first = blocks[0];
  const [title, ...intro] = first?.kind === 'markdown' ? first.markdown.split('\n') : [''];
  if (first?.kind === 'markdown') blocks[0] = { kind: 'markdown', markdown: intro.join('\n') };
  // An option table right after a variants figure is the figure's legend: each variant's name in
  // the tag its callout shows, followed by what it is for.
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
  const groups = groupFigures(blocks, reference.id);
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
    <SiteMarkdown key={key} markdown={text} path={reference.path} />
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
        <SharedRow key={index} className="site-figure-split">
          <div>
            <Documentation markdown={text} path={reference.path} />
          </div>
          <Figure page={reference} block={group[0]} />
        </SharedRow>,
      );
    else if (Array.isArray(group))
      content.push(
        group.length === 1 ? (
          <Figure key={index} page={reference} block={group[0]} />
        ) : (
          <SharedRow
            key={index}
            className="site-figure-run"
            data-count={group.length}
            data-verdicts={
              group.every((block) => block.kind === 'example' && block.role) || undefined
            }
          >
            {group.map((block) => (
              <Figure key={block.name} page={reference} block={block} />
            ))}
          </SharedRow>
        ),
      );
    else if (group.kind === 'markdown') {
      let text = group.markdown;
      // The paragraph that opens a section is its lead.
      const lead = index === 0 && leadParagraph(text);
      if (lead) {
        content.push(
          <Documentation
            key="section-lead"
            markdown={lead[0]}
            path={reference.path}
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
          <Documentation
            key={index}
            markdown={text}
            path={reference.path}
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
        <Figure key={index} page={reference} block={group} options={options.get(group.name)} />,
      );
    else if (group.kind === 'specimen')
      content.push(<Specimen key={index} page={reference.id} name={group.name} headingLevel={3} />);
  });
  showLead();
  // The changelog is its Markdown alone.
  if (section.id === 'changelog')
    return (
      <section data-section={section.id}>
        <Documentation markdown={title} path={reference.path} />
        {content}
      </section>
    );
  return (
    <section className="site-figure-section" data-section={section.id}>
      <div className="site-figure-section-heading">
        <Documentation markdown={title} path={reference.path} />
      </div>
      {content}
    </section>
  );
}
