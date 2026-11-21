---
title: Popover
summary: A floating panel next to the control that opens it, for details or a small form.
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
  - text: A task that needs full attention or more room.
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

### Sides

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

### A small form

```tsx figure=RenameInPlace motion

```
