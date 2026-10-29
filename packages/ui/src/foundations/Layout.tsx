import type { ComponentPropsWithRef, CSSProperties, ReactElement, Ref } from 'react';
import { renderElement } from '../internal/renderElement.js';
import '../styles/Base.css';
import '../styles/Layout.css';

/**
 * A step in the shared spacing scale: 1 is 0.25 rem, 2 is 0.5 rem, 3 is 0.75 rem, 4 is 1 rem, 5 is
 * 1.5 rem, 6 is 2 rem, 7 is 2.5 rem, 8 is 3 rem and 9 is 4 rem, smaller at the compact scale; 0 is
 * none.
 */
export type SpaceStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * How children line up across a Row or Column, or in their cells of a Grid: stretch, as wide as a
 * column or as tall as a row, except controls such as buttons, which keep their own size; start,
 * center and end keep each child at its own size, at that side or in the middle.
 */
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch';

/**
 * Where children sit along a Row or Column when there is room to spare: at the start, in the
 * center, at the end, or between, spread out with the first and last at the edges.
 */
export type LayoutJustify = 'start' | 'center' | 'end' | 'between';

/**
 * A Grid's columns: a number of equal columns; a `grid-template-columns` template, such as
 * `'minmax(0, 2fr) minmax(0, 1fr)'`; or `{ min: '12rem' }`, as many equal columns as fit at that
 * width or wider, also when fewer items than that fill them (auto-fill), so items keep one width.
 */
export type GridColumns = number | string | { min: `${number}rem` };

/** What every primitive takes: its element, its ref, a name and its padding. */
type PrimitiveOptions<RenderedElement extends HTMLElement> = {
  /**
   * The element to render, for its meaning, such as render={<section />} or render={<ul />}, or
   * another component to lay out without a wrapper, such as a Surface: the primitive's attributes
   * merge into its props. It must forward native props and refs. A div by default.
   */
  render?: ReactElement;
  /**
   * The rendered element, a div by default. Its type is the element type parameter, which a ref
   * passed in sets: a ref to the element that render makes, such as useRef<HTMLElement>(null) with
   * render={<section />}, type-checks.
   */
  ref?: Ref<RenderedElement>;
  /**
   * A name for this node, such as "filters" or "summary", which dev mode and the docs show; it
   * renders as `data-env-name`. A component's part class names its node instead.
   */
  name?: string;
  /**
   * Makes the element a size container of this name, for container queries on its inline size,
   * such as container="filters" for `@container filters (width >= 37.5rem)`. A container is as
   * wide as its context gives it, never as its content. container="env-window" makes the element
   * a window of its own on purpose, such as a preview frame, whose content lays out at its window
   * class; other `env-*` names are envUI's own.
   */
  container?: string;
  /** The inset on every side, a step of the spacing scale. None by default. */
  padding?: SpaceStep;
};

type NativeProps<Own> = Omit<ComponentPropsWithRef<'div'>, keyof Own | 'ref'>;

export type BoxProps<RenderedElement extends HTMLElement = HTMLDivElement> =
  PrimitiveOptions<RenderedElement> & NativeProps<PrimitiveOptions<RenderedElement>>;

interface LineOptions {
  /** The space between the direct children, a step of the spacing scale. None by default. */
  gap?: SpaceStep;
  /**
   * How the children line up across the line: stretch, the default, makes each as wide as a
   * column or as tall as a row, except controls such as buttons, which keep their own size; start,
   * center and end keep every child at its own size.
   * @default 'stretch'
   */
  align?: LayoutAlign;
  /**
   * Where the children sit along the line when there is room to spare: at the start, in the
   * center, at the end, such as a form's actions, or between, spread out to the edges.
   * @default 'start'
   */
  justify?: LayoutJustify;
}

interface RowOptions extends LineOptions {
  /** Lets the row run onto more lines when its children don't fit, as a row of actions does. */
  wrap?: boolean;
}

export type RowProps<RenderedElement extends HTMLElement = HTMLDivElement> = RowOptions &
  PrimitiveOptions<RenderedElement> &
  NativeProps<RowOptions & PrimitiveOptions<RenderedElement>>;

export type ColumnProps<RenderedElement extends HTMLElement = HTMLDivElement> = LineOptions &
  PrimitiveOptions<RenderedElement> &
  NativeProps<LineOptions & PrimitiveOptions<RenderedElement>>;

