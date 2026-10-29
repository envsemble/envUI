---
title: CommandPalette
summary: A quick-open dialog near the top of the window that finds a document, a page, a person or a command by name.
status: stable
since: 0.5.0
category: Actions
aliases:
  - quick open
  - command menu
  - command bar
  - command launcher
  - cmdk
  - Ctrl+K
  - ⌘K
  - spotlight
  - go to anything
  - jump to
  - omnibox
  - SearchTrigger
  - SearchButton
  - search trigger
  - search button
  - quick open button
  - command palette button
  - search shortcut
  - empty state
  - no results
  - suggestions
  - recent items
useWhen:
  - Jumping to a document, a page or a person by name, from anywhere
  - Running a command by name, such as one without a visible control
  - A search button at the top of the navigation or in the top bar, with its shortcut
avoidWhen:
  - text: Choosing a value for a form field from a long list.
    use: Combobox
  - text: A short list of actions behind one control.
    use: Menu
  - text: Searching or filtering the content on the page.
    use: SearchField
components:
  - CommandPalette
examples:
  GoToDocument:
    role: overview
    motion: true
  RunCommand: example
  InSidebar: example
  IconOnly: example
  CommandPaletteAnatomy: anatomy
  TypeToSearch: example
  NarrowSidebar: example
  ShowRecent:
    role: do
    caption: Show recent items while the query is empty.
  EmptyUntilTyped:
    role: dont
    caption: An empty list until people type.
  ButtonLabel:
    role: do
    caption: Label the button Search, or what it searches where there are several.
  TypingLabel:
    role: dont
    caption: "A placeholder's words on the button: people expect to type in it."
---

# CommandPalette

## Variants

### Run a command

An item can end with its shortcut or a badge, and hints below the list say what keys do.

```tsx figure=RunCommand motion

```

### Opening it: the button and the shortcut

A secondary [Button](button.md) with the search icon, its label and the shortcut's keys at its far end reads like a search field.

- Pressing it opens the palette.
- So does <kbd>⌘</kbd>+<kbd>K</kbd> on Apple platforms and <kbd>Ctrl</kbd>+<kbd>K</kbd> elsewhere, from anywhere in the window, text fields included.

```tsx figure=InSidebar motion

```

### In a narrow header

Search is an icon button named Search, with its label and keys in a [Tooltip](tooltip.md) that opens below it.

```tsx figure=IconOnly motion

```

## Anatomy

```tsx figure=CommandPaletteAnatomy open

```

1. **Palette** (`env-command-palette`)
2. **Search field** (`env-command-palette-input`, `placeholder`)
3. **Group heading** (`env-command-palette-heading`)
4. **Item** (`env-command-palette-item`, `items`)
5. **Key hints** (`env-command-palette-footer`, `hints`)

## Behaviour

### Before people type, and when nothing matches

Suggestions show until people type, such as recent items, and choose like any result.

- With none yet, an invitation says what the palette finds.
- When nothing matches, the empty state takes the list's place: it quotes what people typed and suggests checking the spelling or other words.
- Typing again brings results back.

```tsx figure=TypeToSearch open motion

```

### Adapting to width

The button that opens it fills its container, such as the top of a drawer.

- Keep its label short in a narrow sidebar.
- Where even that doesn't fit, show the icon alone.

```tsx figure=NarrowSidebar widths="18 11" sweep

```

## Rules

The palette is a shortcut that shows something before people type, opened by a button labelled as a search.

```tsx figure=ShowRecent open

```

```tsx figure=EmptyUntilTyped open

```

```tsx figure=ButtonLabel

```

```tsx figure=TypingLabel

```

### One way among others

Keep another way to reach every command, such as a menu or a button: the palette is a shortcut, not the only path.

### Results

Rank the best matches first, and clear the query as the palette closes.

### Content

Name commands with a verb and what they act on, such as Invite people.

- Tell similar items apart with a line under the label, such as a folder.
- Show key hints only for keys the application handles.

## Accessibility

### Keyboard

| Key                                                                       | Action                                                               |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <kbd>⌘</kbd>+<kbd>K</kbd>, or <kbd>Ctrl</kbd>+<kbd>K</kbd>                | Opens the palette from anywhere in the window.                       |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                                | Moves the highlight, wrapping at the ends.                           |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd> | Moves to the first or last option, or by a page.                     |
| <kbd>Enter</kbd>                                                          | Chooses the highlighted option.                                      |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>Cmd</kbd>+<kbd>Enter</kbd>       | Chooses it another way the application sets, such as to open beside. |
| <kbd>Esc</kbd>                                                            | Closes the palette and returns focus.                                |

### envUI provides

- A modal dialog named by `aria-label`, with focus in its search field, kept inside and returned on close.
- The field as a `combobox` over a `listbox`, with the highlighted option as its active descendant.
- A polite count of results as they change.
- The empty state's title and description in that same polite status, with its icon hidden from assistive technology.
- For the button that opens it, a native `button` named by its label, or by `aria-label` when it shows only its icon, and the keys as Kbd, in the button's content color on every variant.

