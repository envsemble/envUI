---
title: Menu
summary: Actions, destinations and the shared organization switcher, opened from a trigger or a right click.
status: beta
since: 0.3.0
category: Feedback & overlays
aliases:
  - dropdown menu
  - context menu
  - right-click menu
  - action menu
  - overflow menu
  - more actions
  - kebab menu
  - submenu
  - MenuItem
  - OrganizationMenu
  - organization switcher
  - account menu
useWhen:
  - A short list of actions behind one control, such as a row's or a toolbar's More actions.
  - A few destinations that share a trigger, such as the account pages behind the avatar.
  - Options that change a view, such as a sort order or whether hidden files show, as radio and checkbox items.
  - Actions for an area or its rows on right click, beside the visible controls that offer them too (ContextMenu).
  - Switching between the organizations a person belongs to, in the application shell (OrganizationSwitcher).
avoidWhen:
  - text: Choosing a value for a form field.
    use: Select
  - text: An application menubar, such as File, Edit and View.
    use: Menubar
  - text: Searching for and running one of many commands.
    use: CommandPalette
  - text: An application's navigation, such as the pages in a sidebar.
    use: NavList
  - text: Content people work in beside a trigger, such as a small form or a color picker.
    use: Popover
  - text: Switching between views of the same content.
    use: Tabs
  - text: One or two actions that fit beside the content they act on.
    use: Button
related:
  - menubar
  - command-palette
  - select
  - popover
  - nav-list
  - tree
  - kbd
  - tooltip
  - avatar
  - app-shell
components:
  - Menu
  - ContextMenu
  - OrganizationSwitcher
---

# Menu

## Overview

A menu is a short list of actions and destinations that opens from a trigger, such as a button or an avatar. Menu.Root takes the trigger and the menu's parts; keyboard and focus follow the menu button pattern, and the menu closes once an action is chosen.

Its parts build every menu:

- **Menu.Item** is an action with `onClick`, or a destination with `href`.
- **Menu.Header** holds context that is not an item, such as the signed-in account.
- **Menu.Group** and **Menu.Separator** split the items into sets, with or without a heading.
- **Menu.RadioGroup** with **Menu.RadioItem** chooses one option; **Menu.CheckboxItem** turns one on or off.
- **Menu.Submenu** is a row that opens a nested menu beside it.

The family shares the parts and their look:

- **ContextMenu** opens a menu for an area on right click, long press, the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd>, with the element it was opened on.
- **OrganizationSwitcher** shows the active organization in the application shell's context area and switches between the person's organizations.

```tsx example=AccountMenu

```

## Anatomy

1. **Trigger** (`trigger`): the control that opens the menu, such as a Button, an IconButton or an AvatarButton. It takes the menu button semantics and shows the open state; an AvatarButton shows its halo while the menu is open.
2. **Popup**: the pane that holds the rows, 0.5 rem from the trigger, named by `aria-label`.
3. **Header** (optional, Menu.Header): context at the top that is not an item, such as an avatar with the account's name and e-mail address.
4. **Item** (Menu.Item): one row with an optional leading `icon`, the label, an optional muted `description` below the label, optional `trailing` content such as a CounterBadge, and an optional `shortcut` hint as keys at the end.
5. **Check mark** (Menu.RadioItem and Menu.CheckboxItem): a slot before the label that shows a check mark while the item is checked, so labels line up whether checked or not.
6. **Group heading** (`label` of Menu.Group and Menu.RadioGroup): a small muted heading above related rows, which also names the group.
7. **Separator** (Menu.Separator): a hairline between sets of rows.
8. **Submenu row** (Menu.Submenu): an item with a chevron at its end, which points to the side its submenu opens on.

OrganizationSwitcher composes the same pane: its trigger is a secondary Button with the active organization's name and up and down arrows, and its menu has a header with a groups icon and the Organizations heading, one radio row per organization with a radio dot, the name and a muted `detail`, and the create action as a pill below them.

## Variants and sizes

Menus have one anatomy, which Select's and Combobox's popups share, and follow the app's [scale](../foundations/scale.md).

