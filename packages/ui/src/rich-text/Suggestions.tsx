import { forwardRef, useEffect, useId, useImperativeHandle, useState } from 'react';
import { ReactRenderer } from '@tiptap/react';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { Button } from '../actions/Button.js';
import { Theme, useTheme } from '../foundations/Theme.js';
import type { RichTextReference, RichTextReferenceSource } from './Types.js';

interface MenuItem {
  id: string;
  label: string;
}
interface MenuHandle {
  onKeyDown: (event: KeyboardEvent) => boolean;
}
const SuggestionMenu = forwardRef<
  MenuHandle,
  SuggestionProps<MenuItem> & { label: string; error: string }
>(function SuggestionMenu({ items, command, loading, label, error, editor }, ref) {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  const id = useId();
  useEffect(() => setSelected(0), [items]);
  useEffect(() => {
    const element = editor.view.dom;
    element.setAttribute('aria-controls', id);
    element.setAttribute('aria-expanded', 'true');
    element.setAttribute('aria-autocomplete', 'list');
    if (items[selected] && !loading)
      element.setAttribute('aria-activedescendant', `${id}-${selected}`);
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
  }, [id, selected, items, loading, editor]);
  useImperativeHandle(
    ref,
    () => ({
      onKeyDown(event) {
        if (event.isComposing || event.keyCode === 229) return false;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          if (items.length)
            setSelected(
              (index) =>
                (index + (event.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length,
            );
          return true;
        }
        if (event.key === 'Enter') {
          if (!loading && items[selected]) command(items[selected]);
          return true;
        }
        return false;
      },
    }),
    [items, selected, loading, command],
  );
  return (
    <Theme theme={theme}>
      <div
        className="env-rich-text-suggestions"
        id={id}
        role="listbox"
        aria-label={label}
        aria-busy={loading}
      >
        {loading ? (
          <div role="status">Loading suggestions…</div>
        ) : error ? (
          <div role="status">{error}</div>
        ) : !items.length ? (
          <div role="status">No results</div>
        ) : (
          items.map((item, index) => (
            <Button
              key={item.id}
              role="option"
              id={`${id}-${index}`}
              aria-selected={index === selected}
              variant="secondary"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command(item)}
            >
              {item.label}
            </Button>
          ))
        )}
      </div>
    </Theme>
  );
});

/** Tiptap owns query matching, async cancellation/staleness, mounting, and Floating UI. */
export function createSuggestionOptions<I extends MenuItem>(source: {
  char: string;
  label?: string;
  minQueryLength?: number;
  debounce?: number;
  allowSpaces?: boolean;
  items: NonNullable<SuggestionOptions<I>['items']>;
}): Omit<SuggestionOptions<I>, 'editor'> {
  let error = '';
  return {
    char: source.char,
    pluginKey: new PluginKey(`env-rich-text-${source.char}`),
    minQueryLength: source.minQueryLength,
    debounce: source.debounce,
    allowSpaces: source.allowSpaces,
    items: async (request) => {
      error = '';
      try {
        return await source.items(request);
      } catch {
        if (!request.signal.aborted) error = 'Suggestions could not load. Try typing again.';
        return [];
      }
    },
    render: () => {
      let component: ReactRenderer<MenuHandle> | null = null;
      let unmount: (() => void) | undefined;
      const menuProps = (props: SuggestionProps<I>) => ({
        ...props,
        label: source.label ?? 'Suggestions',
        error: props.loading ? '' : error,
      });
      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionMenu, {
            editor: props.editor,
            props: menuProps(props),
          });
          unmount = props.mount(component.element as HTMLElement);
        },
        onUpdate: (props) => component?.updateProps(menuProps(props)),
        onKeyDown: ({ event }) => component?.ref?.onKeyDown(event) ?? false,
        onExit: () => {
          unmount?.();
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
