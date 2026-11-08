/*
 * The text a pointer no one sees selects by dragging across it, as a mouse does
 * (VirtualPointer.ts). A stage is inert, so neither the page's selection nor focus can reach it,
 * and the reader's own selection on the page is theirs to keep:
 * - in a text field, the selection is the field's own (setSelectionRange), which a component reads
 *   as it would a person's, such as a formatting button; an unfocused field doesn't paint it, so a
 *   copy of the field's text over it, transparent but the selected part, paints it in the
 *   selection's colours (`.catalogue-field-selection`, Stage.css);
 * - in content, it is a range in a highlight of the catalogue's (`::highlight(catalogue-selection)`),
 *   painted as a selection is;
 * - in a rich text editor (ProseMirror, through Tiptap), it is also the editor's own selection, set
 *   through its state, so its toolbar shows what is on there and typing goes there; the highlight
 *   then follows the editor's selection as its content changes, such as when the text is bolded.
 * A drag selects whole words, as a person selecting a word or a phrase does: from the start of the
 * word it begins in to the end of the word it ends in, without the space after it.
 */

/** A character of a word: a letter, a digit, or an apostrophe or underscore inside one. */
const wordCharacter = /[\p{L}\p{N}\p{M}_'’]/u;
const isWord = (text: string, index: number) => wordCharacter.test(text.charAt(index));
const isSpace = (text: string, index: number) => /\s/.test(text.charAt(index));

/** Where a selection starts in a text: at the start of the word it is in, past any spaces. */
function wordStart(text: string, at: number) {
  let index = at;
  if (isWord(text, index - 1) && isWord(text, index))
    while (index > 0 && isWord(text, index - 1)) index--;
  while (index < text.length && isSpace(text, index)) index++;
  return index;
}

/** Where a selection ends in a text: at the end of the word it is in, before any spaces. */
function wordEnd(text: string, at: number) {
  let index = at;
  if (isWord(text, index - 1) && isWord(text, index))
    while (index < text.length && isWord(text, index)) index++;
  while (index > 0 && isSpace(text, index - 1)) index--;
  return index;
}

/**
 * The part of a text a drag from `start` to `end` selects, in whole words: nothing, as `null`, if
 * it holds no word.
 */
function wholeWords(text: string, start: number, end: number) {
  const from = wordStart(text, start);
  const to = wordEnd(text, end);
  return from < to ? { from, to } : null;
}

/** A point in the viewport. */
interface Point {
  x: number;
  y: number;
}

/** Fields whose text a drag selects. */
const selectableFields =
  'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"], [type="color"], [type="file"]), textarea';

type Field = HTMLInputElement | HTMLTextAreaElement;

/** A rich text editor's view, as ProseMirror gives it: its state, and how to change it. */
interface EditorView {
  state: {
    selection: { from: number; to: number; empty: boolean };
    tr: {
      insertText(text: string, from: number, to: number): unknown;
      delete(from: number, to: number): unknown;
    };
  };
  dispatch(transaction: unknown): void;
  posAtDOM(node: Node, offset: number): number;
  domAtPos(position: number): { node: Node; offset: number };
  someProp<T>(name: string, run: (handler: T) => unknown): unknown;
  setProps(props: { handleScrollToSelection: () => boolean }): void;
}

/** The editor Tiptap keeps on its content element, as the pointer drives it. */
export interface RichEditor {
  view: EditorView;
  commands: { setTextSelection(range: number | { from: number; to: number }): boolean };
  on(event: 'transaction', listener: () => void): void;
  off(event: 'transaction', listener: () => void): void;
}

/** The editors the pointer has used, kept from scrolling the page. */
const steadied = new WeakSet<RichEditor>();

/**
 * The rich text editor a node is in, or its content element holds: Tiptap keeps the editor on the
 * element ProseMirror edits. An editor the pointer uses no longer scrolls its selection into view,
 * as a command does after it edits, since that would scroll the reader's page.
 */
export function editorOf(node: Node | null) {
  const element = node instanceof Element ? node : (node?.parentElement ?? null);
  const content =
    element?.closest('.ProseMirror') ?? element?.querySelector('.ProseMirror') ?? null;
  const editor = (content as (Element & { editor?: RichEditor }) | null)?.editor;
  if (!editor?.view) return null;
  if (!steadied.has(editor)) {
    steadied.add(editor);
    editor.view.setProps({ handleScrollToSelection: () => true });
  }
  return { editor, content: content as HTMLElement };
}

/** The name of the highlight that paints the selections in content. */
const highlightName = 'catalogue-selection';

/** The catalogue's highlight, made the first time it is needed, where the browser has highlights. */
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

/**
 * Where the caret would go for a point in a stage: a node and an offset in it, as a press puts it
 * there. The browser finds no caret in what is inert, as a stage is, nor under what covers it,
 * such as a gallery tile's link stretched over its stage, so it is found for a moment as if the
 * stage weren't inert and nothing covered it, which changes nothing it shows or sends.
 */
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
      if (scope.contains(top) || covers.length > 3) return caret;
      covers.push([top, top.style.pointerEvents]);
      top.style.pointerEvents = 'none';
    }
  } finally {
    for (const [cover, value] of covers) cover.style.pointerEvents = value;
    if (inert) inert.inert = true;
  }
}

