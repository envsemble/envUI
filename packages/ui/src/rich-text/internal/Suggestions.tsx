'use client';

import {
  useEffect,
  useId,
  useImperativeHandle,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from 'react';
import { ReactRenderer } from '@tiptap/react';
import { exitSuggestion, type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { richText as richTextMessages } from '../../foundations/messages/richText.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { Listbox } from './Listbox.js';
import { useActiveDescendant } from '../../internal/useRovingFocus.js';
import type { RichTextReference, RichTextReferenceSource } from '../Types.js';

interface SuggestionItem {
  id: string;
  label: string;
}
interface MenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

type MenuProps = SuggestionProps<SuggestionItem> & {
  /** The list's name, such as People; the provider's Suggestions where the source names none. */
  label: string | undefined;
  /** Whether the source's items failed to load. */
  failed: boolean;
  pluginKey: PluginKey;
  ref?: Ref<MenuHandle>;
};

/** Each option's key: its place in the list, since sources may repeat an identity. */
const keyOf = (items: readonly SuggestionItem[]) => (item: SuggestionItem) =>
  String(items.indexOf(item));

/**
 * The suggestions of a trigger, such as @: a listbox beside the caret whose options the editor's
 * arrow keys move through and Enter picks, while focus stays in the document. It closes as focus
 * leaves the editor, also with Tab. Its words come from EnvUIProvider's messages.richText.
 */
function SuggestionMenu({
  items,
  command,
  loading,
  label,
  failed,
  editor,
  pluginKey,
  ref,
}: MenuProps) {
  const messages = useMessages('richText', richTextMessages);
  const getKey = keyOf(items);
  // New items start at the first, in the render that shows them, so a key pressed as they arrive
  // moves from there.
  const [active, setActive] = useState({ items, key: items.length ? '0' : null });
  if (active.items !== items) setActive({ items, key: items.length ? '0' : null });
  const activeKey = active.items === items ? active.key : items.length ? '0' : null;
  const setActiveKey = (key: string) => setActive({ items, key });
  const listbox = useActiveDescendant({
    items,
    getKey,
    activeKey,
    onActiveKeyChange: setActiveKey,
    onSelect: (item) => command(item),
    loop: true,
  });
  const input = listbox.getInputProps();
  const id = useId();
  const activeDescendant = loading ? undefined : input['aria-activedescendant'];
  useEffect(() => {
    const element = editor.view.dom;
    element.setAttribute('aria-controls', id);
    element.setAttribute('aria-expanded', 'true');
    element.setAttribute('aria-autocomplete', 'list');
    if (activeDescendant) element.setAttribute('aria-activedescendant', activeDescendant);
    else element.removeAttribute('aria-activedescendant');
    return () => {
      for (const name of [
        'aria-controls',
        'aria-expanded',
        'aria-autocomplete',
        'aria-activedescendant',
      ])
        element.removeAttribute(name);
    };
  }, [id, activeDescendant, editor]);
  // The active option stays in view as the arrows move it past the list's edge: the list scrolls,
  // never the page, as focus stays in the document.
  useEffect(() => {
    if (!activeDescendant) return;
    const option = editor.view.dom.ownerDocument.getElementById(activeDescendant);
    const list = option?.closest<HTMLElement>('.env-rich-text-suggestions');
    if (!option || !list) return;
    const shown = list.getBoundingClientRect();
    const box = option.getBoundingClientRect();
    // In layout pixels, as the list may be drawn scaled.
    const scale = shown.height / list.offsetHeight || 1;
    const top = shown.top + list.clientTop * scale;
    const bottom = top + list.clientHeight * scale;
    if (box.top < top) list.scrollTop -= (top - box.top) / scale;
    else if (box.bottom > bottom) list.scrollTop += (box.bottom - bottom) / scale;
  }, [activeDescendant, editor]);
  useImperativeHandle(
    ref,
    () => ({
      onKeyDown(event) {
        if (event.isComposing || event.keyCode === 229) return false;
        // Tab leaves the editor, and the list closes as focus goes.
        if (event.key === 'Tab') {
          exitSuggestion(editor.view, pluginKey);
          return false;
        }
        // Enter always belongs to the list while it shows, also while it loads.
        if (event.key === 'Enter') {
          if (!loading) input.onKeyDown(event as unknown as ReactKeyboardEvent<HTMLElement>);
          return true;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return false;
        input.onKeyDown(event as unknown as ReactKeyboardEvent<HTMLElement>);
        return true;
      },
    }),
    [input, loading, editor, pluginKey],
  );
  const empty = loading
    ? messages.suggestionsLoading
    : failed
      ? messages.suggestionsFailed
      : messages.suggestionsEmpty;
  return (
    <Listbox
      id={id}
      className="env-rich-text-suggestions"
      aria-label={label ?? messages.suggestions}
      aria-busy={loading}
      items={loading || failed ? [] : items}
      getKey={getKey}
      getOptionProps={listbox.getOptionProps}
      renderItem={(item) => ({ label: item.label })}
      empty={empty}
    />
  );
}

/**
 * Suggestions for a trigger. Tiptap owns query matching, asynchronous cancellation and staleness,
 * and positioning; the list mounts inside the editor's root, beside the caret and above what the
 * editor sits in, such as a Dialog, and closes as focus leaves the editor.
 */
export function createSuggestionOptions<I extends SuggestionItem>(source: {
  char: string;
  label?: string;
  minQueryLength?: number;
  debounce?: number;
  allowSpaces?: boolean;
  items: NonNullable<SuggestionOptions<I>['items']>;
}): Omit<SuggestionOptions<I>, 'editor'> {
  let failed = false;
  const pluginKey = new PluginKey(`env-rich-text-${source.char}`);
  return {
    char: source.char,
    pluginKey,
    minQueryLength: source.minQueryLength,
    debounce: source.debounce,
    allowSpaces: source.allowSpaces,
    // Fixed, so that a scrolling container around the editor doesn't clip the list.
    floatingUi: { strategy: 'fixed' },
    // The list closes as focus leaves the editor (its onBlur), which a press elsewhere does; a
    // press that leaves focus in the editor, such as on a formatting button, keeps it open.
    dismissOnOutsideClick: false,
    items: async (request) => {
      failed = false;
      try {
        return await source.items(request);
      } catch {
        if (!request.signal.aborted) failed = true;
        return [];
      }
    },
    render: () => {
      let component: ReactRenderer<MenuHandle, MenuProps> | null = null;
      let unmount: (() => void) | undefined;
      const menuProps = (props: SuggestionProps<I>): MenuProps => ({
        ...(props as unknown as SuggestionProps<SuggestionItem>),
        label: source.label,
        failed: props.loading ? false : failed,
        pluginKey,
      });
      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionMenu, {
            editor: props.editor,
            props: menuProps(props),
            className: 'env-rich-text-suggestions-positioner',
          });
          // Inside the editor's root, so it shares the editor's theme and layer, also in a Dialog,
          // which treats a press on it as one inside.
          const element = component.element as HTMLElement;
          const host = props.editor.view.dom.closest('.env-rich-text-editor');
          (host ?? props.editor.view.dom.ownerDocument.body).append(element);
          const release = props.mount(element);
          unmount = () => {
            release();
            element.remove();
          };
        },
        onUpdate: (props) => component?.updateProps(menuProps(props)),
        onKeyDown: ({ event }) => component?.ref?.onKeyDown(event) ?? false,
        onExit: () => {
          unmount?.();
          unmount = undefined;
          component?.destroy();
          component = null;
        },
      };
    },
  };
}

export function referenceSuggestion(source: RichTextReferenceSource) {
  return createSuggestionOptions<RichTextReference>({
    ...source,
    items: async (request) => [...(await source.items(request))],
  });
}