### You provide

- The shortcut that opens the palette, and a visible control that opens it too.
- `aria-keyshortcuts` on that control for the platform, `` `${modifier.key}+K` `` from `useModifierKey()`, and `aria-hidden` on the keys it shows, so the shortcut is announced once.
- An `aria-label`, and the items, filtered and ranked.
- `textValue` for labels that aren't plain text.

## Words to use

Ask for the palette's states in these words.

| Words            | In code                                                                                       | Use for                                                        |
| ---------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Suggestions      | `suggestedItems`, with a `group` such as Suggested                                            | Options shown before people type.                              |
| Recent items     | `suggestedItems`, with a `group` such as Recently opened                                      | The items people opened last, before they type.                |
| Type to search   | The empty state with an empty query: `emptyDescription`, `messages.commandPalette.emptyQuery` | Inviting a search, and what it finds, with nothing to suggest. |
| No results       | `emptyLabel`, `emptyDescription`, `messages.commandPalette.empty` and `emptyHint`             | Saying that the text found nothing, and what to try.           |
| Without the icon | `emptyIcon={null}`                                                                            | An empty state of words alone, such as one that loads.         |

## Compose

### Usage

The application owns the items and what choosing one does.

- `open` opens the palette, such as from a shortcut and from a visible control.
- `onOpenChange` receives false when <kbd>Esc</kbd>, a press on the backdrop or a choice closes it, and why, as a dialog's does: `escape-key`, `outside-press`, or `item-press` for a choice.
- The application filters and ranks the `items` itself, from the text in `inputValue` and `onInputValueChange`, and clears that text as the palette closes.
- `onAction` runs the chosen item, and `closeOnAction`, true by default, closes the palette after it.
- `aria-label` names the dialog, its search field and its list.
- `placeholder` shows in the empty field.
- `suggestedItems` show in place of `items` while the field is empty, and the empty state in place of the list when there are no options.

```tsx source=GoToDocument

```

#### Items

Each CommandPaletteItem has an `id` and a `label`, with `textValue` for a label that isn't plain text.

- `description` is muted text under the label, such as a folder.
- `icon` is a decorative icon before it.
- `end` is content at the end, such as a Kbd shortcut or a Badge.
- `disabled` shows an item that can't be chosen.
- `group` names its group, whose heading shows where the group changes between items, such as Recently opened while the query is empty.

#### Suggestions and the empty state

`suggestedItems` show while the field is empty, or holds only spaces, in place of `items`, such as recent documents or suggested pages with a `group` heading; they are options like any other, highlighted, chosen with <kbd>Enter</kbd> or <kbd>Ctrl</kbd>+<kbd>Enter</kbd> and passed to `onAction`.

With no options, the empty state shows in place of the list: an icon on a muted circle, a title and a quieter description, as the polite status.

- While the field is empty: the Search icon and `messages.commandPalette.emptyQuery`, Type to search, with no description; `emptyDescription` says what the palette finds.
- When the text finds nothing: SearchOff, `messages.commandPalette.empty`, No results, and `messages.commandPalette.emptyHint({ query })`, which quotes the trimmed text.
- `emptyLabel`, `emptyDescription` and `emptyIcon` replace the title, the description and the icon in either state; `null` or `false` hides the description or the icon. Pass a value that depends on the query to change one state only.
- The icon is decorative and hidden from assistive technology; the title and description are announced.

```tsx
const typed = query.trim() !== '';

<CommandPalette
  aria-label="Go to document"
  inputValue={query}
  onInputValueChange={setQuery}
  items={matches}
  // Recent documents, each with group: 'Recently opened'.
  suggestedItems={recent}
  emptyLabel={typed ? 'No matching documents' : undefined}
  emptyDescription={typed ? undefined : 'Find a document by its name or folder.'}
  {...props}
/>;
```

#### Commands and key hints

`onAction` receives the item and `{ modifier }`, true while <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> was held, such as to open beside. `hints` show keys below the list as Kbd, such as `{ keys: ['Enter'], label: 'Open' }`, and `footer` holds other content after them, as the RunCommand example does.

```tsx
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  aria-label="Run a command"
  inputValue={query}
  onInputValueChange={setQuery}
  items={[
    { id: 'new', label: 'New document', icon: <NoteAdd />, end: <Kbd keys={['Ctrl', 'N']} /> },
    { id: 'automations', label: 'Create an automation', end: <Badge tone="accent">New</Badge> },
  ]}
  onAction={(item, { modifier }) => run(item.id, { beside: modifier })}
  hints={[{ keys: ['Enter'], label: 'Run' }]}
  footer="Shortcuts work anywhere in the workspace."
/>
```

#### The button that opens it

The button is a Button with `variant="secondary"`, the Search icon as its `startIcon`, and a Kbd of the keys in its `end` slot, as the InSidebar example does.

