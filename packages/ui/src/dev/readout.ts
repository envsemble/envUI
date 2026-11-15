import type {
  Box,
  ChildData,
  LayoutProblem,
  NodeData,
  LayoutProblemRule,
  ScrollData,
  Snapshot,
  StickyData,
} from './model.js';
import { layoutKinds } from './model.js';
import { queriesFor, thresholdsFor } from './queries.js';
import { roundToHundredth } from '../internal/dom/lengths.js';
import { toRem } from './units.js';
import { windowClassOfRem } from '../foundations/windowClasses.js';

export interface Reading {
  text: string;
  lines: string[];
  problemsByNode: LayoutProblem[][];
  problems: LayoutProblem[];
}

const layoutKindNames = new Set<string>(layoutKinds);

export const labelOf = (node: Pick<NodeData, 'kind' | 'name'>) =>
  node.name === node.kind ? node.kind : `${node.kind} "${node.name}"`;

function pathOf(snapshot: Snapshot, node: NodeData): string {
  const labels: string[] = [];
  for (
    let at: NodeData | undefined = node;
    at;
    at = at.parent === null ? undefined : snapshot.nodes[at.parent]
  )
    labels.unshift(labelOf(at));
  return labels.join(' > ');
}

class Reader {
  readonly lines: string[];
  readonly problemsByNode: LayoutProblem[][];
  readonly all: LayoutProblem[] = [];
  readonly contentOverflowCandidates = new Map<number, string>();
  readonly nodesWithSpillingChild = new Set<number>();

  constructor(readonly snapshot: Snapshot) {
    this.lines = snapshot.nodes.map(() => '');
    this.problemsByNode = snapshot.nodes.map(() => []);
  }

  rem = (px: number) => String(toRem(px, this.snapshot.rootPx));
  size = (w: number, h: number) => `${this.rem(w)}×${this.rem(h)}rem`;

  problem(node: NodeData, rule: LayoutProblemRule, message: string) {
    const problem: LayoutProblem = {
      rule,
      node: labelOf(node),
      path: pathOf(this.snapshot, node),
      message,
    };
    this.problemsByNode[node.index].push(problem);
    this.all.push(problem);
  }

  display(node: NodeData): string[] {
    const bits: string[] = [];
    const flex = node.display.includes('flex');
    const grid = node.display.includes('grid');
    if (flex) {
      bits.push(
        `flex ${node.flexDirection.startsWith('column') ? 'column' : 'row'}${node.flexWrap.startsWith('wrap') ? ' wrap' : ''}`,
      );
    } else bits.push(node.display);
    if (flex || grid) {
      if (!['normal', 'stretch'].includes(node.alignItems)) bits.push(`align ${node.alignItems}`);
      if (!['normal', 'flex-start', 'start'].includes(node.justifyContent))
        bits.push(`justify ${node.justifyContent}`);
      const [row, column] = node.gap;
      if (row || column)
        bits.push(
          row === column
            ? `gap ${this.rem(row)}rem`
            : `gap ${this.rem(row)} ${this.rem(column)}rem`,
        );
    }
    return bits;
  }

  padding(node: NodeData): string | null {
    const [top, right, bottom, left] = node.padding.map((value) => this.rem(value));
    if ([top, right, bottom, left].every((value) => value === '0')) return null;
    if (top === bottom && right === left)
      return top === right ? `padding ${top}rem` : `padding ${top} ${right}rem`;
    return `padding ${top} ${right} ${bottom} ${left}rem`;
  }

  grid(node: NodeData): string[] {
    if (!node.grid) return [];
    const bits: string[] = [];
    const { columns, rows, areas } = node.grid;
    if (columns.length)
      bits.push(
        `columns ${columns.length} = ${columns.map((value) => this.rem(value)).join(' | ')}rem`,
      );
    if (rows.length > 1)
      bits.push(`rows ${rows.length} = ${rows.map((value) => this.rem(value)).join(' | ')}rem`);
    if (areas) bits.push(`areas ${areas}`);
    return bits;
  }

  scroll(scroll: ScrollData): string {
    const more = scroll.content.h > scroll.client.h + 1 || scroll.content.w > scroll.client.w + 1;
    const axes = scroll.axes === 'both' ? '' : ` ${scroll.axes}`;
    return more
      ? `scrolls${axes} (content ${this.size(scroll.content.w, scroll.content.h)}, at ${this.rem(scroll.at.x)},${this.rem(scroll.at.y)}rem)`
      : `scrolls${axes} (everything fits)`;
  }

