---
title: LineArt
summary: A geometric drawing in faint hairlines, for a banner, an empty state or a header.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - line drawing
  - geometric drawing
  - geometric pattern
  - shapes
  - decoration
  - ornament
  - illustration
  - banner art
  - background pattern
  - hero art
useWhen:
  - The end of a banner or a page's header, beside its title
  - Above an empty state's message, where a screen has nothing else to show
  - The background of a header, clear of its text
avoidWhen:
  - text: A symbol that says what something is or does.
    see: icons
  - text: A region set apart by its fill and corners.
    use: Surface
components:
  - LineArt
examples:
  ProjectBanner: overview
  LineArtAnatomy: anatomy
  WhereItSits: variants
  RightToLeft: example
  CroppedFromItsStart: example
---

# LineArt

## Variants

### Sixteen drawings

<!-- specimen: Drawings -->

## Anatomy

```tsx figure=LineArtAnatomy

```

1. **Drawing** (`env-line-art`)

## Behaviour

### Cropping and anchoring

```tsx figure=WhereItSits

```

1. **At the end**
2. **At the start**
3. **In the centre**

### Right to left

```tsx figure=RightToLeft

```

### Themes and high contrast

<!-- specimen: Themes -->

### Adapting to width

```tsx figure=CroppedFromItsStart widths="44 24" sweep

```
