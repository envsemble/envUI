---
title: Checkbox
summary: A native checkbox with its label, for a choice people turn on or off on its own, with a mixed state for a group's parent.
status: stable
since: 0.1.0
category: Forms & selection
aliases:
  - check box
  - tick box
  - checkmark
  - check mark
  - checkbox group
  - select all
  - indeterminate checkbox
  - tri-state checkbox
  - opt-in
useWhen:
  - Any number of options, each chosen on its own, such as which e-mails to receive
  - Agreeing to or including one option, applied when a form is sent, such as the terms
  - A parent that selects or clears a group, and shows when only some are chosen
avoidWhen:
  - text: A setting that takes effect at once, such as turning notifications on.
    use: Switch
  - text: Exactly one choice from a few options.
    use: Radio
  - text: One choice from a long list of options.
    use: Select
  - text: Several choices from a long list, found by typing.
    use: Combobox
  - text: Selecting rows of a table, which its selection column does.
    use: Table
components:
  - Checkbox
---

# Checkbox

## Overview

```tsx example=IncludeArchived

```

### States

Pressing the box or its label toggles it. A mixed box shows a dash.

<!-- specimen: States -->

### Select all

A parent is checked when every child is, mixed when some are, and checks or clears them all.

```tsx example=SelectAll

```

## When to use

```tsx do=NamedGroup caption="Name a group with a legend, so each choice reads in context."

```

```tsx dont=UnnamedGroup caption="Checkboxes with no name for the group: mentions of what?"

```

### Labels

Write the label as the choice it turns on, in sentence case, so checking it means yes.

## Anatomy

```tsx anatomy=CheckboxAnatomy

```

1. **Checkbox** (`env-checkbox`)
2. **Box** (`env-checkbox-box`)
3. **Check** (`env-checkbox-indicator`)
4. **Label** (`env-checkbox-label`, `label`)

## Adapting to width

The label wraps onto more lines, and the box stays centred beside it.

```tsx example=LongLabel widths="14 30"

```

## Accessibility

### Keyboard

| Key                                             | Action                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous checkbox.        |
| <kbd>Space</kbd>                                | Checks or unchecks it, and checks a mixed one. |

### envUI provides

- A native checkbox inside its `<label>`, named by the label's text.
- The mixed state as `indeterminate` and `aria-checked="mixed"`.
- A focus outline, and a 2.75 rem target on touch screens.

### You provide

- A `label`, or `aria-label` on a checkbox without one.
- A name for a group, such as a fieldset's legend.
- An error or description, linked with `aria-describedby`.

## In code

### Usage

A Checkbox is a native checkbox inside its `<label>`, named by `label`. Leave it uncontrolled, with `defaultChecked`, or control it with `checked` and `onCheckedChange`, which receives the new state as a boolean.

```tsx source=IncludeArchived

```

#### Mixed and select all

`checked="mixed"` shows a dash, for a parent whose children are partly chosen; pressing a mixed checkbox reports `true`. The checkbox doesn't derive it: set the parent's `checked` from its children, `true` when all are checked, `'mixed'` when some are and `false` when none are.

```tsx source=SelectAll

```

#### In a form

A checked box submits its `name` with its `value`; an unchecked one submits nothing. A reset restores `defaultChecked`. Name a group with a native `fieldset` and its `legend`.

```tsx
import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Column, Row, Text } from '@envsemble/envui';

export default function NotificationForm() {
  const [sent, setSent] = useState<string>();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // A checked box submits its name with its value; an unchecked one submits nothing.
    const chosen = new FormData(event.currentTarget).getAll('notify');
    setSent(chosen.length ? `E-mails for ${chosen.join(', ')}` : 'No e-mails');
  };
  return (
    <form onSubmit={submit} onReset={() => setSent(undefined)}>
      <Column gap={4}>
        {/* envUI has no checkbox group yet: a fieldset names the choices, read with each one. */}
        <fieldset style={{ minInlineSize: 0, margin: 0, padding: 0, border: 0 }}>
          <legend style={{ padding: 0, marginBlockEnd: '0.75rem' }}>
            <Text render={<span />} variant="title">
              Send me an e-mail about
            </Text>
          </legend>
          <Column gap={3}>
            <Checkbox name="notify" value="mentions" label="Mentions" defaultChecked />
            <Checkbox name="notify" value="comments" label="Comments on my plans" defaultChecked />
            <Checkbox name="notify" value="digest" label="A weekly digest" />
          </Column>
        </fieldset>
        <Row wrap align="center" gap={4}>
          <Button type="submit">Save preferences</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Row>
        <Text variant="caption" emphasis="muted" role="status">
          {sent && `Saved: ${sent}.`}
        </Text>
      </Column>
    </form>
  );
}
```

### Composition

`className` and `style` reach the root, `env-checkbox`, the label around the box and the text; `ref` and the other native props, such as `name` and `required`, reach the input, `env-checkbox-input`, so a form library can register and focus it. The box is `env-checkbox-box`, the check `env-checkbox-indicator` and the text `env-checkbox-label`.

### Customize

`--env-checkbox-outline`, `--env-checkbox-selected` and `--env-checkbox-icon` set the colors of one Checkbox, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0**: `className` and `style` style the root, `env-checkbox`, rather than the input, which keeps `ref` and the other native props. The classes follow the component: `env-choice-control` is `env-checkbox`, `env-checkbox-control` `env-checkbox-input` and `env-checkbox-mark` `env-checkbox-indicator`.
- **0.4.0**: Checkboxes shrink slightly whether the box or its label is pressed.
- **0.1.0**: Checkbox.
