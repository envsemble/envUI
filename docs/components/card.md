---
title: Card
summary: A rounded surface that groups content about one subject, as a content card, a card with an action strip, or one link or button.
status: beta
since: 0.1.0
category: Layout & surfaces
aliases:
  - tile
  - panel
  - content card
  - clickable card
  - link card
  - action card
  - feature card
  - promo card
  - ClickableCard
  - ActionCard
useWhen:
  - Content about one subject stands apart from the page, such as a project's summary.
  - A summary needs its own actions along the bottom, such as Share and Open (`actions`).
  - The whole surface leads to one destination or starts one action, such as a project in a grid (`href`, `as="button"`).
  - A feature is introduced with an icon, a sentence and one action (FeatureCard).
avoidWhen:
  - text: A fill, padding and corners without card semantics or spacing, such as a toolbar's background.
    use: Surface
  - text: Rows of items with a title, a detail and an action, connected in one list.
    use: List
  - text: Data to compare across rows and columns.
    use: Table
  - text: A message about the page or a section.
    use: Alert
  - text: A region with no content yet.
    use: EmptyState
related:
  - surface
  - stack
  - list
  - button
  - typography
components:
  - Card
  - ClickableCard
  - ActionCard
  - FeatureCard
---

# Card

## Overview

A card is a rounded surface that groups content about one subject, spaced 1 rem apart. One component makes every kind of card:

- **Content card** (the default): any content, such as a title, a sentence and a caption.
- **Card with an action strip** (`heading`, `meta`, `actions`): a heading row and the card's controls in a strip along its bottom.
- **Interactive card** (`href`, or `as="button"`): the whole card is one native link or button.

The family builds on it:

- **FeatureCard** presents a feature with an icon, a title, a description and one action, and stacks them in a narrow card.
- **ClickableCard** and **ActionCard** are Card with `href` or `as="button"`, and Card with `layout="action"`, kept for applications written before Card covered them.

```tsx example=ProjectSummary

```

## Anatomy

1. **Surface** (`tone`, `padding`): the tone's fill with 1.75 rem corners and padding that grows from 1.25 to 1.5 rem with the window, or a fixed step of the spacing scale.
2. **Content** (`children`): spaced 1 rem apart; Card sets no type of its own, so compose it from Text and other components.
3. **Heading row** (with an action strip): `heading`, an `h3` in the section heading type, and `meta` in supporting text at the end of the row, 0.75 rem apart; the row wraps when it runs out of room.
4. **Action strip** (`actions`): a `footer` along the bottom, in the action strip's fill, with 0.75 rem block padding and the card's inline padding, its controls lined up at the end.

FeatureCard lays out an **icon** (`icon`), 1.5 rem in the muted color in a 2.75 rem box, the **title** (`title`), an `h2` in the page heading type, a **description** (`description`) in supporting text, more content (`children`) 1 rem below, and the **action** (`action`) at the end.

## Variants and sizes

| Tone     | Use for                                                                                     |
| -------- | ------------------------------------------------------------------------------------------- |
| `row`    | A card on the page or in a pane: the standalone card fill. The default.                     |
| `pane`   | A quieter fill that groups content, such as a section of a settings page.                   |
| `canvas` | A card in the page's own color, such as inside a pane, where only its corners set it apart. |

<!-- specimen: Tones -->

- A card fills the width its container gives it; set its width on the container or a grid.
- Text in a plain paragraph of a card with an action strip is muted body text, at most 32 characters wide.
- A FeatureCard narrower than 38 rem moves its action below the text, and the action fills the card's width; it follows its own width, not the window's.

## States and behaviour

- **Interactive cards**: with `href` the card is a native link through the `LinkProvider`'s link component, and with `as="button"` a native button with `type="button"`. The whole card, padding included, is the target. Hover and pressed take the hover and pressed colors of the tone's surface, and keyboard focus shows a focus outline 0.125 rem outside the card.
- **Disabled**: a disabled button card cannot be pressed; a disabled link card has no destination, cannot be focused and reports `aria-disabled`. Both take the shared disabled opacity.
- **Content in interactive cards**: an interactive card takes no `heading`, `meta` or `actions`, and its text, in the primary text color, aligns to the start. A button card can only hold phrasing content, such as spans.
- **Action strip**: `actions` turns on the action layout; `layout="action"` turns it on without actions. The strip has a fill of its own, the action strip color, which sets it apart from the card's body in both themes.

## Content guidelines

- Give a card a short title that names its subject, such as a project's name, and keep its text to a sentence or two.
- Put the fact that matters most for choosing in `meta`, such as when the card was updated.
- Name actions with verbs, and put the main one last: "Share", then "Open project".
- Name a link card after its destination, and describe it with its summary.

## Do and don't

### Do

- Use `href` when the whole card goes to one place, and `as="button"` when it starts one action.
- Name a link card by its title with `aria-labelledby`, and describe it with `aria-describedby`, so its accessible name stays short.
- Lay cards out in a grid that fits as many columns as the room allows.
- Put several actions in an action strip instead of making the card interactive.

### Don't

- Don't put links, buttons or other controls inside an interactive card.
- Don't use a card for a list of similar rows; use [List](../components/list.md).
- Don't nest cards inside each other.
- Don't use a card only for its fill; use [Surface](../components/surface.md).

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to an interactive card, or into a card's controls. |
| <kbd>Enter</kbd>                                | Follows a link card or presses a button card.                  |
| <kbd>Space</kbd>                                | Presses a button card.                                         |

### envUI provides

- Native `<a>` and `<button>` elements for interactive cards, and `div`, `article` and `footer` elements for content cards and their action strips.
- The heading of a card with an action strip as an `h3`, and a FeatureCard's title as an `h2`.
- A focus outline around interactive cards, and `aria-disabled` with no destination on a disabled link card.
- Decorative icons in FeatureCard hidden from assistive technology.

### You provide

- Headings in content cards at the level that fits the page's outline, such as Text with `as="h3"`.
- A short accessible name for a link or button card whose text is long, through `aria-labelledby`, and its description through `aria-describedby`.
- The routing behind `href`, through `LinkProvider`.

## Examples

### Action strip

`heading`, `meta` and `actions` make an article with its heading row and a strip of controls along its bottom.

```tsx example=ActionStrip

```

### Link cards

Each card is one link, named by its title and described by its summary, in a grid of as many columns as fit.

```tsx example=Destinations

```

### Button cards

A button card starts an action, here one way to start a project; a disabled one cannot be pressed.

```tsx example=StartOptions

```

### Feature cards

FeatureCard presents a feature with an icon and one action, and stacks them when the card is narrow.

```tsx example=FeatureCards

```

## Changelog

- **1.0.0**: The page is `card`, after the component.
- **0.5.0**: `meta` sits at the end of the heading row, also in right-to-left text.
- **0.2.0**: Link cards render through the application's router link, from `LinkProvider`.
- **0.1.0**: Card for plain, interactive and action-strip cards, with ClickableCard and ActionCard as wrappers; FeatureCard.