- The popup is as wide as its content, between 12 and 22 rem, on the raised popup fill with a hairline border, 0.25 rem padding and 0.75 rem corners. Rows are as tall as the scale's row height, 2.25 rem, or 1.75 rem in the compact scale, with 0.5 rem corners, 0.875 rem labels and 1 rem icons, and fill only while highlighted; descriptions are 0.75 rem and wrap, which grows their row. Shortcuts are small muted keys, separators are hairlines in the popup border color and group headings are 0.75 rem. Labels line up across rows: once a row has a check mark or an icon, the others keep its place.
- On coarse pointers, rows are at least 2.75 rem tall.
- A menu taller than the room beside its trigger scrolls. A submenu takes the theme and the scale of its menu.
- OrganizationSwitcher composes the same popup, with a header and radio rows. A long organization name truncates with an ellipsis in the trigger and wraps in the menu; the trigger is as wide as its name, up to its container's width.

## States and behaviour

- **Opening and closing**: Menu.Root opens below its trigger, lined up with the trigger's end, by default; `side` and `align` change that, and it flips to the other side where the window has no room. It fades in and, without a reduced-motion preference, grows from its trigger. It closes when an action or a radio item is chosen, with <kbd>Esc</kbd> and with a press outside it; a checkbox item keeps it open, so several options can change. `open`, `defaultOpen` and `onOpenChange` control it.
- **Focus**: opened with the keyboard, the menu highlights its first item; opened with the pointer, the menu itself takes focus, and <kbd>↓</kbd> highlights the first item. The pointer highlights the items it moves over. Once the menu closes, focus returns to the trigger.
- **Hover, focus and disabled**: a highlighted row takes the popup hover fill, `--env-color-bg-popup-hover`, a color token of its own as [colors and themes](../foundations/colors.md) describes, and the keyboard also shows the focus ring. A disabled item is dimmed with the shared disabled opacity and reports `aria-disabled`; the arrow keys still reach it, but a disabled action, choice or submenu row does nothing when chosen.
- **Choices**: a checked radio or checkbox item shows a check mark and a medium-weight label. Menu.RadioGroup reports the chosen item's `value` through `onValueChange`, and Menu.CheckboxItem its new state through `onCheckedChange`; set `closeOnClick` to change whether choosing closes the menu.
- **Destinations**: with `href` an item is a native link, rendered through the `LinkProvider`'s link component so routing stays with the application; `target` and `rel` work as on any link.
- **Shortcuts**: `shortcut` shows a hint such as Ctrl+Shift+P as keys and sets `aria-keyshortcuts`, such as Control+Shift+P; arrows are announced by their key names, such as ArrowLeft, and the plus key as Plus. A sequence, such as Ctrl+K Ctrl+S, shows its keys without the attribute. The menu does not bind the keys; the application handles them.
- **Submenus**: a submenu opens beside its row when the pointer rests on the row for 100 ms, and with <kbd>→</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd>, with its first item highlighted. <kbd>←</kbd> and <kbd>Esc</kbd> close only the submenu and return focus to its row; choosing an item closes every menu. It opens at the inline end, just clear of its menu, lines its first row up with its row and flips to the other side near the edge of the window. The row stays highlighted while its submenu is open; a disabled row does not open it. `onOpenChange` reports it opening, for example to load its items.
- **ContextMenu**: it opens at the pointer on right click and on a long press of 500 ms, and below the start of the focused element with the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd>; near the edge of the window it shifts to stay visible. A function `content` receives the element it opened on: the deepest element under the pointer, or the focused element, or its active descendant for a widget such as Tree. The menu is modal: it takes focus and keeps it until it closes, <kbd>↓</kbd> highlights its first item, and once it closes, focus returns to where it was. `disabled` keeps the browser's own context menu, and `open` with `anchorPoint` opens it at a point in the viewport, for example from another control.
- **OrganizationSwitcher**: the trigger shows the active organization's name, or `placeholder` while there is none. Organizations are radio items with the active one checked: choosing another calls `onSelect`, and choosing the active one again only closes the menu. The application switches organizations and shows the progress; `disabled` keeps the menu closed meanwhile. With `onCreate`, the create action ends the menu; without organizations, it is the only control, a secondary button, and without `onCreate` either, nothing renders.