  sticky(sticky: StickyData): string {
    if (!sticky.scrolls) return `sticky ${sticky.edge}, but nothing around it scrolls`;
    return `sticks ${sticky.edge} at ${this.rem(sticky.offset)}rem in ${sticky.scroller}${sticky.stuck ? ', stuck now' : ''}`;
  }

  container(node: NodeData): string | null {
    if (!node.container) return null;
    const queries = queriesFor(node.container.name, this.snapshot.queries);
    const thresholds = thresholdsFor(queries);
    const name =
      node.container.name && node.container.name !== 'none' ? ` ${node.container.name}` : '';
    return `container${name} (${thresholds.length ? `queried at ${thresholds.join(', ')}rem` : 'nothing queries it'})`;
  }

  overlay(node: NodeData): string[] {
    const { box } = node;
    const bits = [`at ${this.rem(box.x)},${this.rem(box.y)}rem in the window`];
    if (node.side) bits.push(`side ${node.side}`);
    return bits;
  }

  line(node: NodeData): string {
    const label = labelOf(node);
    if (node.hidden !== null) {
      const inside = node.hiddenInside
        ? ` (${node.hiddenInside} ${node.hiddenInside === 1 ? 'node' : 'nodes'} inside)`
        : '';
      return `${label} · ${node.hidden}${inside}`;
    }
    const widthRem = node.size.w / this.snapshot.rootPx;
    const bits: string[] = [this.size(node.size.w, node.size.h), windowClassOfRem(widthRem)];
    const container = this.container(node);
    if (container) bits.push(container);
    bits.push(...this.display(node));
    const padding = this.padding(node);
    if (padding) bits.push(padding);
    bits.push(...this.grid(node));
    if (node.scroll) bits.push(this.scroll(node.scroll));
    if (node.sticky) bits.push(this.sticky(node.sticky));
    else if (['absolute', 'fixed'].includes(node.position) && !node.overlay)
      bits.push(node.position);
    if (node.overlay) bits.push(...this.overlay(node));
    for (const inner of node.inner) {
      if (inner.sticky) bits.push(`holds ${inner.label}: ${this.sticky(inner.sticky)}`);
      if (inner.scroll) bits.push(`holds ${inner.label}: ${this.scroll(inner.scroll)}`);
    }
    return `${label} · ${bits.join(' · ')}`;
  }

  check(node: NodeData) {
    const label = labelOf(node);
    const { rootPx } = this.snapshot;
    const appOwnLayoutNode = layoutKindNames.has(node.kind) && node.part === null;
    if (appOwnLayoutNode && node.paints.length)
      this.problem(
        node,
        'layout-paints',
        `${label} paints (${node.paints.join(', ')}). Layout never paints: put the look in a component inside it.`,
      );
    const stickies = [
      ...(node.sticky ? [{ who: label, sticky: node.sticky }] : []),
      ...node.inner.flatMap((inner) =>
        inner.sticky ? [{ who: inner.label, sticky: inner.sticky }] : [],
      ),
    ];
    for (const { who, sticky } of stickies)
      if (!sticky.scrolls)
        this.problem(
          node,
          'sticky-without-scroll',
          `${who} is sticky, but ${sticky.scroller} around it only clips and never scrolls, so it never sticks.`,
        );
    for (const inner of node.inner)
      if (inner.squeezed)
        this.problem(
          node,
          'text-squeezed',
          `${label}: the text of ${inner.label} is squeezed to ${this.rem(inner.squeezed.width)}rem, about ${inner.squeezed.chars} characters a line, under the ${this.snapshot.minTextCharacters} a line can take. Give it room, or let it wrap below its neighbours.`,
        );
    if (node.overlay) {
      const { box } = node;
      const { w, h } = this.snapshot.window;
      if (box.x < -1 || box.y < -1 || box.x + box.w > w + 1 || box.y + box.h > h + 1)
        this.problem(
          node,
          'overlay-off-window',
          `${label} reaches outside the window (${this.rem(box.x)},${this.rem(box.y)} to ${this.rem(box.x + box.w)},${this.rem(box.y + box.h)}rem in a window of ${this.size(w, h)}).`,
        );
      return;
    }
    const scrolls = node.scroll !== null;
    const clips = node.overflow.x !== 'visible' || node.overflow.y !== 'visible';
    if (scrolls) return;
    let spills = false;
    if (!clips) {
      for (const child of node.kids) {
        if (child.detached) continue;
        const past = sidesPast(node.box, child.box, child.outset);
        if (!past.length) continue;
        spills = true;
        this.nodesWithSpillingChild.add(node.index);
        this.problem(
          node,
          'child-overflow',
          `${label}: its child ${child.label} sticks out ${past.map(([distance, side]) => `${this.rem(distance)}rem past its ${side}`).join(' and ')}. It doesn't scroll, so that spills over its neighbours.`,
        );
      }
    }
    const outsetByDesign = node.outsetInside ?? 0;
    const wider = node.scrollSize.w - node.scrollSize.clientW - outsetByDesign;
    if (!spills && wider > 1)
      this.contentOverflowCandidates.set(
        node.index,
        `${label}: its content is ${roundToHundredth(wider / rootPx)}rem wider than it (${this.rem(node.scrollSize.clientW)}rem) and it doesn't scroll${clips ? ', so the content is cut off' : ''}. Let the content wrap or shrink (min-inline-size: 0), or let it scroll.`,
      );
  }

