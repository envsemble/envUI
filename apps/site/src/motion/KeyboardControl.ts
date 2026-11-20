import type { PointerSelection } from './pointer/VirtualSelection';
import { focusMark, focusWithinMark, mark } from './pointer/PointerStates';
import { chainOf, textFields, type Modifiers } from './pointer/PointerTargets';
import { keyboardFocused } from './BrowserStandIns';

const modifierFlags: Record<string, keyof Modifiers> = {
  Alt: 'altKey',
  Control: 'ctrlKey',
  Shift: 'shiftKey',
  Meta: 'metaKey',
};

function codeOf(key: string) {
  if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`;
  if (/^\d$/.test(key)) return `Digit${key}`;
  if (key === ' ') return 'Space';
  if (key in modifierFlags) return `${key}Left`;
  return key;
}

function setValueSoReactSeesTyping(field: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(field, value);
}

export class KeyboardControl {
  private held = new Set<string>();
  focused: Element | null = null;

  constructor(
    private readonly scope: Element,
    private readonly selection: PointerSelection,
  ) {}

  get modifiers(): Modifiers {
    const flags = { altKey: false, ctrlKey: false, shiftKey: false, metaKey: false };
    for (const key of this.held) if (key in modifierFlags) flags[modifierFlags[key]] = true;
    return flags;
  }

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

  type(selector: string, text: string | null) {
    const field = this.scope.querySelector(selector);
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    this.focus(field);
    const keyboard = this.keyboard(text ?? 'Backspace');
    if (!field.dispatchEvent(new KeyboardEvent('keydown', keyboard))) return;
    const { value, at } = this.selection.typed(field, text);
    setValueSoReactSeesTyping(field, value);
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

  private keyTarget(selector?: string) {
    return (selector && this.scope.querySelector(selector)) || this.focused || this.scope;
  }

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

  key(key: string, selector?: string) {
    const target = this.keyTarget(selector);
    const allowed = target.dispatchEvent(new KeyboardEvent('keydown', this.keyboard(key)));
    if (allowed && key === 'Tab' && target === this.focused) {
      this.focus(null);
      target.dispatchEvent(new FocusEvent('blur'));
      target.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
    }
    const entersSingleLineField =
      allowed &&
      key === 'Enter' &&
      target instanceof HTMLInputElement &&
      target.matches(textFields);
    if (entersSingleLineField) target.form?.requestSubmit();
    target.dispatchEvent(new KeyboardEvent('keyup', this.keyboard(key)));
  }

  keyDown(key: string, selector?: string) {
    if (this.held.has(key)) return;
    this.held.add(key);
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keydown', this.keyboard(key)));
  }

  keyUp(key: string, selector?: string) {
    if (!this.held.delete(key)) return;
    this.keyTarget(selector).dispatchEvent(new KeyboardEvent('keyup', this.keyboard(key)));
  }

  releaseKeys() {
    for (const key of [...this.held]) this.keyUp(key);
  }
}
