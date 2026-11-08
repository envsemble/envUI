/*
 * The keyboard of the pointer no one sees (VirtualPointer.ts): the keys it presses and holds, the
 * field it types into and the element its focus is on, marked as focused, as the inert stage can't
 * focus it.
 */
import { editorOf, type PointerSelection } from './pointer/VirtualSelection';
import { focusMark, focusWithinMark, mark } from './pointer/PointerStates';
import { chainOf, textFields, type Modifiers } from './pointer/PointerTargets';
import { keyboardFocused, lendSelection } from './BrowserStandIns';

/** The modifier keys, by their key, and the flag a held one sets on every event. */
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
  /** The keys held down, such as Alt, whose flags every event carries meanwhile. */
  private held = new Set<string>();
  /** The field typed into, marked as focused, as an inert stage can't focus it. */
  focused: Element | null = null;

  constructor(
    private readonly scope: Element,
    private readonly selection: PointerSelection,
  ) {}

  /** The flags of the modifier keys held, for an event. */
  get modifiers(): Modifiers {
    const flags = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false };
    for (const key of this.held) if (key in modifierFlags) flags[modifierFlags[key]] = true;
    return flags;
  }

  /** Marks a field as focused, and what holds it as holding focus. */
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
   * Types into a field of the stage as a keyboard does: a key down, the text going in, which
   * a component that holds the field's value hears as an input event, and the key up. `text` is
   * the characters to add, or `null` to delete the last one.
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
    // A field's value is an accessor of its prototype's, with a setter.
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
   * Types into a rich text editor as a keyboard does: a key down, which the editor may take for
   * itself, such as Backspace, else the text going in at its selection, as the editor takes typed
   * text, so its input rules and suggestions see it, and the key up.
   */
  private typeInEditor(element: Element, text: string | null) {
    const found = editorOf(element);
    if (!found) return;
    const { editor, content } = found;
    this.focus(content);
    const keyboard = this.keyboard(text ?? 'Backspace');
    if (content.dispatchEvent(new KeyboardEvent('keydown', keyboard))) {
      const { view } = editor;
      const { from, to } = view.state.selection;
      if (text === null) view.dispatch(view.state.tr.delete(from === to ? from - 1 : from, to));
      else if (
        !view.someProp<(view: unknown, from: number, to: number, text: string) => boolean>(
          'handleTextInput',
          (handle) => handle(view, from, to, text),
        )
      )
        view.dispatch(view.state.tr.insertText(text, from, to));
    }
    content.dispatchEvent(new KeyboardEvent('keyup', keyboard));
  }

  /** A keyboard event's fields for a key, with the modifier keys held. */
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

  /** What a key goes to: an element of the stage, or what is focused, or the stage. */
  private keyTarget(selector?: string) {
    return (selector && this.scope.querySelector(selector)) || this.focused || this.scope;
  }

  /**
   * The keyboard's focus arrives on an element of the stage, as a Tab brings it, or with
   * nothing leaves it: the element is marked as focused, as the inert stage can't focus it, and
   * hears the focus events a browser sends, as does the element it leaves.
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
   * Presses a key on an element of the stage, or on the field typed into or focused, with what a
   * browser does for it there: Tab leaves the field typed into, which hears its blur, and Enter in
   * a single-line field submits its form.
   */
  key(key: string, selector?: string) {
    const target = this.keyTarget(selector);
    let allowed = true;
    lendSelection(editorOf(target) ? this.scope : undefined, () => {
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
   * Holds a key down, such as Alt, on an element of the stage or the field typed into: while it
   * is held, every event the pointer and the keyboard send carries its flag, as Alt with a letter.
   */
  keyDown(key: string, selector?: string) {
    if (this.held.has(key)) return;
    this.held.add(key);
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keydown', this.keyboard(key)));
  }

  /** Lets a held key go. */
  keyUp(key: string, selector?: string) {
    if (!this.held.delete(key)) return;
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keyup', this.keyboard(key)));
  }

  /** Lets every held key go. */
  releaseKeys() {
    for (const key of [...this.held]) this.keyUp(key);
  }
}
