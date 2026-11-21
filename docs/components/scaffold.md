---
title: Scaffold
summary: 'The layout of an app screen: top bar, navigation and page.'
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - AppShell
  - app shell
  - app frame
  - application frame
  - app layout
  - shell
  - frame
  - layout
  - skip links
  - WindowFrame
  - collapsible sidebar
  - collapse navigation
  - icon strip
useWhen:
  - An application's screen, with a top bar, its navigation and the page
  - A window without navigation, such as a start page, under its title bar
avoidWhen:
  - text: A readable column for a page's content, with its gutters.
    use: Page
  - text: Two panes side by side inside the body, such as a document and its details.
    use: Panes
components:
  - Scaffold
examples:
  NavigationForms:
    role: overview
    stage: shaded
    motion: true
    device: phone
  ChooseForms: example
  NarrowNavigation: example
  TitleBarAcross: example
  InspectorAndStatus: example
  NavigationApart: example
  ScaffoldAnatomy: anatomy
  FormsByWidth: example
---

# Scaffold

## Variants

### The navigation for each width

```tsx figure=ChooseForms stage=shaded widths="44 30" sweep classes

```

### Narrowing the navigation

```tsx figure=NarrowNavigation stage=shaded motion device=window

```

### A title bar across

```tsx figure=TitleBarAcross stage=shaded widths="40"

```

### An inspector and a status bar

```tsx figure=InspectorAndStatus stage=shaded widths="44"

```

### Backgrounds

```tsx figure=NavigationApart stage=shaded widths="40"

```

## Anatomy

```tsx figure=ScaffoldAnatomy stage=shaded

```

1. **Root** (`env-scaffold`)
2. **Top bar** (`env-scaffold-top-bar`, `topBar`)
3. **Navigation** (`env-scaffold-rail`, `navigation`)
4. **Body** (`env-scaffold-body`, `children`)

## Behaviour

### Adapting to width

```tsx figure=FormsByWidth stage=shaded widths="24 44 54" sweep classes

```
