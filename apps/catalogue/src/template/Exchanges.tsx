import { Fragment, useId, type ReactNode } from 'react';
import { Message, Stack, Theme, useTheme } from '@envsemble/envui';
import { Check } from '@envsemble/envui/icons/Check';
import { Close } from '@envsemble/envui/icons/Close';
import type { DocumentationBlock, DocumentationSection } from '../DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import type { Documentation as Document } from '../Reference';
import { AnatomyFigure } from './AnatomyFigure';
import { ExampleCode, ExampleRender, keepLinksInPlace, LiveExample } from './LiveExample';
import { Specimen } from './Specimen';

type ExampleBlock = Extract<DocumentationBlock, { kind: 'example' }>;

/**
 * A do or don't figure: the live example in a frame with a green Do or red Don't bar and its one
 * sentence below, and the example's code under it.
 */
export function VerdictFigure({
  page,
  name,
  verdict,
  caption,
}: {
  page: string;
  name: string;
  verdict: 'do' | 'dont';
  caption: string;
}) {
  const theme = useTheme();
  const label = verdict === 'do' ? 'Do' : 'Don’t';
  const id = useId();
  return (
    // Named by its bar and its sentence, each read once.
    <figure
      className="docs-verdict"
      data-verdict={verdict}
      aria-labelledby={`${id}-verdict ${id}-caption`}
    >
      <div className="docs-verdict-frame">
        <Stack
          render={<Theme {...theme} />}
          gap={0}
          className="docs-verdict-stage"
          data-example={name}
          {...keepLinksInPlace}
        >
          <ExampleRender page={page} name={name} />
        </Stack>
        <div className="docs-verdict-bar" id={`${id}-verdict`}>
          {verdict === 'do' ? <Check /> : <Close />}
          <span>{label}</span>
        </div>
      </div>
      <figcaption className="docs-verdict-caption" id={`${id}-caption`}>
        {caption}
      </figcaption>
      <ExampleCode page={page} name={name} />
    </figure>
  );
}

/** One figure of an answer, by its kind. */
function Figure({ page, block }: { page: Document; block: ExampleBlock }) {
  if (block.role === 'do' || block.role === 'dont')
    return (
      <VerdictFigure
        page={page.id}
        name={block.name}
        verdict={block.role}
        caption={block.caption ?? ''}
      />
    );
  if (block.role === 'anatomy')
    return (
      <AnatomyFigure
        page={page.id}
        name={block.name}
        title={block.heading}
        caption={block.caption}
        legend={block.legend}
        of={block.of ?? page.title}
      />
    );
  return (
    <LiveExample
      page={page.id}
      name={block.name}
      title={block.heading}
      caption={block.caption}
      widths={block.widths}
    />
  );
}

/**
 * Markdown cut where a run of `###` subsections each holds only a list, such as what envUI provides
 * and what you provide: such a run is laid out in columns, the rest as it is written.
 */
export function splitColumns(markdown: string): (string | string[])[] {
  const chunks: string[] = [''];
  let fence: string | undefined;
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)?.[1];
    if (marker && (!fence || (marker[0] === fence[0] && marker.length >= fence.length)))
      fence = fence ? undefined : marker;
    if (!fence && /^### /.test(line)) chunks.push('');
    chunks[chunks.length - 1] += `${line}\n`;
  }
  const listOnly = (chunk: string) => {
    if (!/^### /.test(chunk)) return false;
    const body = chunk
      .split('\n')
      .slice(1)
      .filter((line) => line.trim());
    return (
      body.length > 0 &&
      /^([-*+]|\d+[.)]) /.test(body[0]) &&
      body.every((line) => /^(\s+\S|[-*+] |\d+[.)] )/.test(line))
    );
  };
  const pieces: (string | string[])[] = [];
  for (const chunk of chunks) {
    const last = pieces.at(-1);
    if (listOnly(chunk)) {
      if (Array.isArray(last)) last.push(chunk);
      else pieces.push([chunk]);
    } else if (typeof last === 'string') pieces[pieces.length - 1] = last + chunk;
    else pieces.push(chunk);
  }
  // A single list stays in the flow; two or more sit side by side.
  return pieces
    .flatMap((piece) => (Array.isArray(piece) && piece.length < 2 ? piece : [piece]))
    .reduce<(string | string[])[]>((merged, piece) => {
      const last = merged.at(-1);
      if (typeof piece === 'string' && typeof last === 'string')
        merged[merged.length - 1] = last + piece;
      else merged.push(piece);
      return merged;
    }, [])
    .filter((piece) => typeof piece !== 'string' || piece.trim());
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

