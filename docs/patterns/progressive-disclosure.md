---
title: Progressive disclosure
summary: Show what most people need first, and keep the rest one step away, in the place and at the depth that fits it.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - progressive disclosure
  - advanced options
  - show more
  - more actions
  - overflow menu
  - details panel
  - accordion
  - help text
useWhen:
  - A page has options, details or actions that most people don't need most of the time.
  - A term or a value needs an explanation that would clutter the page if always shown.
avoidWhen:
  - text: Switching between views of the same content.
    use: Tabs
  - text: Moving between destinations of the application.
    use: NavList
  - text: Information people need to complete a task, such as a required field or an error.
    see: forms
composes:
  - Disclosure
  - Tabs
  - Popover
  - HoverCard
  - Tooltip
  - Drawer
  - Dialog
  - Menu
  - Button
  - IconButton
  - Link
  - List
  - Badge
  - DescriptionList
  - Select
  - Checkbox
  - TextField
  - Stack
  - Text
related:
  - forms
  - feedback
  - disclosure
  - popover
  - drawer
  - menu
---

# Progressive disclosure

## Overview

Use this pattern to keep a page about its main task while the rest stays within reach: advanced options behind a disclosure, the long tail of a list behind "Show all", the details of a row in a drawer, rare actions in a menu, and the meaning of a term in a popover. Choose the component by how deep the content goes and whether people must act on it, and never hide what a task needs.

```tsx example=AdvancedOptions

```

## Anatomy

Choose the component by where the content shows and whether people act in it:

| Depth   | Component                                                         | Holds                                                    | People act in it     |
| ------- | ----------------------------------------------------------------- | -------------------------------------------------------- | -------------------- |
| Inline  | [Disclosure](../components/disclosure.md)                         | Optional settings or guidance below a summary            | Yes                  |
| Inline  | A Button that shows more items of a [List](../components/list.md) | The rest of a long list                                  | Yes                  |
| Inline  | [Tabs](../components/tabs.md)                                     | Views of one thing, one at a time                        | Yes                  |
| Overlay | [Tooltip](../components/tooltip.md)                               | The name of an icon-only control, a few words            | No                   |
| Overlay | [HoverCard](../components/hover-card.md)                          | A preview of what a link leads to                        | No: reading only     |
| Overlay | [Popover](../components/popover.md)                               | An explanation, details or a small form, opened on press | Yes                  |
| Overlay | [Menu](../components/menu.md)                                     | Actions and destinations used less often                 | Yes: choose one      |
| Overlay | [Drawer](../components/drawer.md)                                 | The details of an item, beside the list it came from     | Yes                  |
| Overlay | [Dialog](../components/dialog.md)                                 | A focused task that blocks the page until it ends        | Yes, before going on |
| Page    | A page of its own, through a [Link](../components/link.md)        | Everything about one thing                               | Yes                  |

1. **The visible layer:** the main task, the first items and the actions people take most, such as two Buttons.
2. **The control that discloses:** a summary that says what it holds ("Advanced options"), a button that says how much more there is ("Show all 12"), an [IconButton](../components/button.md) named after its menu ("More actions"), or a help button named after its subject ("About billable hours").
3. **The disclosed layer:** the component of the table that fits its depth.

## States and behaviour

