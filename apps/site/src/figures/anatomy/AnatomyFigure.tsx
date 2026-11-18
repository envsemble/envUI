import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { Theme, useTheme } from '@envsemble/envui';
import type { AnatomyLegendItem, StageFill } from '../../documentation/DocumentationTypes';
import { legendName, type OptionTable } from '../../documentation/CatalogueContent';
import { PageMarkdown } from '../../markdown/PageMarkdown';
import { FitFrame } from '../../fit/standalone/WidthFit';
import { OptionLegend } from '../../markdown/OptionLegend';
import { legendOf, partDescription } from './Parts';
import { ExampleCode, ExampleRender } from '../LiveExample';
import { OpenExample } from '../OpenExample';
import { ExamplePlayback } from '../Specimen';
import type { Callout } from './PlaceCallouts';
import { useAnatomyLayout } from './useAnatomyLayout';

function CalloutLines({ callouts, maskId }: { callouts: Callout[]; maskId: string }) {
  return (
    <svg className="site-anatomy-lines" aria-hidden="true">
      {callouts.map(({ number, badge, anchor, box, gaps }) => (
        <g key={number}>
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

function CalloutLabels({ callouts }: { callouts: Callout[] }) {
  return (
    <>
      {callouts.map(({ number, badge, label, side }) => (
        <span
          key={number}
          className={label === undefined ? 'site-anatomy-badge' : 'catalogue-variant-label'}
          data-side={side}
          aria-hidden="true"
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
  uses?: (string[] | undefined)[];
  onBeside?: (beside: boolean) => void;
  onOrder: (order: number[], whole: number[]) => void;
  open: boolean;
  enlarged: boolean;
  specimen: boolean;
  stage?: StageFill;
  variants: boolean;
  width?: number;
}) {
  const theme = useTheme();
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
                justifyItems: room.under ? 'start' : undefined,
              }
            : undefined
        }
      >
        {width ? <FitFrame width={width}>{render}</FitFrame> : render}
      </div>
      {!variants && <CalloutLines callouts={callouts} maskId={maskId} />}
      <CalloutLabels callouts={callouts} />
    </Theme>
  );
}

const plain = (markdown: string) =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const mostLegendColumns = 3;

const legendColumns = (count: number) => Math.ceil(count / Math.ceil(count / mostLegendColumns));

function legendText(item: AnatomyLegendItem) {
  const name = legendName(item);
  if (name) return name;
  return partDescription(item.part.replace(/::text$/, '')) ?? item.text;
}

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
  open?: boolean;
  enlarge?: boolean;
  specimen?: boolean;
  stage?: StageFill;
  variants?: boolean;
  options?: OptionTable;
  width?: number;
}) {
  const [items] = useState(() => (legend?.length ? legend : legendOf(of ?? '')));
  const [order, setOrder] = useState<number[]>([]);
  const [whole, setWhole] = useState<number[]>([]);
  const onOrder = useCallback((next: number[], nextWhole: number[]) => {
    setOrder((current) => (current.join() === next.join() ? current : next));
    setWhole((current) => (current.join() === nextWhole.join() ? current : nextWhole));
  }, []);
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
