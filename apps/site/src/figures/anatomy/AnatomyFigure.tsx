/*
 * An anatomy figure (Figures.tsx): the live component on its stage, the callouts on its parts
 * (useAnatomyLayout.ts) and its legend of part names, or a variants figure's names by its items.
 */
import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { Theme, useTheme } from '@envsemble/envui';
import type { AnatomyLegendItem, StageFill } from '@docs-model/DocumentationTypes';
import { legendName, type OptionTable } from '@docs-model/CatalogueContent';
import { PageMarkdown } from '../../pages/PageMarkdown';
import { FitFrame } from '../../fit/standalone/WidthFit';
import { OptionLegend } from '../../template/OptionLegend';
import { legendOf, partDescription } from '../../template/Parts';
import { ExampleCode, ExampleRender } from '../LiveExample';
import { OpenExample } from '../OpenExample';
import { ExamplePlayback } from '../Specimen';
import type { Callout } from './PlaceCallouts';
import { useAnatomyLayout } from './useAnatomyLayout';

/**
 * The callouts' lines, each from its badge to its part, with a region's outline, which gives way
 * across a label it runs through, such as a floated label (`maskId` names the masks).
 */
function CalloutLines({ callouts, maskId }: { callouts: Callout[]; maskId: string }) {
  return (
    <svg className="site-anatomy-lines" aria-hidden="true">
      {callouts.map(({ number, badge, anchor, box, gaps }) => (
        <g key={number}>
          {/* The outline gives way across a label it runs through, such as a floated label. */}
          {gaps && (
            <mask id={`${maskId}-${number}`} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {gaps.map((gap, index) => (
                <rect key={index} {...gap} fill="black" />
              ))}
            </mask>
          )}
          {box && (
            <g mask={gaps && `url(#${maskId}-${number})`}>
              {['site-anatomy-box-rim', 'site-anatomy-box'].map((className) => (
                <rect
                  key={className}
                  className={className}
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  rx={3}
                />
              ))}
            </g>
          )}
          <line x1={badge.x} y1={badge.y} x2={anchor.x} y2={anchor.y} />
          <circle cx={anchor.x} cy={anchor.y} r={3} />
        </g>
      ))}
    </svg>
  );
}

/**
 * The callouts' badges, or a variants figure's names, and beside or under each variant what it
 * is for, placed in physical coordinates, in either direction.
 */