- `aria-hidden` on the Kbd and `aria-keyshortcuts` on the button announce the shortcut once.
- Its `onClick` opens the palette.
- With `fullWidth` it fills its container, such as a Drawer's `header`.

```tsx
<Button
  variant="secondary"
  fullWidth
  startIcon={<Search />}
  end={<Kbd keys={[modifier.label, 'K']} aria-hidden />}
  aria-keyshortcuts={`${modifier.key}+K`}
  onClick={() => setOpen(true)}
>
  Search
</Button>
```

#### The shortcut

The application listens for the shortcut once, at its root, however many buttons show it, and opens the same palette the button does. It skips an event whose `defaultPrevented` is set, so a key press that something else already handled, such as an editor's own shortcut, is left alone.

`useModifierKey()`, on [Kbd's page](kbd.md), gives the platform's modifier.

- Its `key`, `Meta` or `Control`, for `aria-keyshortcuts` and the listener.
- Its `label`, ⌘ or Ctrl, for Kbd.
- It is Ctrl on the server and while the page hydrates, so server-rendered markup matches, and becomes ⌘ on Apple platforms right after.
- Don't read `navigator` while rendering: it doesn't exist on the server, and markup that differs from the server's fails to hydrate.

```tsx
const modifier = useModifierKey();

useEffect(() => {
  const onKeyDown = (event: KeyboardEvent) => {
    const pressed =
      modifier.key === 'Meta' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
    if (event.defaultPrevented || !pressed || event.altKey || event.shiftKey) return;
    if (event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    setSearchOpen((open) => !open);
  };
  addEventListener('keydown', onKeyDown);
  return () => removeEventListener('keydown', onKeyDown);
}, [modifier.key]);
```

#### Icon only

In a narrow header, the button is an IconButton with `variant="ghost"`, `aria-label="Search"` and the same `aria-keyshortcuts`, inside a Tooltip with `side="bottom"` whose `content` holds the label and the Kbd, as the IconOnly example does.

```tsx
<Tooltip
  side="bottom"
  content={
    <Row render={<span />} align="center" gap={2}>
      Search <Kbd keys={[modifier.label, 'K']} />
    </Row>
  }
>
  <IconButton
    variant="ghost"
    icon={<Search />}
    aria-label="Search"
    aria-keyshortcuts={`${modifier.key}+K`}
    onClick={() => setOpen(true)}
  />
</Tooltip>
```

### Composition

The palette is `env-command-palette`: its search field, `env-command-palette-search`, a large ghost [TextField](text-field.md) kept solid on the frosted palette, with its input, `env-command-palette-input`, the group headings, `env-command-palette-heading`, the items, `env-command-palette-item`, the key hints in `env-command-palette-footer`, and the empty state, `env-command-palette-status` with `data-empty`: its icon, `env-command-palette-empty-icon`, title, `env-command-palette-empty-title`, and description, `env-command-palette-empty-description`. `className`, `style`, `ref` and data attributes reach the surface.

The button that opens it is Button's: `env-button`, its icon, `env-button > env-icon`, its label, and the keys in its end slot, `env-button-end`. The icon-only button is an `env-icon-button` in a tooltip.

### Customize

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0-prerelease.5**: `onOpenChange` receives why the palette closes, `CommandPaletteOpenChangeDetails`, as a dialog's does.
- **1.0.0-prerelease.5**: `defaultItems` is `suggestedItems`: `default` names an uncontrolled starting value everywhere else.
- **1.0.0-prerelease.5**: The palette is frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge, and is solid with its edge at high contrast and with reduced transparency. Its search is a large ghost TextField, opaque on the neutral fill with no outline, whose edge returns at high contrast; its headings are small and muted, its rows and keys are the popup lists', the keys side by side with the + read but not shown, and its hints are in the small label size. Its options take the text color rather than the controls', lie one under the next with no space between them, and its headings sit a little ahead of the rows.
- **1.0.0-prerelease.4**: An empty state with an icon, a title and a description, which tells an invitation before people type from no results; `emptyDescription`, `emptyIcon` and `messages.commandPalette.emptyQuery` and `emptyHint`. `defaultItems` show before people type.
- **1.0.0-prerelease.3**: The search trigger pattern is part of this page, as the button and the shortcut that open the palette; the pattern's address opens it.
- **1.0.0**: Opens from a Button with the shortcut's keys in its new `end` slot, in place of the SearchTrigger component. Rebuilt on Base UI's autocomplete: `inputValue`, `onInputValueChange`, `onAction` and `closeOnAction` for `query`, `onQueryChange`, `onSelect` and `closeOnSelect`, and `CommandPaletteActionDetails`; items take `description`, `end` and `disabled`; options are list rows; the number of results is announced; `className`, `style`, `ref` and data attributes reach the surface.
- **0.5.0**: CommandPalette, with grouped options, keyboard highlight, modifier selection and key `hints` shown as Kbd keys.
