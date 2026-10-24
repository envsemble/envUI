---
title: Popover
summary: A floating panel beside its trigger for details or a small form; Esc or a press outside closes it.
status: stable
since: 0.5.0
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
---

# Popover

## Overview

Popover takes focus as it opens, and also closes when focus leaves it; it isn't modal, so the page stays usable.

```tsx example=DocumentDetails open

```

### A small form

An action inside the popover closes it once its work is done, such as Rename.

```tsx example=RenameInPlace open

```

## Variants

### Widths

A popover is as wide as its content, up to its width.

| Width  | Use for                                  |
| ------ | ---------------------------------------- |
| Medium | Details and a field or two. The default. |
| Large  | A longer form.                           |

### Sides

A popover opens below its trigger, above it or beside it, lined up with the trigger's start, center or end, and flips where there is no room.

```tsx example=FieldHelp open

```

## When to use

### Fields

One to three fields at most, with the action last.

### Names

Give every popover a title, or a name for assistive technology where a title would repeat its trigger. Name an icon-only trigger after what the popover holds, such as About billing periods.

### Out of sight

Keep what matters reachable elsewhere: a popover is out of sight until it opens.

## Anatomy

```tsx anatomy=PopoverAnatomy open

```

1. **Popover** (`env-popover`)
2. **Title** (`env-popover-title`, `title`)
3. **Content** (`env-popover > env-text`, `children`)
4. **Trigger** (`env-icon-button`, `trigger`)

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

## In code

### Usage

A Popover opens from its `trigger`, such as a Button or an IconButton, which must take a ref and props: it receives the press handler, `aria-haspopup` and `aria-expanded`. `title` is a heading at the top that names it; without one, name it with `aria-label`. `children` is its content.

```tsx source=DocumentDetails

```

#### A small form

A function child receives `close`, for an action inside that closes the popover once it is done, such as a form's submit.

```tsx source=RenameInPlace

```

#### Controlled

Leave it uncontrolled, with `defaultOpen` to start open, or control it with `open` and `onOpenChange`, which receives the requested state and why: the trigger, <kbd>Esc</kbd>, a press outside, focus leaving it, or `close` as `close-press`.

```tsx
import { useState } from 'react';
import { Button, Checkbox, Popover, Column, Row, Text } from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';

const people = ['Alex Morgan', 'Sam Lee', 'Priya Shah'];

export default function FilterTasks() {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<string[]>([]);
  const [draft, setDraft] = useState<string[]>([]);
  const toggle = (person: string, checked: boolean) =>
    setDraft((current) =>
      checked ? [...current, person] : current.filter((name) => name !== person),
    );
  return (
    <Column gap={3} align="start">
      <Popover
        title="Assignees"
        align="start"
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          // Each time it opens, the popover starts from the filters in use.
          if (next) setDraft(applied);
        }}
        trigger={
          <Button variant="secondary" startIcon={<FilterList />}>
            {applied.length ? `Assignees (${applied.length})` : 'Assignees'}
          </Button>
        }
      >
        <Column gap={3}>
          {people.map((person) => (
            <Checkbox
              key={person}
              label={person}
              checked={draft.includes(person)}
              onCheckedChange={(checked) => toggle(person, checked)}
            />
          ))}
        </Column>
        <Row wrap align="center" gap={4} justify="end">
          <Button variant="secondary" onClick={() => setDraft([])}>
            Clear
          </Button>
          <Button
            onClick={() => {
              setApplied(draft);
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </Row>
      </Popover>
      <Text variant="body-sm">
        {applied.length ? `Showing tasks for ${applied.join(', ')}.` : 'Showing every task.'}
      </Text>
    </Column>
  );
}
```

#### Width, side and alignment

`width` is `md`, 20 rem and the default, or `lg`, 28 rem: the widest the popover grows, as wide as its content from 12 rem up, and narrower to fit the window. `side` is `bottom`, the default, `top`, `left`, `right`, or `inline-start` and `inline-end`, which follow the text direction; it flips to the other side without room. `align` is `start`, `center`, the default, or `end`.

```tsx source=FieldHelp

```

### Customize

`className`, `style`, `ref` and data attributes reach the surface, `env-popover`, which has `data-width="lg"` when large and renders on PopupSurface in the trigger's text direction and theme. Its title is `env-popover-title`.

## Changelog

- **1.0.0**: `width` is `md` or `lg`, the widest the popover grows as it sizes to its content; `side` takes `inline-start` and `inline-end`; `className`, `style`, `ref` and data attributes reach the surface, which renders on PopupSurface in the trigger's text direction.
- **1.0.0**: Popovers take the level-2 elevation edge, with no shadow.
- **0.5.0**: Popover, with a title, two widths and a close function for its content.
