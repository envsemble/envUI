import { fieldCharacterBox, paintField, type Field } from './FieldCopy';

const wordCharacter = /[\p{L}\p{N}\p{M}_'’]/u;
const isWord = (text: string, index: number) => wordCharacter.test(text.charAt(index));
const isSpace = (text: string, index: number) => /\s/.test(text.charAt(index));

function wordStart(text: string, at: number) {
  let index = at;
  if (isWord(text, index - 1) && isWord(text, index))
    while (index > 0 && isWord(text, index - 1)) index--;
  while (index < text.length && isSpace(text, index)) index++;
  return index;
}

function wordEnd(text: string, at: number) {
  let index = at;
  if (isWord(text, index - 1) && isWord(text, index))
    while (index < text.length && isWord(text, index)) index++;
  while (index > 0 && isSpace(text, index - 1)) index--;
  return index;
}

function wholeWords(text: string, start: number, end: number) {
  const from = wordStart(text, start);
  const to = wordEnd(text, end);
  return from < to ? { from, to } : null;
}

interface Point {
  x: number;
  y: number;
}

const selectableFields =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"], [type="color"], [type="file"]), textarea';

const highlightName = 'catalogue-selection';

function highlight() {
  if (typeof CSS === 'undefined' || !('highlights' in CSS) || typeof Highlight === 'undefined')
    return null;
  let found = CSS.highlights.get(highlightName);
  if (!found) {
    found = new Highlight();
    CSS.highlights.set(highlightName, found);
  }
  return found;
}

const mostCoversLifted = 3;

function caretAt(point: Point, scope: Element) {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => CaretPosition | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const read = () => {
    if (doc.caretPositionFromPoint) {
      const position = doc.caretPositionFromPoint(point.x, point.y);
      return position && { node: position.offsetNode, offset: position.offset };
    }
    const range = doc.caretRangeFromPoint?.(point.x, point.y);
    return range ? { node: range.startContainer, offset: range.startOffset } : null;
  };
  const inert = scope.closest<HTMLElement>('[inert]');
  if (inert) inert.inert = false;
  const covers: [HTMLElement, string][] = [];
  try {
    for (;;) {
      const caret = read();
      const top = document.elementFromPoint(point.x, point.y);
      if (scope.contains(caret?.node ?? null) || !(top instanceof HTMLElement)) return caret;
      if (scope.contains(top) || covers.length > mostCoversLifted) return caret;
      covers.push([top, top.style.pointerEvents]);
      top.style.pointerEvents = 'none';
    }
  } finally {
    for (const [cover, value] of covers) cover.style.pointerEvents = value;
    if (inert) inert.inert = true;
  }
}

const clampInsetPx = 1;

function clampInside(point: Point, box: DOMRect): Point {
  return {
    x: Math.min(Math.max(point.x, box.left + clampInsetPx), box.right - clampInsetPx),
    y: Math.min(Math.max(point.y, box.top + clampInsetPx), box.bottom - clampInsetPx),
  };
}

function fieldOffsetAt(field: Field, point: Point) {
  const box = field.getBoundingClientRect();
  const inside = clampInside(point, box);
  const caret = caretAt(inside, field);
  if (caret?.node === field) return Math.min(caret.offset, field.value.length);
  if (field instanceof HTMLTextAreaElement)
    return point.y < box.top ? 0 : point.y > box.bottom ? field.value.length : field.selectionEnd;
  const style = getComputedStyle(field);
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return field.value.length;
  context.font = style.font;
  const scale = box.width / field.offsetWidth || 1;
  const x =
    (inside.x - box.left) / scale -
    parseFloat(style.borderLeftWidth) -
    parseFloat(style.paddingLeft) +
    field.scrollLeft;
  const characters = [...field.value];
  let width = 0;
  for (let index = 0; index < characters.length; index++) {
    const next = context.measureText(characters.slice(0, index + 1).join('')).width;
    if (x < (width + next) / 2) return characters.slice(0, index).join('').length;
    width = next;
  }
  return field.value.length;
}

const withinCharacterLeast = 0.2;
const withinCharacterMost = 0.8;

export function textPoint(element: Element, text: string, x: number, y: number): Point | null {
  if (!text) return null;
  const position = Math.min(Math.max(x, 0), 1) * text.length;
  const offset = Math.min(text.length - 1, Math.floor(position));
  const within = Math.min(Math.max(position - offset, withinCharacterLeast), withinCharacterMost);
  const along = (start: number) => start + offset;
  const box = element.matches(selectableFields)
    ? fieldCharacterBox(element as Field, text, along)
    : contentCharacterBox(element, text, along);
  return box && { x: box.left + box.width * within, y: box.top + box.height * y };
}

function contentCharacterBox(element: Element, text: string, along: (start: number) => number) {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  const whole = nodes.map((node) => node.data).join('');
  const start = text ? whole.indexOf(text) : -1;
  if (start < 0) return null;
  let index = along(start);
  for (const node of nodes) {
    if (index < node.length) {
      const range = document.createRange();
      range.setStart(node, index);
      range.setEnd(node, index + 1);
      return range.getClientRects()[0] ?? range.getBoundingClientRect();
    }
    index -= node.length;
  }
  return null;
}

function toWholeWords(range: Range) {
  if (range.collapsed) return false;
  const { startContainer: first, endContainer: last } = range;
  if (first.nodeType === Node.TEXT_NODE)
    range.setStart(first, wordStart(first.textContent ?? '', range.startOffset));
  if (last.nodeType === Node.TEXT_NODE)
    range.setEnd(last, wordEnd(last.textContent ?? '', range.endOffset));
  if (range.collapsed || range.toString().trim() === '') {
    range.collapse(true);
    return false;
  }
  return true;
}

interface Caret {
  node: Node;
  offset: number;
}

export class PointerSelection {
  private field: Field | null = null;
  private fieldAnchor = 0;
  private mirror: HTMLElement | null = null;
  private anchor: Caret | null = null;
  private range: Range | null = null;
  private selected: { field: Field; start: number; end: number } | null = null;

  constructor(private readonly scope: Element) {}

  begin(point: Point, target: Element) {
    this.clear();
    const field = target.closest<Field>(selectableFields);
    if (field && this.scope.contains(field)) {
      this.field = field;
      this.fieldAnchor = fieldOffsetAt(field, point);
      field.setSelectionRange(this.fieldAnchor, this.fieldAnchor);
      return;
    }
    this.pressed = point;
  }

  private pressed: Point | null = null;

  private anchorAt() {
    const point = this.pressed;
    this.pressed = null;
    if (!point) return;
    const caret = caretAt(point, this.scope);
    if (!caret || caret.node.nodeType !== Node.TEXT_NODE || !this.scope.contains(caret.node))
      return;
    const parent = caret.node.parentElement;
    if (!parent || getComputedStyle(parent).userSelect === 'none') return;
    this.anchor = caret;
  }

  extend(point: Point) {
    const field = this.field;
    if (field) {
      if (!field.isConnected) return this.clear();
      const focus = fieldOffsetAt(field, point);
      const words = wholeWords(
        field.value,
        Math.min(this.fieldAnchor, focus),
        Math.max(this.fieldAnchor, focus),
      );
      if (words)
        field.setSelectionRange(
          words.from,
          words.to,
          focus < this.fieldAnchor ? 'backward' : 'forward',
        );
      else field.setSelectionRange(this.fieldAnchor, this.fieldAnchor);
      this.selected = words ? { field, start: words.from, end: words.to } : null;
      this.paint();
      return;
    }
    this.anchorAt();
    const anchor = this.anchor;
    if (!anchor) return;
    const caret = caretAt(point, this.scope);
    if (!caret || !this.scope.contains(caret.node)) return;
    const range = document.createRange();
    range.setStart(anchor.node, anchor.offset);
    if (range.comparePoint(caret.node, caret.offset) < 0) {
      range.setStart(caret.node, caret.offset);
      range.setEnd(anchor.node, anchor.offset);
    } else range.setEnd(caret.node, caret.offset);
    const words = toWholeWords(range);
    const shown = highlight();
    if (this.range) shown?.delete(this.range);
    this.range = words ? range : null;
    if (words) shown?.add(range);
  }

  private paint() {
    const selected = this.selected;
    if (!selected) {
      this.mirror?.remove();
      this.mirror = null;
      if (this.watching) cancelAnimationFrame(this.watching);
      this.watching = 0;
      return;
    }
    this.mirror = paintField(selected.field, selected.start, selected.end, this.mirror, this.scope);
    this.painted = { value: selected.field.value, scroll: selected.field.scrollTop };
    if (!this.watching) this.watching = requestAnimationFrame(this.watch);
  }

  private painted = { value: '', scroll: 0 };
  private watching = 0;

  private readonly watch = () => {
    this.watching = 0;
    const selected = this.selected;
    if (!selected) return;
    const { field } = selected;
    if (!field.isConnected) {
      this.selected = null;
      return this.paint();
    }
    const { selectionStart: start, selectionEnd: end, value, scrollTop } = field;
    if (start !== selected.start || end !== selected.end || value !== this.painted.value) {
      this.selected = start !== null && end !== null && start < end ? { field, start, end } : null;
      return this.paint();
    }
    if (scrollTop !== this.painted.scroll) return this.paint();
    this.watching = requestAnimationFrame(this.watch);
  };

  typed(field: Field, text: string | null) {
    const value = field.value;
    const selected = this.selected?.field === field ? this.selected : null;
    const caret = this.caret?.field === field ? this.caret.at : value.length;
    const [start, end] = selected
      ? [selected.start, selected.end]
      : text === null
        ? [Math.max(0, caret - 1), caret]
        : [caret, caret];
    const next = value.slice(0, start) + (text ?? '') + value.slice(end);
    const at = start + (text?.length ?? 0);
    this.selected = null;
    this.paint();
    this.caret = selected || this.caret?.field === field ? { field, at } : null;
    return { value: next, at };
  }

  reveal(element: Element) {
    if (!element.matches(selectableFields)) return;
    const field = element as Field;
    const { selectionStart: start, selectionEnd: end } = field;
    if (start === null || end === null || start === end) return;
    this.selected = { field, start, end };
    this.paint();
  }

  private caret: { field: Field; at: number } | null = null;

  clear() {
    this.field = null;
    this.anchor = null;
    this.pressed = null;
    this.selected = null;
    this.caret = null;
    this.paint();
    if (this.range) highlight()?.delete(this.range);
    this.range = null;
  }
}
