/*
 * The virtual pointer's keyboard (VirtualPointer.ts): the keys it presses and holds, the field it
 * types into, and the element that has its focus. That element is marked as focused, because the
 * inert stage can't focus it.
 */
import type { PointerSelection } from './pointer/VirtualSelection';
import type { StageEditors } from './pointer/StageEditors';
import { focusMark, focusWithinMark, mark } from './pointer/PointerStates';
import { chainOf, textFields, type Modifiers } from './pointer/PointerTargets';
import { keyboardFocused, lendSelection } from './BrowserStandIns';

/** The modifier keys, by their `key`, and the flag each sets on every event while it is held. */
const modifierFlags: Record<string, keyof Modifiers> = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Shift: 'shiftKey',
  Meta: 'metaKey',
};

/** The physical key a key is typed on, as a keyboard event's `code` names it. */
function codeOf(key: string) {
  if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`;
  if (/^\d$/.test(key)) return `Digit${key}`;
  if (key === ' ') return 'Space';
  if (key in modifierFlags) return `${key}Left`;
  return key;
}

export class KeyboardControl {
  /** The keys held down, such as Alt. Every event carries their flags while they are held. */
  private held = new Set<string>();
  /** The field being typed into, marked as focused, because an inert stage can't focus it. */
  focused: Element | null = null;

  constructor(
    private readonly scope: Element,
    private readonly selection: PointerSelection,
    private readonly editors: StageEditors,
  ) {}

  /** The flags of the held modifier keys, for an event. */
  get modifiers(): Modifiers {
    const flags = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false };
    for (const key of this.held) if (key in modifierFlags) flags[modifierFlags[key]] = true;
    return flags;
  }

  /** Marks a field as focused, and the element that holds it as holding focus. */
  focus(element: Element | null) {
    if (this.focused === element) return;
    if (this.focused) {
      mark(this.focused, focusMark, false);
      for (const node of chainOf(this.scope, this.focused)) mark(node, focusWithinMark, false);
    }
    this.focused = element;
    if (!element) return;
    mark(element, focusMark, true);
    for (const node of chainOf(this.scope, element)) mark(node, focusWithinMark, true);
    this.selection.reveal(element);
  }

  /**
   * Types into a field of the stage as a keyboard does: a key down, then the text going in, which a
   * component that holds the field's value receives as an input event, then the key up. `text` is
   * the characters to add, or `null` to delete the last character.
   */
  type(selector: string, text: string | null) {
    const field = this.scope.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (!field) return;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
      this.typeInEditor(field, text);
      return;
    }
    this.focus(field);
    const keyboard = this.keyboard(text ?? 'Backspace');
    if (!field.dispatchEvent(new KeyboardEvent('keydown', keyboard))) return;
    // Over what a drag selected in the field, or at its end.
    const { value, at } = this.selection.typed(field, text);
    // The value's own setter, under React's, so React sees the change as typing.
    const prototype =
      field instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    // A field's value is an accessor on its prototype, with a setter.
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(field, value);
    if (at !== value.length) field.setSelectionRange(at, at);
    field.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        composed: true,
        inputType: text === null ? 'deleteContentBackward' : 'insertText',
        data: text,
      }),
    );
    field.dispatchEvent(new KeyboardEvent('keyup', keyboard));
  }

  /**
   * Types into a rich text editor as a keyboard does: a key down, which the editor may handle
   * itself, such as Backspace; otherwise the text goes in at its selection, the way the editor
   * takes typed text, so its input rules and suggestions see it; then the key up.
   */
  private typeInEditor(element: Element, text: string | null) {
    const found = this.editors.use(element);
    if (!found) return;
    const { editor, content } = found;
    this.focus(content);
    const keyboard = this.keyboard(text ?? 'Backspace');
    if (content.dispatchEvent(new KeyboardEvent('keydown', keyboard))) {
      const { view } = editor;
      const { from, to } = view.state.selection;
      if (text === null) view.dispatch(view.state.tr.delete(from === to ? from - 1 : from, to));
      else {
        const insert = () => view.state.tr.insertText(text, from, to);
        if (!view.someProp('handleTextInput', (handle) => handle(view, from, to, text, insert)))
          view.dispatch(insert());
      }
    }
    content.dispatchEvent(new KeyboardEvent('keyup', keyboard));
  }

  /** A keyboard event's fields for a key, with the held modifier keys. */
  private keyboard(key: string) {
    return {
      key,
      code: codeOf(key),
      bubbles: true,
      cancelable: true,
      composed: true,
      ...this.modifiers,
    };
  }

  /** The element a key goes to: an element of the stage, else what is focused, else the stage. */
  private keyTarget(selector?: string) {
    return (selector && this.scope.querySelector(selector)) || this.focused || this.scope;
  }

  /**
   * Moves the keyboard's focus to an element of the stage, as a Tab does, or with `null` away from
   * the stage. The element is marked as focused, because the inert stage can't focus it, and it
   * receives the focus events a browser sends, as does the element that loses focus.
   */
  keyboardFocus(selector: string | Element | null) {
    const element =
      typeof selector === 'string' ? this.scope.querySelector(selector) : (selector ?? null);
    const from = this.focused;
    if (from === element) return;
    this.focus(element);
    if (element) keyboardFocused.set(this.scope, (next) => this.keyboardFocus(next));
    else keyboardFocused.delete(this.scope);
    const events = (target: Element, out: boolean, relatedTarget: Element | null) => {
      target.dispatchEvent(new FocusEvent(out ? 'blur' : 'focus', { relatedTarget }));
      target.dispatchEvent(
        new FocusEvent(out ? 'focusout' : 'focusin', {
          bubbles: true,
          composed: true,
          relatedTarget,
        }),
      );
    };
    if (from) events(from, true, element);
    if (element) events(element, false, from);
  }

  /**
   * Presses a key on an element of the stage, or on the field being typed into or focused, and does
   * what a browser does for that key there: Tab leaves the field being typed into, which receives a
   * blur, and Enter in a single-line field submits its form.
   */
  key(key: string, selector?: string) {
    const target = this.keyTarget(selector);
    let allowed = true;
    lendSelection(this.editors.use(target) ? this.scope : undefined, () => {
      allowed = target.dispatchEvent(new KeyboardEvent('keydown', this.keyboard(key)));
    });
    if (allowed && key === 'Tab' && target === this.focused) {
      this.focus(null);
      target.dispatchEvent(new FocusEvent('blur'));
      target.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
    }
    if (
      allowed &&
      key === 'Enter' &&
      target instanceof HTMLInputElement &&
      target.matches(textFields)
    )
      target.form?.requestSubmit();
    target.dispatchEvent(new KeyboardEvent('keyup', this.keyboard(key)));
  }

  /**
   * Holds a key down, such as Alt, on an element of the stage or the field being typed into. While
   * it is held, every event the pointer and the keyboard send carries its flag, as for Alt with a
   * letter.
   */
  keyDown(key: string, selector?: string) {
    if (this.held.has(key)) return;
    this.held.add(key);
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keydown', this.keyboard(key)));
  }

  /** Releases a held key. */
  keyUp(key: string, selector?: string) {
    if (!this.held.delete(key)) return;
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keyup', this.keyboard(key)));
  }

  /** Releases every held key. */
  releaseKeys() {
    for (const key of [...this.held]) this.keyUp(key);
  }
}
