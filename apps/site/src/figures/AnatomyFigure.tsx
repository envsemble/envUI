import { useCallback, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, useTheme } from '@envsemble/envui';
import type { AnatomyLegendItem, StageFill } from '../shared/DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import { ExampleCode, ExampleRender, leastFitScale } from './LiveExample';
import { OpenExample } from './OpenExample';
import { legendOf, partDescription } from '../template/Parts';
import { legendName } from '../shared/CatalogueContent';
import { OptionLegend } from '../template/OptionLegend';
import { SpecimenRender } from './Specimen';
import { measure, measureVariants, type Callout, type Room } from './AnatomyLayout';
import type { OptionTable } from '../shared/CatalogueContent';

/** A subject at most this wide and tall, in CSS pixels, is small enough to show larger. */
const smallSubject = { width: 240, height: 48 };

/**
 * Shows a small subject, such as a badge or a checkbox, half as large again, as far as its stage
 * has room, so the callouts on its parts don't crowd; so too any subject its fence marks `enlarge`,
 * whose parts sit close together, such as a bar's item. The callouts measure the enlarged parts.
 */
function enlarge(subject: HTMLElement, always: boolean) {
  // The example's root, which sizes to its content when it is small.
  const scaled = subject.firstElementChild;
  if (!(scaled instanceof HTMLElement)) return;
  const current = Number(scaled.style.getPropertyValue('zoom') || 1);
  const box = scaled.getBoundingClientRect();
  const width = box.width / current;
  const height = box.height / current;
  const small =
    width > 0 && (always || (width <= smallSubject.width && height <= smallSubject.height));
  const zoom = small ? Math.max(1, Math.min(1.5, subject.clientWidth / width)) : 1;
  if (Math.abs(zoom - current) < 0.01) return;
  if (zoom === 1) scaled.style.removeProperty('zoom');
  else scaled.style.setProperty('zoom', zoom.toFixed(2));
}

/**
 * A subject that shows all its parts only from a width, such as panes side by side, laid out at
 * that width, in rem, and drawn smaller where the stage is narrower, down to `leastFitScale`, as a
 * width frame is; the callouts measure the parts as drawn. On a stage narrower still, it lays out
 * at the stage's width, and shows the parts that width has.
 */
