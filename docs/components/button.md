---
title: Button
summary: Starts an action, or goes to a destination as a link.
status: stable
since: 1.0.0
category: Actions
aliases:
  - action
  - call to action
  - CTA
  - icon button
  - close button
  - dismiss button
  - remove button
  - confirm button
  - copy button
  - button group
  - split button
  - toolbar button
useWhen:
  - Starting an action, such as saving or sending
  - A familiar action as an icon alone, in a dense place (IconButton)
  - An action that takes effect at once and can't be undone (ConfirmButton)
avoidWhen:
  - text: A destination inside running text.
    use: Link
  - text: Choosing one of a few views or filters that stays selected.
    use: SegmentedControl
  - text: A consequence that needs a choice or typed confirmation before it happens.
    use: Dialog
components:
  - Button
  - IconButton
  - ConfirmButton
  - CopyButton
  - ButtonGroup
examples:
  CreateProject: overview
  Icons: example
  PictureBeforeLabel: example
  ConnectedButtons: example
  OnePrimaryAction:
    role: do
    caption: One primary button per group, at the end of its actions.
  ButtonAnatomy: anatomy
  Variants: variants
  ButtonLinks: example
  PendingAction: example
  ConfirmInPlace: example
  CopyValue: example
  NarrowActions: example
  FillSidebar: example
---

# Button

## Variants

```tsx figure=Variants

```

1. **Primary**
2. **Secondary**
3. **Outline**
4. **Ghost**
5. **Text**
6. **Primary, accent**

### Links

```tsx figure=ButtonLinks

```

### Icons

```tsx figure=Icons

```

### Pictures

```tsx figure=PictureBeforeLabel

```

### Groups

```tsx figure=ConnectedButtons

```

### Sizes

<!-- specimen: Sizes -->

## Anatomy

```tsx figure=ButtonAnatomy

```

1. **Container** (`env-button`)
2. **Start** (`env-button-start`, `start`)
3. **Label** (`env-button::text`)
4. **End** (`env-button-end`, `end`)

## Behaviour

### States

<!-- specimen: InteractionStates -->

### Pending work

```tsx figure=PendingAction motion

```

### Confirm in place

```tsx figure=ConfirmInPlace motion

```

### Copy to the clipboard

```tsx figure=CopyValue motion

```

### Adapting to width

```tsx figure=NarrowActions widths="30 16" sweep

```

```tsx figure=FillSidebar

```

## Rules

```tsx figure=OnePrimaryAction

```