function CalloutLabels({ callouts }: { callouts: Callout[] }) {
  return (
    <>
      {callouts.map(({ number, badge, label, side }) => (
        <span
          key={number}
          className={label === undefined ? 'site-anatomy-badge' : 'catalogue-variant-label'}
          data-side={side}
          aria-hidden="true"
          // Measured in physical coordinates, in either direction.
          style={{ left: badge.x, top: badge.y }}
        >
          {label ?? number}
        </span>
      ))}
      {callouts.map(
        ({ number, use }) =>
          use && (
            <span
              key={`use-${number}`}
              className="catalogue-variant-use"
              data-side={use.side}
              aria-hidden="true"
              style={{ left: use.x, top: use.y, inlineSize: use.width }}
            >
              {use.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </span>
          ),
      )}
    </>
  );
}

/**
 * The component in the theme the reader has chosen, on the recessed canvas, following it as it
 * changes, with its callouts measured from its live parts.
 */
function AnatomyStage({
  page,
  name,
  legend,
  open,
  enlarged,
  specimen,
  stage: fill,
  variants,
  width,
  onOrder,
  uses,
  onBeside,
}: {
  page: string;
  name: string;
  legend: AnatomyLegendItem[];
  /** In a variants figure, what each legend item's variant is for, in lines (layOutVariants). */
  uses?: (string[] | undefined)[];
  /** Hears whether what each variant is for shows beside it. */
  onBeside?: (beside: boolean) => void;
  /**
   * Hears the legend's items in the order the callouts number them, and those the legend names
   * alone, such as a field around its control.
   */
  onOrder: (order: number[], whole: number[]) => void;
  open: boolean;
  /** Whether the subject shows half as large again, though it isn't small. */
  enlarged: boolean;
  /** Whether the subject is the example's specimen of the same name, held in a moment. */
  specimen: boolean;
  stage?: StageFill;
  /** Whether the callouts name the variants rather than number the parts. */
  variants: boolean;
  /** The width, in rem, the subject needs to show its parts. */
  width?: number;
}) {
  const theme = useTheme();
  // An id for the outlines' masks that a url() reference takes as it is.
  const maskId = `anatomy${useId().replace(/[^\w-]/g, '')}`;
  const stage = useRef<HTMLDivElement>(null);
  const subject = useRef<HTMLDivElement>(null);
  const { callouts, room } = useAnatomyLayout(stage, subject, {
    legend,
    open,
    enlarged,
    variants,
    uses,
    onOrder,
    onBeside,
  });
  const example = specimen ? (
    <ExamplePlayback page={page} name={name} onStage />
  ) : (
    <ExampleRender page={page} name={name} />
  );
  const render = open ? <OpenExample name={name}>{example}</OpenExample> : example;
  return (
    <Theme
      {...theme}
      ref={stage}
      className="site-anatomy-stage"
      data-example={name}
      data-stage={fill}
    >
      {/* A picture of the parts: the live component neither takes focus nor changes under it. A
          variants figure keeps room beside or under its items for their names. */}
      <div
        ref={subject}
        className="site-anatomy-subject"
        inert
        style={
          variants
            ? {
                paddingInlineStart: room.start || undefined,
                paddingInlineEnd: room.end || undefined,
                paddingBlockEnd: room.bottom || undefined,
                // With what each variant is for under its item, the items line up at the start,
                // beside their names' column, as a list's rows do.
                justifyItems: room.under ? 'start' : undefined,
              }
            : undefined
        }
      >
        {width ? <FitFrame width={width}>{render}</FitFrame> : render}
      </div>
      {/* A variants figure's names are plain text by their items, with no lines or outlines. */}
      {!variants && <CalloutLines callouts={callouts} maskId={maskId} />}
      <CalloutLabels callouts={callouts} />
    </Theme>
  );
}

/** Markdown as plain text, as a variant's use shows it beside its item: its words, without marks. */
const plain = (markdown: string) =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * The most columns a legend of `count` parts takes: rows as even as they can be, three to a row
 * at most, so no part is left alone on a row, such as two by two for four and three by two for six.
 */
const legendColumns = (count: number) => Math.ceil(count / Math.ceil(count / 3));

/**
 * A legend item as the figure shows it: the part's name alone, such as Label, in plain words; its
 * class names and props are on the page's guide in the Docs. An item without a name shows the
 * description parts.json gives its part, or else what it is written as.
 */
function legendText(item: AnatomyLegendItem) {
  const name = legendName(item);
  if (name) return name;
  return partDescription(item.part.replace(/::text$/, '')) ?? item.text;
}

/**
 * An anatomy figure: the live component in the reader's theme, a numbered callout on each part its
 * legend names, by class name, but one the figure shows whole, such as a field around its control,
 * which the legend leaves out, and the legend of part names, with the example's code below. A
 * variants figure names each variant in plain text beside or under it instead, and
 * shows the option table after it as its legend, each name followed by what it is for; without
 * one, its names are for assistive technology alone.
 */
export function AnatomyFigure({
  page,
  name,
  title,
  caption,
  legend,
  of,
  open = false,
  enlarge: enlarged = false,
  specimen = false,
  stage,
  variants = false,
  options,
  width,
}: {
  page: string;
  name: string;
  title: string;
  caption?: string;
  legend?: AnatomyLegendItem[];
  of?: string;
  /** Whether the example's overlays are shown open, their parts numbered too. */
  open?: boolean;
  /** Whether the subject shows half as large again where its stage has room, as a small one does. */
  enlarge?: boolean;
  /**
   * Whether the parts are numbered on the example's specimen of the same name, which holds it in a
   * moment its parts show apart, such as a value caught as it rolls in; the code is the example's.
   */
  specimen?: boolean;
  /** The stage's fill, where the page's would hide the subject. */
  stage?: StageFill;
  /** A variants figure: each variant's name by the example's items. */
  variants?: boolean;
  /** A variants figure's option table, shown as its legend. */
  options?: OptionTable;
  /** The width, in rem, the subject needs to show its parts: a narrower stage draws it smaller. */
  width?: number;
}) {
  const [items] = useState(() => (legend?.length ? legend : legendOf(of ?? '')));
  // The legend in the callouts' order, which follows the figure as it is read; the items the
  // figure shows no callout for after them, but those it shows whole, such as a field around its
  // control, which the figure itself is and the legend leaves out.
  const [order, setOrder] = useState<number[]>([]);
  const [whole, setWhole] = useState<number[]>([]);
  const onOrder = useCallback((next: number[], nextWhole: number[]) => {
    setOrder((current) => (current.join() === next.join() ? current : next));
    setWhole((current) => (current.join() === nextWhole.join() ? current : nextWhole));
  }, []);
  // What each variant is for, from the option table, which shows beside its item where it fits,
  // and as the legend below it where it doesn't.
  const uses = useMemo(
    () =>
      variants && options
        ? items.map((item) => {
            const option = options.options.find((entry) => entry.name === item.label);
            return (
              option && [
                plain(option.use),
                ...option.details
                  .filter((detail) => detail.markdown)
                  .map((detail) => `${detail.title}: ${plain(detail.markdown)}`),
              ]
            );
          })
        : undefined,
    [variants, options, items],
  );
  const [beside, setBeside] = useState(false);
  const ordered = [
    ...order.filter((index) => index < items.length),
    ...items
      .map((_, index) => index)
      .filter((index) => !order.includes(index) && !whole.includes(index)),
  ];
  return (
    <figure className={variants ? 'catalogue-variants' : 'site-anatomy'} aria-label={title}>
      <AnatomyStage
        page={page}
        name={name}
        legend={items}
        open={open}
        enlarged={enlarged}
        specimen={specimen}
        stage={stage}
        variants={variants}
        width={width}
        onOrder={onOrder}
        uses={uses}
        onBeside={setBeside}
      />
      <figcaption className="site-anatomy-caption">
        {caption && <p className="site-figure-caption">{caption}</p>}
        {/* Shown by the items, beside or under them, the option table is read, not seen, once. */}
        {variants &&
          options &&
          (beside ? (
            <div className="site-visually-hidden">
              <OptionLegend table={options} path={`components/${page}.md`} />
            </div>
          ) : (
            <OptionLegend table={options} path={`components/${page}.md`} />
          ))}
        {variants && !options && (
          <ul className="site-visually-hidden">
            {items.map((item, index) => (
              <li key={`${index}-${item.label}`}>{item.label}</li>
            ))}
          </ul>
        )}
        {!variants && items.length > 0 && (
          <ol
            className="site-anatomy-legend"
            style={{ '--site-anatomy-columns': legendColumns(ordered.length) }}
          >
            {ordered.map((index, rank) => (
              <li key={`${index}-${items[index]!.part}`}>
                <span className="site-anatomy-number" aria-hidden="true">
                  {rank + 1}
                </span>
                <PageMarkdown markdown={legendText(items[index]!)} path={`components/${page}.md`} />
              </li>
            ))}
          </ol>
        )}
      </figcaption>
      <ExampleCode page={page} name={name} />
    </figure>
  );
}
