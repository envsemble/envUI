---
title: EmptyState
summary: What a region shows when it has nothing to show, with a way to fill it.
status: beta
since: 1.1.0
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
  - A list, table or panel with nothing in it yet, such as a new workspace's projects
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
components:
  - EmptyState
---

# EmptyState

## Anatomy

```tsx figure=EmptyStateAnatomy

```

1. **Icon** (`env-empty-state-icon`, `icon`)
2. **Title** (`env-empty-state-title`, `title`)
3. **Description** (`env-empty-state-description`, `description`)
4. **Actions** (`env-empty-state-actions`, `actions`)

## Behaviour

### Adapting to width

It fills its region and centres in it; in a narrow region its icon and title are smaller and it sits closer together.

```tsx figure=NoMatches widths="40 18" sweep

```

## Rules

Say what is missing, then how to fill it.

### Words

- The title names what isn't there, such as No projects yet.
- The description says why, or what will show here.
- An action fills the region where people can, such as Create project.

## Accessibility

### envUI provides

- An icon hidden from assistive technology.
- Text in reading order: title, description, actions.

### You provide

- Actions named after what they do.
- An announcement where the region empties as people act, such as a live region around search results.

## Compose

### Usage

EmptyState fills the region it is in and centres its content there: put it where the list or table would be. `title` is required; `icon`, `description` and `actions` are optional, and each is a slot that takes what you give it.

```tsx source=NoProjects

```