## Content guidelines

- Start an action with a verb, such as "Rename" or "Sign out", and name a destination after the page, such as "Account settings". Use sentence case and no ending punctuation.
- Keep labels short; the menu is a pane of list rows. Use one icon per item at most, and give either most items of a set an icon or none.
- Use `description` for a short fact that helps choose, such as what a sort order does or why an item is unavailable.
- Name a group's heading with a short noun phrase, such as "Sort by" or "Show", and a submenu row after the set it opens, such as "Open recent" or "Theme"; the chevron shows that it opens more.
- Write shortcut hints as the keys read on the keyboard, joined with +, such as Ctrl+Shift+P; write arrows as ←, →, ↑ and ↓, such as Alt+←, and separate the chords of a sequence with a space.
- Name a menu after what it acts on, such as "Document actions" or "Account", and an icon-only trigger after the menu it opens, such as "More actions for Budget".
- Use an organization's `detail` for a short fact that matters before switching, such as the person's role there.

## Do and don't

### Do

- Put the most frequent actions first, and split long menus into sets with separators or groups.
- Keep submenus shallow, one level in most menus, for related choices such as recent documents or a theme.
- Offer the actions of a context menu in a visible control too, such as a row's More actions button, for people who cannot right-click.
- Use OrganizationSwitcher for the active organization, and compose the account menu from AvatarButton, Menu.Header and items; build every other menu from the parts.

### Don't

- Don't use a menu to choose a value in a form; use [Select](../components/select.md).
- Don't put frequent commands in a submenu, or nest submenus deeply.
- Don't put fields or other controls inside a menu; use [Popover](../components/popover.md) for a small form.
- Don't show a shortcut the application doesn't handle.
- Don't make a context menu the only way to reach an action.

## Accessibility

### Keyboard

| Key                                                                          | Action                                                                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                              | Moves focus to and from the trigger. In an open menu, closes it and moves focus past the trigger or back to it; a context menu keeps focus.                   |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger                          | Opens the menu with its first item highlighted.                                                                                                               |
| <kbd>↓</kbd> or <kbd>↑</kbd> on the trigger                                  | Opens the menu with its first or last item highlighted.                                                                                                       |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                                   | Highlights the next or previous item, wrapping around at the ends.                                                                                            |
| <kbd>Home</kbd>, <kbd>End</kbd>                                              | Highlights the first or last item.                                                                                                                            |
| A letter or digit                                                            | Highlights the next item whose label starts with the characters typed.                                                                                        |
| <kbd>Enter</kbd> or <kbd>Space</kbd>                                         | Chooses the highlighted item: runs an action and closes the menu, follows a destination, checks a radio item and closes the menu, or toggles a checkbox item. |
| <kbd>→</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> on a submenu row          | Opens the submenu with its first item highlighted.                                                                                                            |
| <kbd>←</kbd> or <kbd>Esc</kbd> in a submenu                                  | Closes the submenu and returns focus to its row.                                                                                                              |
| <kbd>Esc</kbd>                                                               | Closes the menu and returns focus to the trigger.                                                                                                             |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd> in a ContextMenu's region | Opens the context menu below the focused element; <kbd>↓</kbd> highlights its first item, and once it closes, focus returns to that element.                  |

### envUI provides

- The menu button pattern: `aria-haspopup` and `aria-expanded` on the trigger, a `menu` named by `aria-label` instead of by its trigger, and `menuitem`, `menuitemradio` and `menuitemcheckbox` rows with `aria-checked`.
- Groups named by their heading and separators with the separator role; submenu rows with `aria-haspopup` and a submenu named by its row's label.
- Descriptions announced as the item's description rather than its name, and shortcuts as `aria-keyshortcuts`, with the visible keys hidden.
- Decorative icons, check marks and chevrons hidden from assistive technology.
- Focus that moves into the menu as it opens, roves between its items and returns to the trigger, a submenu's row or the context menu's element as it closes.
- `aria-disabled` on disabled items.
- The context menu keys, <kbd>Menu</kbd> and <kbd>Shift</kbd>+<kbd>F10</kbd>, and the active descendant as the target of a widget that has one.
- The shared focus ring and 2.75 rem rows on coarse pointers.
- An organization's detail as a separate word of its item's name, such as "Contoso Member".