  walk(node: NodeData, depth: number): string[] {
    const indent = '  '.repeat(depth);
    const line = this.line(node);
    this.lines[node.index] = line;
    const block = [`${indent}${line}`];
    if (node.hidden !== null) return block;
    this.check(node);
    let alikeSiblings: { shape: string; first: string; more: string[] } | null = null;
    const foldAlikeSiblings = () => {
      if (!alikeSiblings?.more.length) return;
      const names =
        alikeSiblings.more.length <= 6
          ? ` (${alikeSiblings.more.map((name) => `"${name}"`).join(', ')})`
          : '';
      block.push(
        `${indent}  … and ${alikeSiblings.more.length} more like "${alikeSiblings.first}"${names}`,
      );
    };
    for (const index of node.children) {
      const child = this.snapshot.nodes[index];
      const lines = this.walk(child, depth + 1);
      const shape = lines.join('\n').replace(/"[^"]*"/g, '"#"');
      if (alikeSiblings && shape === alikeSiblings.shape) {
        alikeSiblings.more.push(child.name);
        continue;
      }
      foldAlikeSiblings();
      alikeSiblings = { shape, first: child.name, more: [] };
      block.push(...lines);
    }
    foldAlikeSiblings();
    return block;
  }

  read(): Reading {
    const { snapshot } = this;
    const { root, rootPx, window } = snapshot;
    const out = [
      `root ${root.label} · ${this.size(root.box.w, root.box.h)} · ${windowClassOfRem(root.box.w / rootPx)} · window ${this.size(window.w, window.h)} · 1rem = ${rootPx}px`,
    ];
    const page = snapshot.tops.filter((index) => !snapshot.nodes[index].overlay);
    const overlays = snapshot.tops.filter((index) => snapshot.nodes[index].overlay);
    if (!page.length) out.push('no layout nodes (elements with data-env-layout)');
    for (const index of page) out.push(...this.walk(snapshot.nodes[index], 0));
    if (overlays.length) {
      out.push('', `open overlays (${overlays.length}):`);
      for (const index of overlays) out.push(...this.walk(snapshot.nodes[index], 1));
    }
    for (const [index, message] of this.contentOverflowCandidates) {
      const causedByANodeInside = [
        ...this.contentOverflowCandidates.keys(),
        ...this.nodesWithSpillingChild,
      ].some((other) => other !== index && isInside(snapshot, other, index));
      if (!causedByANodeInside) this.problem(snapshot.nodes[index], 'content-overflow', message);
    }
    out.push('', this.all.length ? `problems (${this.all.length}):` : 'problems: none');
    for (const problem of this.all) out.push(`  - ${problem.message}`);
    return {
      text: out.join('\n'),
      lines: this.lines,
      problemsByNode: this.problemsByNode,
      problems: this.all,
    };
  }
}

function sidesPast(parent: Box, child: Box, outset?: ChildData['outset']): [number, string][] {
  const sides: [number, string][] = [
    [parent.x - child.x - (outset?.left ?? 0), 'left'],
    [child.x + child.w - (parent.x + parent.w) - (outset?.right ?? 0), 'right'],
    [parent.y - child.y - (outset?.top ?? 0), 'top'],
    [child.y + child.h - (parent.y + parent.h) - (outset?.bottom ?? 0), 'bottom'],
  ];
  return sides.filter(([distance]) => distance > 1);
}

function isInside(snapshot: Snapshot, index: number, ancestor: number): boolean {
  for (let at = snapshot.nodes[index].parent; at !== null; at = snapshot.nodes[at].parent)
    if (at === ancestor) return true;
  return false;
}

export function read(snapshot: Snapshot): Reading {
  return new Reader(snapshot).read();
}
