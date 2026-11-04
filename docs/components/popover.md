---
title: Popover
summary: A floating panel beside its trigger for details or a small form; Esc or a press outside closes it.
status: stable
since: 1.0.0
category: Overlays
aliases:
  - popup
  - pop-up
  - flyout
  - overlay
  - dropdown panel
  - floating panel
  - toggletip
  - info popup
useWhen:
  - Details people open on demand, such as a document's history
  - A small form beside the control it changes, such as a rename
  - An explanation behind a help mark beside a value
avoidWhen:
  - text: A short name or hint for a control, shown on hover and focus.
    use: Tooltip
  - text: A preview of a link's destination, shown on hover.
    use: HoverCard
  - text: A list of actions or destinations.
    use: Menu
  - text: Choosing a value for a form field from a list.
    use: Select
  - text: A task that needs people's full attention or more room, or a consequence to confirm.
    use: Dialog
components:
  - Popover
examples:
  DocumentDetails:
    role: overview
    open: true
  FieldHelp: example
  PopoverAnatomy: anatomy
  RenameInPlace: example
---

# Popover

## Variants

### Widths

A popover is as wide as its content, up to its width.

| Width  | Use for                                  |
| ------ | ---------------------------------------- |
| Medium | Details and a field or two. The default. |
| Large  | A longer form.                           |

### Sides

A popover opens below its trigger, above it or beside it, lined up with the trigger's start, center or end, and flips where there is no room.

```tsx figure=FieldHelp open wide

```

## Anatomy

```tsx figure=PopoverAnatomy open

```

1. **Popover** (`env-popover`)
2. **Title** (`env-popover-title`, `title`)
3. **Content** (`env-popover > env-text`, `children`)
4. **Trigger** (`env-icon-button`, `trigger`)

## Behaviour

### Focus

Popover takes focus as it opens, and also closes when focus leaves it.

- It isn't modal, so the page stays usable.

### A small form

An action inside the popover closes it once its work is done, such as Rename.

```tsx figure=RenameInPlace motion

```

## Rules

A popover is small, named, and never the only place for what matters.

### Fields

One to three fields at most, with the action last.

### Names

Give every popover a title, or a name for assistive technology where a title would repeat its trigger.

- Name an icon-only trigger after what the popover holds, such as About billing periods.

## Accessibility

### Keyboard

| Key                                                 | Action                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger | Opens the popover and moves focus in; on an open popover's trigger, closes it. |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>     | Moves through the popover; past its last element it closes and moves on.       |
| <kbd>Esc</kbd>                                      | Closes the popover and returns focus to the trigger.                           |

### envUI provides

- `aria-haspopup="dialog"` and `aria-expanded` on the trigger, and a `dialog` named by its title.
- Focus moved in on open, and back to the trigger when <kbd>Esc</kbd> or `close` closes it.
- The theme of its trigger in the portal.

### You provide

- A `title` or an `aria-label`, and a name for an icon-only trigger.
- The actions inside, and a call to `close` when one is done.

## Compose

### Usage

A Popover opens from its `trigger`, such as a Button or an IconButton, which must take a ref and props: it receives the press handler, `aria-haspopup` and `aria-expanded`. `title` is a heading at the top that names it; without one, name it with `aria-label`. `children` is its content.

```tsx source=DocumentDetails

```

#### A small form

A function child receives `close`, for an action inside that closes the popover once it is done, such as a form's submit.

```tsx
<Popover aria-label="Rename document" width="lg" trigger={<Button>Rename</Button>}>
  {(close) => (
    <form onSubmit={(event) => rename(event, close)}>
      <TextField label="Name" name="name" required />
      <Button variant="secondary" onClick={close}>
        Cancel
      </Button>
      <Button type="submit">Rename</Button>
    </form>
  )}
</Popover>
```

#### Controlled

Leave it uncontrolled, with `defaultOpen` to start open, or control it with `open` and `onOpenChange`, which receives the requested state and why: the trigger, <kbd>Esc</kbd>, a press outside, focus leaving it, or `close` as `close-press`.

```tsx
<Popover
  title="Assignees"
  open={open}
  onOpenChange={(next) => {
    setOpen(next);
    if (next) setDraft(applied); // Each time it opens, start from the filters in use.
  }}
  trigger={<Button startIcon={<IconFilterList />}>Assignees</Button>}
>
  {people.map((person) => (
    <Checkbox
      key={person}
      label={person}
      checked={draft.includes(person)}
      onCheckedChange={(checked) => toggle(person, checked)}
    />
  ))}
  <Button
    onClick={() => {
      setApplied(draft);
      setOpen(false);
    }}
  >
    Apply
  </Button>
</Popover>
```

#### Width, side and alignment

`width` is `md`, 20 rem and the default, or `lg`, 28 rem: the widest the popover grows, as wide as its content from 12 rem up, and narrower to fit the window. `side` is `bottom`, the default, `top`, `left`, `right`, or `inline-start` and `inline-end`, which follow the text direction; it flips to the other side without room. `align` is `start`, `center`, the default, or `end`.

```tsx
<Popover
  title="Billing periods"
  side="right"
  align="start"
  trigger={<IconButton variant="text" icon={<IconHelp />} aria-label="About billing periods" />}
>
  <Text>Members added later are billed from the next period.</Text>
</Popover>
```

### Customize

Every popup, a popover, a menu, a Select's or a Combobox's list, a picker, a hover card, rich text suggestions and the command palette, is frosted. Three properties, set on a `.env-theme` boundary, change them all:

- `--env-popup-opacity`, 88 % in light and 90 % in dark, how much of the popup's color covers what is behind it; `100%` makes popups solid. The color is `--env-color-bg-popup`.
- `--env-popup-blur`, 1.375 rem, the blur of what shows through, with a little more saturation.
- `--env-popup-shadow`, a soft shadow in the text's color in light and a deeper shade of the page in dark: with the avatars', envUI's only shadow.

In dark a faint hairline of the text color keeps a frosted popup's edge, where its shadow barely shows. At high contrast, with reduced transparency and under forced colors popups are solid, with their elevation edge and no blur or shadow; at high contrast the edge is a modal's, `--env-elevation-3-border`, the strongest. Tooltips are frosted too, at `--env-tooltip-opacity` with a smaller `--env-tooltip-shadow`, as [Tooltip](tooltip.md#customize) describes.

`className`, `style`, `ref` and data attributes reach the surface, `env-popover`, which has `data-width="lg"` when large and renders on PopupSurface in the trigger's text direction and theme. Its title is `env-popover-title`.

## Changelog

- **1.0.0-prerelease.5**: Popovers are frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge but a faint hairline in dark, and is solid with its edge at high contrast and with reduced transparency: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`. Its inset is a panel's, as wide as a popup row's corner: 14 px, 11.2 px at the compact scale.
- **1.0.0**: `width` is `md` or `lg`, the widest the popover grows as it sizes to its content; `side` takes `inline-start` and `inline-end`; `className`, `style`, `ref` and data attributes reach the surface, which renders on PopupSurface in the trigger's text direction.
- **1.0.0**: Popovers take the level-2 elevation edge, with no shadow.
