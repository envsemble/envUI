---
title: Menubar
summary: A desktop-style bar of menus, such as File, Edit and View.
status: stable
since: 1.0.0
category: Actions
aliases:
  - menu bar
  - application menu
  - app menu
  - main menu
  - top menu
  - File Edit View
  - MenubarMenu
  - access keys
useWhen:
  - Many commands in a document-centred application, grouped as File, Edit, View and Help
  - The application's menus at the start of a title bar the window draws itself
avoidWhen:
  - text: A short list of actions behind one control.
    use: Menu
  - text: Running a command by name.
    use: CommandPalette
  - text: A row of commands that stay visible, such as an editor’s formatting.
    use: Toolbar
components:
  - Menubar
examples:
  NotesMenubar:
    role: overview
    motion: true
  InTitleBar: example
  MenubarAnatomy: anatomy
---

# Menubar

## Variants

### In a title bar

The [app frame](../patterns/app-frame.md) pattern shows the whole title bar, in an installed app's window.

```tsx figure=InTitleBar

```

## Anatomy

```tsx figure=MenubarAnatomy open

```

1. **Menubar** (`env-menubar`)
2. **Trigger** (`env-menubar-trigger`, `label`)
3. **Access key** (`env-menubar-access-key`, `accessKey`)
4. **Menu** (`env-menu`, the children, open with `open` or `defaultOpen`)

## Behaviour

### After a command

Menubar returns focus to where it was, so Copy acts on the field people were in.

<!-- specimen: AfterACommand -->

### Access keys

A menubar can underline a letter of each menu's name while <kbd>Alt</kbd> is held.

- <kbd>Alt</kbd> with the letter opens that menu.
- One menubar per window has them.

<!-- specimen: AccessKeys -->

## Rules

A menubar groups many commands, and the most frequent ones stay in view too.

### Content

Name items as in [Menu](../components/menu.md), with an ellipsis for a command that asks for more, such as Export… in File.

## Accessibility

### Keyboard

| Key                                                             | Action                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                 | Moves to the menubar, one tab stop, and out of it.           |
| <kbd>←</kbd>, <kbd>→</kbd>                                      | Moves between triggers, or between open menus.               |
| <kbd>↓</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> on a trigger | Opens its menu with the first item highlighted.              |
| <kbd>Esc</kbd>                                                  | Closes the menu and leaves focus on its trigger.             |
| <kbd>Alt</kbd>                                                  | With access keys, moves focus to the first trigger and back. |
| <kbd>Alt</kbd> with an access key                               | Opens that menu.                                             |

### envUI provides

- A `menubar` whose triggers are `menuitem`s with `aria-haspopup` and `aria-expanded`.
- `aria-keyshortcuts` on triggers with access keys, such as <kbd>Alt</kbd>+<kbd>F</kbd>.
- Focus that roves between triggers and returns to the earlier element after a command.

### You provide

- An `aria-label`, such as Application menu.
- The keys behind every shortcut, and commands that act on `previousFocus` where they edit a field.

## Compose

### Usage

Menubar.Root, named by its `aria-label`, holds a Menubar.Menu for each menu.

- A Menubar.Menu takes its trigger's `label`, such as File, and its items as children: Menu.Item, Menu.Submenu, Menu.Separator and Menu's other parts, with their shortcuts.
- `disabled` dims one menu's trigger, or on Menubar.Root every menu.
- A menu opens on its own, or with `open`, `defaultOpen` and `onOpenChange`.

```tsx source=NotesMenubar

```

#### Commands that edit a field

The menubar returns focus to where it was after a command. `onOpenChange(open, details)` receives `details.previousFocus`, the element that had focus before the menubar took it, so an Edit command such as Copy acts on that field.

```tsx
<Menubar.Menu
  label="Edit"
  onOpenChange={(open, { previousFocus }) => {
    if (open) editTarget.current = previousFocus;
  }}
>
  …
</Menubar.Menu>
```

#### Access keys

With `accessKeys` on Menubar.Root, holding <kbd>Alt</kbd> underlines each menu's `accessKey`, a letter of its label such as F for File.

- <kbd>Alt</kbd> with the letter opens that menu.
- <kbd>Alt</kbd> alone moves focus to the menubar and back.
- They are off by default; turn them on for one menubar per window.
- A menubar in an inert region, such as behind a modal dialog, takes none from outside it.

#### In a title bar

In a window that draws its own title bar, a TopBar with `titleBar`, put the menubar in its `start`, as the [app frame](../patterns/app-frame.md) pattern does in an installed app's window, and the InTitleBar example does.

```tsx
<TopBar
  titleBar
  title="Roadmap.md"
  start={
    <Menubar.Root aria-label="Application menu">
      <Menubar.Menu label="File">
        <Menu.Item shortcut="Ctrl+N">New document</Menu.Item>
      </Menubar.Menu>
    </Menubar.Root>
  }
/>
```

### Composition

The menubar is `env-menubar`, with a trigger, `env-menubar-trigger`, for each menu, whose access key is `env-menubar-access-key`. Each menu's popup is the shared popup surface, `env-menu`; `className`, `style` and `ref` on Menubar.Menu reach it, and the trigger is the menubar's own. The arrow keys between menus follow the text direction.

### Customize

Its menus are frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0**: The parts are members of the `Menubar` namespace: `Menubar` is `Menubar.Root`, `MenubarMenu` is `Menubar.Menu`, and `MenubarMenuOpenChangeDetails` is `Menubar.MenuOpenChangeDetails`. Menubar.Menu's popup is the shared popup surface and takes `ref` and `style`; the arrow keys between menus follow the text direction.
- **1.0.0-prerelease.6**: Colors under the pointer and while pressed change with `--env-motion-ease-enter`, rather than easing in slowly, so hover and press show from the first frame.
- **1.0.0-prerelease.6**: A menu opens over `--env-motion-duration-medium`, fading in and growing from 98 % with `--env-motion-ease-enter`, rather than growing from 96 % over the slow duration, so it shows from its first frames rather than late.
- **1.0.0-prerelease.5**: A Menubar's menus are frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge but a faint hairline in dark, and is solid with its edge at high contrast and with reduced transparency, with Menu's new rows.