function FitFrame({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<{ scale: number; width: number; height: number }>();
  useLayoutEffect(() => {
    const frame = box.current;
    const subject = fit.current?.parentElement;
    if (!frame || !subject) return;
    const measure = () => {
      const needed = width * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const scale = subject.clientWidth / needed;
      const next =
        scale < 1 && scale >= leastFitScale
          ? { scale, width: needed * scale, height: frame.offsetHeight * scale }
          : undefined;
      // Unchanged sizes keep the state, so the stage, which grows with the frame, settles.
      setScaled((current) =>
        current &&
        next &&
        Math.abs(current.width - next.width) < 0.5 &&
        Math.abs(current.height - next.height) < 0.5
          ? current
          : next,
      );
    };
    let request = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(request);
      request = requestAnimationFrame(measure);
    });
    observer.observe(subject);
    observer.observe(frame);
    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
    };
  }, [width]);
  return (
    <div
      ref={fit}
      className="catalogue-anatomy-fit"
      data-scaled={scaled ? '' : undefined}
      style={scaled && { inlineSize: scaled.width, blockSize: scaled.height }}
    >
      <div
        ref={box}
        className="catalogue-anatomy-fit-box"
        style={scaled && { inlineSize: `${width}rem`, transform: `scale(${scaled.scale})` }}
      >
        {children}
      </div>
    </div>
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
}: {
  page: string;
  name: string;
  legend: AnatomyLegendItem[];
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
  const [callouts, setCallouts] = useState<Callout[]>([]);
  const [room, setRoom] = useState<Room>({ start: 0, bottom: 0 });
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const subjectElement = subject.current;
    if (!stageElement || !subjectElement) return;
    let frame = 0;
    /** The variants' names' widths, measured once, and again as the fonts arrive. */
    const labels = new Map<string, number>();
    const update = () => {
      cancelAnimationFrame(frame);
      // Only a change of place re-renders the callouts.
      frame = requestAnimationFrame(() => {
        // Open overlays take the room they need; they are never small.
        if (!open && !variants) enlarge(subjectElement, enlarged);
        const measured = variants
          ? { ...measureVariants(stageElement, subjectElement, legend, labels), whole: [] }
          : { ...measure(stageElement, subjectElement, legend), room: undefined };
        const next = measured.callouts;
        setCallouts((current) =>
          JSON.stringify(current) === JSON.stringify(next) ? current : next,
        );
        if (!variants)
          onOrder(
            next.map(({ index }) => index),
            measured.whole,
          );
        const needed = measured.room;
        if (needed)
          setRoom((current) =>
            current.start === needed.start && current.bottom === needed.bottom ? current : needed,
          );
      });
    };
    update();
    // The callouts follow the figure as it resizes, its example loads and its fonts arrive.
    const resize = new ResizeObserver(update);
    resize.observe(stageElement);
    resize.observe(subjectElement);
    const mutation = new MutationObserver(update);
    mutation.observe(subjectElement, {
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style'],
    });
    void document.fonts?.ready.then(() => {
      labels.clear();
      update();
    });
    // And as its parts settle where they enter with motion, such as a dock's panel rising into
    // place, which moves them without resizing them.
    subjectElement.addEventListener('animationend', update);
    subjectElement.addEventListener('transitionend', update);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      subjectElement.removeEventListener('animationend', update);
      subjectElement.removeEventListener('transitionend', update);
    };
  }, [legend, open, enlarged, variants, onOrder]);
  const example = specimen ? (
    <SpecimenRender page={page} name={name} onStage />
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
                paddingBlockEnd: room.bottom || undefined,
              }
            : undefined
        }
      >
        {width ? <FitFrame width={width}>{render}</FitFrame> : render}
      </div>
      {/* A variants figure's names are plain text by their items, with no lines or outlines. */}
      {!variants && (
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
      )}
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
    </Theme>
  );
}

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
 * which the legend names alone, and the legend of part names, with the example's code below. A
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
  // figure shows no callout for after them, those it names alone, such as a field around its
  // control, unnumbered.
  const [order, setOrder] = useState<number[]>([]);
  const [whole, setWhole] = useState<number[]>([]);
  const onOrder = useCallback((next: number[], nextWhole: number[]) => {
    setOrder((current) => (current.join() === next.join() ? current : next));
    setWhole((current) => (current.join() === nextWhole.join() ? current : nextWhole));
  }, []);
  const ordered = [
    ...order.filter((index) => index < items.length),
    ...items
      .map((_, index) => index)
      .filter((index) => !order.includes(index) && !whole.includes(index)),
  ];
  const named = whole.filter((index) => index < items.length && !order.includes(index));
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
      />
      <figcaption className="site-anatomy-caption">
        {caption && <p className="site-figure-caption">{caption}</p>}
        {variants && options && <OptionLegend table={options} path={`components/${page}.md`} />}
        {variants && !options && (
          <ul className="site-visually-hidden">
            {items.map((item, index) => (
              <li key={`${index}-${item.label}`}>{item.label}</li>
            ))}
          </ul>
        )}
        {!variants && items.length > 0 && (
          <ol className="site-anatomy-legend">
            {ordered.map((index, rank) => (
              <li key={`${index}-${items[index]!.part}`}>
                <span className="site-anatomy-number" aria-hidden="true">
                  {rank + 1}
                </span>
                <Documentation
                  markdown={legendText(items[index]!)}
                  path={`components/${page}.md`}
                />
              </li>
            ))}
            {/* A part the figure shows whole, with no callout, by name alone. */}
            {named.map((index) => (
              <li key={`${index}-${items[index]!.part}`} data-whole="">
                <span className="site-anatomy-number" aria-hidden="true" />
                <Documentation
                  markdown={legendText(items[index]!)}
                  path={`components/${page}.md`}
                />
              </li>
            ))}
          </ol>
        )}
      </figcaption>
      <ExampleCode page={page} name={name} />
    </figure>
  );
}