interface GridOptions {
  /**
   * The columns: a number of equal columns, a `grid-template-columns` template, such as
   * `'minmax(0, 2fr) minmax(0, 1fr)'`, or `{ min: '12rem' }`, as many equal columns as fit at that
   * width or wider, with empty columns where items run out, so every item keeps one width. One
   * column by default.
   */
  columns?: GridColumns;
  /** The space between rows and columns, a step of the spacing scale. None by default. */
  gap?: SpaceStep;
  /**
   * How each child lines up in its cell's height: stretch, the default, fills the row; start,
   * center and end keep it at its own height.
   * @default 'stretch'
   */
  align?: LayoutAlign;
}

export type GridProps<RenderedElement extends HTMLElement = HTMLDivElement> = GridOptions &
  PrimitiveOptions<RenderedElement> &
  NativeProps<GridOptions & PrimitiveOptions<RenderedElement>>;

type Kind = 'box' | 'row' | 'column' | 'grid';

/** A primitive's props as the shared renderer reads them. */
type AnyPrimitiveProps = {
  name?: string;
  container?: string;
  padding?: SpaceStep;
  gap?: SpaceStep;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  style?: CSSProperties;
} & Record<string, unknown>;

/**
 * Renders a primitive: its kind and options as attributes, which its zero-specificity rules in
 * Layout.css read, and the custom properties a value needs, which an application's own rule
 * overrides. It adds no class, so a component's part class names the node it lays out.
 */
function primitive(
  kind: Kind,
  render: ReactElement | undefined,
  { name, container, padding, gap, align, justify, style, ...props }: AnyPrimitiveProps,
  extra: Record<string, unknown> = {},
  variables: Record<string, string> = {},
) {
  const custom: Record<string, string> = { ...variables };
  if (container) custom['--env-layout-container'] = container;
  return renderElement('div', render, {
    ...props,
    ...extra,
    'data-env-layout': kind,
    'data-env-name': name,
    'data-env-container': container ? '' : undefined,
    'data-padding': padding,
    'data-gap': gap,
    'data-align': align,
    'data-justify': justify,
    style: Object.keys(custom).length > 0 ? ({ ...custom, ...style } as CSSProperties) : style,
  });
}

/**
 * A plain block for what needs no row or column of its own: an inset (`padding`), a size container
 * (`container`) or a named node. It sizes to its content and never paints.
 */
export function Box<RenderedElement extends HTMLElement = HTMLDivElement>({
  render,
  ...props
}: BoxProps<RenderedElement>) {
  return primitive('box', render, props as AnyPrimitiveProps);
}

/**
 * Lays its direct children out side by side, `gap` apart, with `wrap` to run onto more lines,
 * such as a form's actions. A flex row that sizes to its content and never paints.
 */
export function Row<RenderedElement extends HTMLElement = HTMLDivElement>({
  render,
  wrap,
  ...props
}: RowProps<RenderedElement>) {
  return primitive('row', render, props as AnyPrimitiveProps, { 'data-wrap': wrap || undefined });
}

/**
 * Lays its direct children out one under another, `gap` apart, such as a form's fields. A flex
 * column that sizes to its content and never paints.
 */
export function Column<RenderedElement extends HTMLElement = HTMLDivElement>({
  render,
  ...props
}: ColumnProps<RenderedElement>) {
  return primitive('column', render, props as AnyPrimitiveProps);
}

/** The `grid-template-columns` of a Grid's columns. */
function gridTemplate(columns: GridColumns): string {
  if (typeof columns === 'number') return `repeat(${columns}, minmax(0, 1fr))`;
  if (typeof columns === 'string') return columns;
  return `repeat(auto-fill, minmax(min(100%, ${columns.min}), 1fr))`;
}

/**
 * Lays its direct children out in columns, `gap` apart: a number of equal columns, a template, or
 * as many as fit at a minimum width. A CSS grid that sizes to its content and never paints.
 */
export function Grid<RenderedElement extends HTMLElement = HTMLDivElement>({
  render,
  columns,
  ...props
}: GridProps<RenderedElement>) {
  return primitive(
    'grid',
    render,
    props as AnyPrimitiveProps,
    { 'data-columns': columns === undefined ? undefined : '' },
    columns === undefined ? {} : { '--env-grid-columns': gridTemplate(columns) },
  );
}