### You provide

- An `aria-label` for every Menu.Root and ContextMenu, and for an icon-only trigger.
- A visible control for every action of a context menu.
- Focus for after an action removes the menu's trigger, as a row's Delete does: move it to the neighbouring row's trigger, or to the list when it is empty, so it doesn't fall back to the page.
- The keys behind every shortcut hint, and the routing behind `href`, through `LinkProvider`.
- An `aria-label` on trailing content that a number alone doesn't explain, such as "3 unresolved" on a CounterBadge, since trailing content is part of the item's name.
- The switch between organizations, with its progress, and translated `heading`, `createLabel`, `placeholder` and `aria-label` where the interface is not in English.

## Examples

### Actions with icons and shortcuts

An icon-only trigger opens actions with icons, shortcut hints, a count and a disabled item whose description says why. Choosing an action runs `onClick` and closes the menu.

```tsx example=IconsAndShortcuts

```

### Destinations

Items with `href` are links through the `LinkProvider`. `target` and `rel` open one in a new tab, and its description says so.

```tsx example=Destinations

```

### Groups and separators

Menu.Group puts related items under a small heading; Menu.Separator splits sets without one. Each set keeps the large outer corners.

```tsx example=GroupsAndSeparators

```

### Radio and checkbox items

A radio item checks one choice and closes the menu; checkbox items toggle and keep it open, so several options can change.

```tsx example=Choices

```

### Submenus

A submenu opens beside its row on hover, or with <kbd>→</kbd>, and choosing an item in it closes every menu.

```tsx example=Submenus

```

### A file menu

A desktop file menu with shortcuts, a submenu and a group of choices. Labels line up whether a row has an icon, a check mark or neither.

```tsx example=FileMenu

```

### Context menu

ContextMenu offers actions for the row under the pointer, or for the focused row with <kbd>Shift</kbd>+<kbd>F10</kbd>, and New document on the empty space. Each row's More actions button offers the same actions.

```tsx example=ContextMenuForRows

```

### Organization switcher

The shared switcher fits the context area of the application shell's sidebar. The active organization is checked, each one shows the person's role, and the create action ends the menu.

```tsx example=SwitchOrganization

```

### Before the first organization

Without organizations, the switcher is only the create action, which here creates the first one.

```tsx example=FirstOrganization

```

## Changelog

- **1.0.0**: The parts are members of the `Menu` namespace: `Menu` is `Menu.Root`, and `MenuItem`, `MenuHeader`, `MenuSeparator`, `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem` and `MenuSubmenu` are `Menu.Item`, `Menu.Header`, `Menu.Separator`, `Menu.Group`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem` and `Menu.Submenu`. Menus have one anatomy at the scale's row height: `density` and the `MenuDensity` type are gone. `OrganizationMenu` is `OrganizationSwitcher`, with `OrganizationSwitcherOrganization` and the `env-organization-switcher-*` classes. ContextMenu keeps its name.
- **0.5.0**: ContextMenu; `description`, `shortcut` and `trailing` on items; MenuGroup, MenuRadioGroup, MenuRadioItem and MenuCheckboxItem; `density="compact"` on Menu and ContextMenu; MenuSubmenu.
- **0.4.0**: OrganizationMenu's `detail` for each organization, and its trigger is a secondary Button with up and down arrows. Menu items keep 1.5 rem inline padding, and hover and press shift 6 and 10 points of lightness.
- **0.3.0**: Menu, MenuHeader, MenuItem for actions and destinations, MenuSeparator, and OrganizationMenu; menus grow from their trigger.