- **Disclosure** opens and closes in place, on the native `details` element. When a field inside it has an error, open it so the field and its message show. Several Disclosures in a stack stand in for an accordion, which envUI doesn't have yet; a shared `name` lets one open at a time, and works only on Disclosures that aren't controlled, since the browser closes the others itself. Their summaries aren't headings, so they don't appear in the page's outline: put a heading above the stack when it needs one.
- **Show more** keeps the button after the list, where it was. Its label names what a press does: "Show all 12", then "Show fewer" once the whole list shows; `aria-expanded` says the same, and a second press shows the first items again. New items appear above it, in reading order.
- **Drawer** opens over the page, modal by default, and closes with <kbd>Esc</kbd>, its close button or a press outside. The list stays in place under it, so people continue from the row they opened.
- **Menu** holds what doesn't fit or isn't used often. Keep the actions people take most outside it, and put a destructive item last, after a separator.
- **Popover** opens on press, not on hover, and closes with <kbd>Esc</kbd>, a press outside or when focus leaves it. Use it for an explanation that may hold a link.
- **Tooltip** shows on hover and keyboard focus and only names an icon-only control. **HoverCard** previews what a link leads to on hover and focus; on touch screens it never opens, so what it shows must also be reachable at the link's destination.
- **Narrow windows.** A Drawer takes the whole width; actions that don't fit move into the menu rather than wrapping into a second row of buttons.

## Content guidelines

- Label a Disclosure with what it holds, "Advanced options", "How visibility works", following [Labels, descriptions and placeholders](../foundations/content.md#labels-descriptions-and-placeholders).
- Say how much more there is: "Show all 12", not "Show more".
- Name an overflow menu's trigger "More actions", or "More actions for Launch brief" in a row, and its items with a verb, as [Buttons and actions](../foundations/content.md#buttons-and-actions) describes.
- Keep a Tooltip to the control's name, the same words as its accessible name.
- Write a help popover as a short definition, then a link for more.

## Do and don't

### Do

- Show first what most people need, and disclose the rest one step away.
- Keep the actions people take most visible, and the rest in one menu.
- Open a Disclosure that holds a field with an error.
- Make what a HoverCard shows reachable without hover.

### Don't

- Don't hide required fields, instructions or errors behind a disclosure.
- Don't nest disclosures, or put a menu in a popover in a drawer.
- Don't put links, buttons or fields in a Tooltip or a HoverCard.
- Don't use a Tooltip for an explanation; use a Popover.
- Don't use Tabs to hide content people need to compare side by side.

## Accessibility

### Focus and keyboard

A Disclosure's summary is a button in the tab order; Enter or Space opens it, and focus stays on it. The Show all button keeps focus as the list grows. A Drawer moves focus inside as it opens, traps it while modal, and returns it to the row's button as it closes. A Menu moves focus into itself as it opens, moves between items with the arrow keys and returns focus to its trigger as it closes. A Popover moves focus into itself and returns it as it closes. A Tooltip and a HoverCard never take focus: they open while their trigger has focus and close with <kbd>Esc</kbd>.

### envUI provides

- Disclosure on native `details` and `summary`, which reports whether it is expanded and hides its closed content from assistive technology.
- Drawer and Dialog focus management: focus moved in, trapped while modal and returned on closing, and their titles as their names.
- The menu button pattern: `aria-haspopup` and `aria-expanded` on the trigger, focus that roves between items and returns to the trigger.
- Popover's `aria-expanded` trigger and its title as its name; Tooltips and HoverCards that open on keyboard focus as on hover.

### You provide

- A name for every icon-only trigger, and a Tooltip with the same words where envUI doesn't show one.
- `aria-expanded` and `aria-controls` on a Show all button, which shows more of a list it controls.
- Opening a Disclosure that holds an invalid field, and moving focus to the field.
- A heading above a stack of Disclosures that needs a place in the outline.
- The details of a HoverCard somewhere people reach without hover.

## Examples

### Show all

The list shows its five most recent items; "Show all 12" shows the rest, and pressing it again hides them. The button keeps its place and focus; its label becomes "Show fewer", and `aria-expanded` says which state it is in.

```tsx example=ShowMore

```

### Details in a drawer

Each row opens its project's details in a Drawer over the list, so people keep their place; closing it returns focus to the row.

```tsx example=DetailsInDrawer

```

### Overflow actions

Share and Edit stay visible; the actions used less often wait in a "More actions" menu.

```tsx example=OverflowActions

```

### Explain a term

A help button opens a Popover with a short definition and a link. The icon-only download button has a Tooltip that repeats its name.

```tsx example=ExplainATerm

```
