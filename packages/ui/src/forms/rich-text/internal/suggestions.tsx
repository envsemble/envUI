'use client';

import { useEffect, useId, useImperativeHandle, useState, type ReactNode, type Ref } from 'react';
import { ReactRenderer } from '@tiptap/react';
import { exitSuggestion, type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { richText as richTextMessages } from '../../../foundations/messages/richText.js';
import { useMessages } from '../../../internal/provider/EnvUIContext.js';
import { Listbox } from './Listbox.js';
import { useActiveDescendant } from '../../internal/useRovingFocus.js';
import type {
  RichTextReference,
  RichTextReferenceSource,
  RichTextSuggestionContent,
} from '../types.js';
import '../../../styles/Base.css';
import '../../../styles/Prose.css';
import '../../../styles/RichText.css';

interface SuggestionItem {
  id: string;
  label: string;
}
interface MenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

type RowContent<I> = (item: I) => RichTextSuggestionContent & { icon?: ReactNode };

type MenuProps<I extends SuggestionItem> = SuggestionProps<I> & {
  label: string | undefined;
  rowContent: RowContent<I> | undefined;
  failed: boolean;
  pluginKey: PluginKey;
  ref?: Ref<MenuHandle>;
};

const keyByPlace =
  <I,>(items: readonly I[]) =>
  (item: I) =>
    String(items.indexOf(item));

function SuggestionMenu<I extends SuggestionItem>({
  items,
  command,
  loading,
  label,
  rowContent,
  failed,
  editor,
  pluginKey,
  ref,
}: MenuProps<I>) {
  const messages = useMessages('richText', richTextMessages);
  const getKey = keyByPlace(items);
  const firstOptionKey = items.length ? '0' : null;
  const [active, setActive] = useState({ items, key: firstOptionKey });
  const itemsJustArrived = active.items !== items;
  if (itemsJustArrived) setActive({ items, key: firstOptionKey });
  const activeKey = itemsJustArrived ? firstOptionKey : active.key;
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
  useEffect(() => {
    if (!activeDescendant) return;
    const option = editor.view.dom.ownerDocument.getElementById(activeDescendant);
    const list = option?.closest<HTMLElement>('.env-rich-text-suggestions');
    if (option && list) scrollListNotPageToShow(option, list);
  }, [activeDescendant, editor]);
  useImperativeHandle(
    ref,
    () => ({
      onKeyDown(event) {
        const imeComposing = event.isComposing || event.keyCode === 229;
        if (imeComposing) return false;
        if (event.key === 'Tab') {
          exitSuggestion(editor.view, pluginKey);
          return false;
        }
        if (event.key === 'Enter') {
          if (!loading) input.onKeyDown(event);
          return true;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return false;
        input.onKeyDown(event);
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
      renderItem={(item) => ({ ...rowContent?.(item), label: item.label })}
      empty={empty}
    />
  );
}

function scrollListNotPageToShow(option: HTMLElement, list: HTMLElement) {
  const shown = list.getBoundingClientRect();
  const box = option.getBoundingClientRect();
  const drawnScale = shown.height / list.offsetHeight || 1;
  const top = shown.top + list.clientTop * drawnScale;
  const bottom = top + list.clientHeight * drawnScale;
  if (box.top < top) list.scrollTop -= (top - box.top) / drawnScale;
  else if (box.bottom > bottom) list.scrollTop += (box.bottom - bottom) / drawnScale;
}

const fixedAboveScrollingContainers = { strategy: 'fixed' } as const;
const closeOnEditorBlurOnly = false;

export function createSuggestionOptions<I extends SuggestionItem>(source: {
  char: string;
  label?: string;
  minQueryLength?: number;
  debounce?: number;
  allowSpaces?: boolean;
  rowContent?: RowContent<I>;
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
    floatingUi: fixedAboveScrollingContainers,
    dismissOnOutsideClick: closeOnEditorBlurOnly,
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
      let component: ReactRenderer<MenuHandle, MenuProps<I>> | null = null;
      let unmount: (() => void) | undefined;
      const menuProps = (props: SuggestionProps<I>): MenuProps<I> => ({
        ...props,
        label: source.label,
        rowContent: source.rowContent,
        failed: props.loading ? false : failed,
        pluginKey,
      });
      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionMenu<I>, {
            editor: props.editor,
            props: menuProps(props),
            className: 'env-rich-text-suggestions-positioner',
          });
          const element = component.element as HTMLElement;
          const editorRootSharingThemeLayerAndDialog =
            props.editor.view.dom.closest('.env-rich-text-editor');
          (editorRootSharingThemeLayerAndDialog ?? props.editor.view.dom.ownerDocument.body).append(
            element,
          );
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

export function referenceSuggestion({
  trigger,
  search,
  renderSuggestion,
  ...source
}: RichTextReferenceSource) {
  return createSuggestionOptions<RichTextReference>({
    ...source,
    rowContent: renderSuggestion,
    char: trigger,
    items: async (request) => [...(await search(request))],
  });
}
