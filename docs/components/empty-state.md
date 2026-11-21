---
title: EmptyState
summary: Shown when a region has no content, with an action to add some.
status: beta
since: 2.0.0
category: Feedback
aliases:
  - empty
  - empty state
  - blank state
  - zero state
  - no results
  - no data
  - nothing here
  - placeholder
useWhen:
  - A list, table or panel with nothing in it yet, such as a new workspace
  - A search or filter that finds nothing
avoidWhen:
  - text: A region whose content is still loading.
    use: Spinner
  - text: A failure people should know about, such as a list that didn't load.
    use: Alert
examples:
  NoProjects: overview
  EmptyStateAnatomy: anatomy
  NoMatches: example
  WithIllustration: example
components:
  - EmptyState
---

# EmptyState

## Variants

### An illustration

```tsx figure=WithIllustration

```

## Anatomy

```tsx figure=EmptyStateAnatomy

```

1. **Icon** (`env-empty-state-icon`, `icon`)
2. **Title** (`env-empty-state-title`, `title`)
3. **Description** (`env-empty-state-description`, `description`)
4. **Actions** (`env-empty-state-actions`, `actions`)

## Behaviour

### Adapting to width

```tsx figure=NoMatches widths="40 18" sweep

```