/** An answer's Markdown, with runs of lists in columns. */
export function ExchangeColumns({ markdown, path }: { markdown: string; path: string }) {
  return (
    <>
      {splitColumns(markdown).map((piece, index) =>
        typeof piece === 'string' ? (
          <Documentation key={index} markdown={piece} path={path} />
        ) : (
          <div key={index} className="docs-exchange-columns">
            {piece.map((column, part) => (
              <div key={part} className="docs-exchange-column">
                <Documentation markdown={column} path={path} />
              </div>
            ))}
          </div>
        ),
      )}
    </>
  );
}

/**
 * The blocks of a section in the order they are written, with figures that follow each other, such
 * as a do and a don't, side by side; Markdown that is only blank lines between them doesn't count.
 */
function groupFigures(blocks: DocumentationBlock[]) {
  const groups: (DocumentationBlock | ExampleBlock[])[] = [];
  for (const block of blocks) {
    if (block.kind === 'markdown' && !block.markdown.trim()) continue;
    const last = groups.at(-1);
    const figure = block.kind === 'example' && block.role !== 'anatomy' && !block.widths;
    if (figure && Array.isArray(last)) last.push(block);
    else groups.push(figure ? [block] : block);
  }
  return groups;
}

/** A question's text, with its `code` spans as code. */
function questionText(text: string) {
  return text
    .split(/`([^`]+)`/)
    .map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));
}

/**
 * One section of a page of exchanges: its heading, then each question as a compact Message at the
 * inline end, and its answer as full-width content with its figures. `lead` comes right after the
 * first question, before the authored answer.
 */
export function ExchangeSection({
  reference,
  section,
  lead,
}: {
  reference: Document;
  section: DocumentationSection;
  lead?: ReactNode;
}) {
  const turns: { question?: string; content: ReactNode[] }[] = [{ content: [] }];
  const groups = groupFigures(section.blocks);
  /** Subsections of text shown beside the figure at an index of groups. */
  const beside = new Map<number, string>();
  groups.forEach((group, index) => {
    if (!Array.isArray(group) && group.kind === 'question') {
      turns.push({
        question: group.text,
        content: turns.length === 1 && lead ? [<Fragment key="lead">{lead}</Fragment>] : [],
      });
      return;
    }
    const content = turns.at(-1)!.content;
    const text = beside.get(index);
    if (Array.isArray(group) && text !== undefined)
      content.push(
        <div key={index} className="docs-exchange-split">
          <div>
            <Documentation markdown={text} path={reference.path} />
          </div>
          <Figure page={reference} block={group[0]} />
        </div>,
      );
    else if (Array.isArray(group))
      content.push(
        group.length === 1 ? (
          <Figure key={index} page={reference} block={group[0]} />
        ) : (
          <div
            key={index}
            className="docs-figure-run"
            data-count={group.length}
            data-verdicts={group.every((block) => block.role) || undefined}
          >
            {group.map((block) => (
              <Figure key={block.name} page={reference} block={block} />
            ))}
          </div>
        ),
      );
    else if (group.kind === 'markdown') {
      // A last subsection of text with one figure after it sits beside that figure.
      const next = groups[index + 1];
      const split = Array.isArray(next) && next.length === 1 && lastSubsection(group.markdown);
      if (split) {
        if (split[0].trim())
          content.push(<ExchangeColumns key={index} markdown={split[0]} path={reference.path} />);
        beside.set(index + 1, split[1]);
      } else
        content.push(
          <ExchangeColumns key={index} markdown={group.markdown} path={reference.path} />,
        );
    } else if (group.kind === 'example')
      content.push(<Figure key={index} page={reference} block={group} />);
    else if (group.kind === 'specimen')
      content.push(<Specimen key={index} page={reference.id} name={group.name} headingLevel={3} />);
  });
  const [heading, first, ...followUps] = turns;
  const question = (text: string) => (
    // A Message is an article; the section it asks about names it.
    <Message
      from="self"
      className="docs-exchange-question"
      aria-label={`Question on ${section.title.toLowerCase()}`}
    >
      {questionText(text)}
    </Message>
  );
  // A section without a question, the changelog, is its Markdown alone.
  if (!first) return <section data-section={section.id}>{heading.content}</section>;
  return (
    <section className="docs-exchange" data-section={section.id}>
      <div className="docs-exchange-header">
        <div className="docs-exchange-heading">{heading.content}</div>
        {question(first.question!)}
      </div>
      <div className="docs-exchange-answer">{first.content}</div>
      {followUps.map(({ question: text, content }, index) => (
        <div key={index} className="docs-exchange-turn">
          {question(text!)}
          <div className="docs-exchange-answer">{content}</div>
        </div>
      ))}
    </section>
  );
}