/** A point brought inside a box, a pixel in from its edges. */
function clampTo(point: Point, box: DOMRect): Point {
  return {
    x: Math.min(Math.max(point.x, box.left + 1), box.right - 1),
    y: Math.min(Math.max(point.y, box.top + 1), box.bottom - 1),
  };
}

/**
 * The offset in a field's value nearest a point, as a press or a drag there puts the caret: a
 * point outside the field is taken at its nearest edge. Where the browser doesn't say, a line's
 * offset is measured from its text.
 */
function fieldOffsetAt(field: Field, point: Point) {
  const box = field.getBoundingClientRect();
  const inside = clampTo(point, box);
  const caret = caretAt(inside, field);
  if (caret?.node === field) return Math.min(caret.offset, field.value.length);
  if (field instanceof HTMLTextAreaElement)
    return point.y < box.top ? 0 : point.y > box.bottom ? field.value.length : field.selectionEnd;
  // Measured: the characters whose middle is before the point.
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

/** The properties a copy of a field's text takes from the field, so its text lies on the field's. */
const copied = [
  'boxSizing',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontStretch',
  'fontVariant',
  'fontFeatureSettings',
  'fontVariationSettings',
  'fontKerning',
  'letterSpacing',
  'wordSpacing',
  'lineHeight',
  'textAlign',
  'textIndent',
  'textTransform',
  'tabSize',
  'direction',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
] as const;

/**
 * Paints a field's selection over it: a copy of its text, in the field's place and box, whose
 * selected part takes the selection's colours and whose rest is transparent, so the field shows
 * through. A field of the stage's content has it in the stage's overlay layer, first, under
 * what opens there, so a dialog and its backdrop cover it as they cover the field (Stage.css hides it
 * while a modal one is open, which takes the field's focus); a field in what opens there, such as
 * a dialog, or a stage without that layer, has it in the box the field is placed in. The
 * component's own elements stay as they are.
 */
function paintField(
  field: Field,
  start: number,
  end: number,
  mirror: HTMLElement | null,
  scope: Element,
) {
  const copy = mirror ?? document.createElement('div');
  if (!mirror) {
    copy.className = 'catalogue-field-selection';
    copy.setAttribute('aria-hidden', 'true');
    copy.append(document.createElement('div'));
  }
  const overlays = scope.querySelector<HTMLElement>(':scope > .catalogue-overlay-layer');
  const layer = overlays && !overlays.contains(field) ? overlays : null;
  if (layer) {
    if (layer.firstChild !== copy) layer.prepend(copy);
  } else {
    const holder = (field.offsetParent as HTMLElement | null) ?? scope;
    if (copy.parentElement !== holder) holder.append(copy);
  }
  shapeLike(copy, field);
  if (layer) {
    // In layout pixels, as the stage may be drawn scaled.
    const frame = layer.getBoundingClientRect();
    const box = field.getBoundingClientRect();
    const scale = frame.width / layer.offsetWidth || 1;
    copy.style.left = `${(box.left - frame.left) / scale - layer.clientLeft}px`;
    copy.style.top = `${(box.top - frame.top) / scale - layer.clientTop}px`;
  } else {
    copy.style.left = `${field.offsetLeft}px`;
    copy.style.top = `${field.offsetTop}px`;
  }
  const value = field.value;
  const selected = document.createElement('span');
  selected.textContent = value.slice(start, end);
  (copy.firstElementChild as HTMLElement).replaceChildren(
    value.slice(0, start),
    selected,
    value.slice(end) || '​',
  );
  return copy;
}

/** Gives a copy of a field's text the field's box, type and scroll, so its text lies on the field's. */
function shapeLike(copy: HTMLElement, field: Field) {
  const style = getComputedStyle(field);
  for (const property of copied) copy.style[property] = style[property];
  copy.style.borderStyle = 'solid';
  copy.style.borderColor = 'transparent';
  copy.style.width = `${field.offsetWidth}px`;
  copy.style.height = `${field.offsetHeight}px`;
  const area = field instanceof HTMLTextAreaElement;
  copy.dataset.field = area ? 'textarea' : 'input';
  // A textarea's scrollbar takes from the width its lines wrap in.
  if (area) {
    const scrollbar =
      field.offsetWidth -
      field.clientWidth -
      parseFloat(style.borderLeftWidth) -
      parseFloat(style.borderRightWidth);
    copy.style.paddingRight = `${parseFloat(style.paddingRight) + scrollbar}px`;
  }
  const lines = copy.firstElementChild as HTMLElement;
  lines.style.transform = area
    ? `translateY(${-field.scrollTop}px)`
    : `translateX(${-field.scrollLeft}px)`;
}

/**
 * Where a text is in an element's text, or in a field's value, for the pointer to go to: `x` along
 * it, by its characters, so 0 is just inside its start and 1 just inside its end, and `y` down its
 * line. Nothing where the text isn't there, such as before it is typed.
 */
export function textPoint(element: Element, text: string, x: number, y: number): Point | null {
  if (!text) return null;
  const position = Math.min(Math.max(x, 0), 1) * text.length;
  const offset = Math.min(text.length - 1, Math.floor(position));
  // Within its character, a little in from its edges, so the press is on that side of it.
  const within = Math.min(Math.max(position - offset, 0.2), 0.8);
  const along = (start: number) => start + offset;
  const box = element.matches(selectableFields)
    ? fieldCharacterBox(element as Field, text, along)
    : contentCharacterBox(element, text, along);
  return box && { x: box.left + box.width * within, y: box.top + box.height * y };
}

/** The box of a character of a text in a field's value, measured on a hidden copy of its text. */
function fieldCharacterBox(field: Field, text: string, along: (start: number) => number) {
  const start = text ? field.value.indexOf(text) : -1;
  if (start < 0) return null;
  const index = along(start);
  const copy = document.createElement('div');
  copy.className = 'catalogue-field-selection';
  copy.style.visibility = 'hidden';
  const lines = document.createElement('div');
  const character = document.createElement('span');
  character.textContent = field.value.charAt(index);
  lines.append(field.value.slice(0, index), character, field.value.slice(index + 1) || '​');
  copy.append(lines);
  const holder = (field.offsetParent as HTMLElement | null) ?? field.parentElement;
  if (!holder) return null;
  holder.append(copy);
  shapeLike(copy, field);
  copy.style.left = `${field.offsetLeft}px`;
  copy.style.top = `${field.offsetTop}px`;
  const box = character.getBoundingClientRect();
  copy.remove();
  return box;
}

/** The box of a character of a text in an element's text, across its text nodes. */
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

/**
 * Brings a range in content to whole words, within the text at each of its ends: returns whether
 * it holds a word, else it is left collapsed at its start.
 */
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

/** A text position the pointer pressed at or dragged to, in content. */
interface Caret {
  node: Node;
  offset: number;
}

/** The selection one pointer no one sees makes in its stage. */
export class PointerSelection {
  /** The field it selects in, its anchor's offset and its painted copy, while it selects there. */
  private field: Field | null = null;
  private fieldAnchor = 0;
  private mirror: HTMLElement | null = null;
  /** In content, where the drag began and the range it selects. */
  private anchor: Caret | null = null;
  private range: Range | null = null;
  /** The selected part of the field, while there is one, which typing replaces. */
  private selected: { field: Field; start: number; end: number } | null = null;
  /** The rich text editor it selects in, and the listener that paints its selection. */
  private editor: { editor: RichEditor; follow: () => void } | null = null;

  constructor(private readonly scope: Element) {}

  /**
   * A press at a point: what was selected is no longer, and the press marks where a drag would
   * select from, in a field or in text of the stage whose text can be selected.
   */
  begin(point: Point, target: Element) {
    this.clear();
    const field = target.closest<Field>(selectableFields);
    if (field && this.scope.contains(field)) {
      this.field = field;
      this.fieldAnchor = fieldOffsetAt(field, point);
      field.setSelectionRange(this.fieldAnchor, this.fieldAnchor);
      return;
    }
    // In text, the caret is found once a drag needs it, so a click reads no layout; a rich text
    // editor takes its caret at once.
    this.pressed = point;
    if (editorOf(target)) this.anchorAt();
  }

  /** Where a press in text was, until a drag from it finds its caret. */
  private pressed: Point | null = null;

  /** Finds the caret where the press in text was, where a drag selects from. */
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
    // In a rich text editor, the press puts the editor's caret there, and the editor's selection
    // is painted from then on, as it changes.
    const found = editorOf(caret.node);
    if (!found) return;
    const { editor } = found;
    const follow = () => this.follow(editor);
    editor.on('transaction', follow);
    this.editor = { editor, follow };
    editor.commands.setTextSelection(editor.view.posAtDOM(caret.node, caret.offset));
  }

  /** Paints a rich text editor's selection, where its text is now. */
  private follow(editor: RichEditor) {
    const shown = highlight();
    if (this.range) shown?.delete(this.range);
    this.range = null;
    const { from, to, empty } = editor.view.state.selection;
    if (empty) return;
    const start = editor.view.domAtPos(from);
    const end = editor.view.domAtPos(to);
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    this.range = range;
    shown?.add(range);
  }

  /** A drag on to a point: the selection runs from where the press was to there. */
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
    // In a rich text editor, the editor's selection, which paints itself as it changes.
    const editor = this.editor?.editor;
    if (editor) {
      const { view } = editor;
      const from = view.posAtDOM(range.startContainer, range.startOffset);
      const to = words ? view.posAtDOM(range.endContainer, range.endOffset) : from;
      editor.commands.setTextSelection({ from, to });
      return;
    }
    const shown = highlight();
    if (this.range) shown?.delete(this.range);
    this.range = words ? range : null;
    if (words) shown?.add(range);
  }

  /** Paints the field's selection again, as its value or scroll changed. */
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

  /** The field's value and scroll as last painted, and the frame that looks for a change to them. */
  private painted = { value: '', scroll: 0 };
  private watching = 0;

  /**
   * Follows the field while its selection is painted: a component that changes its text, such as
   * Bold wrapping the selected word, sets its own selection there, which is painted in its place;
   * a field drawn anew or emptied of its selection paints none.
   */
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

  /**
   * The value a field takes for text typed into it, as a keyboard types: over its selected part,
   * or at the caret typing left, or at its end. `text` null deletes: the selected part, or the
   * character before the caret. Returns the value and where the caret is after it.
   */
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
    // Typing that began over a selection goes on at the caret; anywhere else, at the end.
    this.caret = selected || this.caret?.field === field ? { field, at } : null;
    return { value: next, at };
  }

  /**
   * A field's own selection shown again as the field takes focus again, as a browser shows it,
   * such as a word left selected while a menu's command ran.
   */
  reveal(field: Element) {
    if (!field.matches(selectableFields)) return;
    const { selectionStart: start, selectionEnd: end } = field as Field;
    if (start === null || end === null || start === end) return;
    this.selected = { field: field as Field, start, end };
    this.paint();
  }

  /** Where typing goes on in a field, after it typed over a selection there. */
  private caret: { field: Field; at: number } | null = null;

  /** Nothing is selected any more, as a press elsewhere or the stage's end leaves it. */
  clear() {
    if (this.editor) this.editor.editor.off('transaction', this.editor.follow);
    this.editor = null;
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
