---
title: Card
summary: A rounded surface that groups content about one subject, as a content card with a heading and actions, a feature card, or one link or button.
status: stable
since: 0.1.0
category: Layout & surfaces
aliases:
  - tile
  - panel
  - content card
  - clickable card
  - link card
  - button card
  - action card
  - feature card
  - promo card
  - ClickableCard
  - ActionCard
  - FeatureCard
useWhen:
  - Content about one subject stands apart from the page, such as a project's summary.
  - A summary needs its own actions along the bottom, such as Share and Open (`actions`).
  - The whole surface leads to one destination or starts one action, such as a project in a grid (`href`, `onClick`).
  - A feature is introduced with an icon, a sentence and one action (`layout="feature"`).
avoidWhen:
  - text: A fill, padding and corners without card semantics or spacing, such as a toolbar's background.
    use: Surface
  - text: Rows of items with a label, a description and an action, connected in one list.
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
---

# Card

## Overview

A card is a rounded surface that groups content about one subject, spaced 1 rem apart. One component makes every kind of card:

- **Content card** (the default): any content, with an optional heading row (`heading`, `meta`), a `description` and `actions` in a strip along its bottom.
- **Feature card** (`layout="feature"`): an icon, a heading, a description and one action, which stack in a narrow card.
- **Link card** (`href`) and **button card** (`onClick`): the whole card is one native link or button.

```tsx example=ProjectSummary

```

## Anatomy

1. **Surface** (`background`, `padding`): the fill with 1.75 rem corners and padding that grows from 1.25 to 1.5 rem with the window, or a fixed step of the spacing scale.
2. **Header** (`heading`, `meta`): the heading, an `h3` in the title type, and `meta` in supporting text at the end of the row, 0.75 rem apart; the row wraps when it runs out of room. `headingLevel` sets another level for the page's outline.
3. **Description** (`description`): a sentence under the heading in muted text.
4. **Content** (`children`): spaced 1 rem apart; Card sets no type of its own, so compose it from Text and other components.
5. **Footer** (`actions`): a `footer` along the bottom, in the action strip's fill, with 0.75 rem block padding and the card's inline padding, its controls lined up at the end.

The feature layout lays out an **icon** (`icon`), 1.5 rem in the muted color in a 2.75 rem box, the **heading**, an `h2` in the headline type, the **description** in supporting text, more content 1 rem below, and the **actions** at the end.

## Variants and sizes

| Background | Use for                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------- |
| `muted`    | A card on the page or in a pane: the standalone card fill. The default.                     |
| `default`  | A quieter fill that groups content, such as a section of a settings page.                   |
| `page`     | A card in the page's own color, such as inside a pane, where only its corners set it apart. |

<!-- specimen: Backgrounds -->

| Layout    | Use for                                                                                |
| --------- | -------------------------------------------------------------------------------------- |
| `stack`   | Content spaced 1 rem apart, with the actions in a strip along the bottom. The default. |
| `feature` | A feature with an icon at the start, its heading and description, and one action.      |

- A card fills the width its container gives it; set its width on the container or a grid.
- Text in a plain paragraph of a card with an action strip is muted body text, at most 32 characters wide.
- A feature card narrower than 38 rem moves its action below the text, and the action fills the card's width; it follows its own width, not the window's.

## States and behaviour

- **Link and button cards**: with `href` the card is a native link through the `LinkProvider`'s link component, and with `onClick` a native button with `type="button"`. The whole card, padding included, is the target. Hover and pressed take the hover and pressed colors of its background, and keyboard focus shows a focus outline 0.125 rem outside the card.
- **Disabled**: a disabled button card cannot be pressed; a disabled link card has no destination, cannot be focused and reports `aria-disabled`. Both take the shared disabled opacity.
- **Content in link and button cards**: an interactive card takes no `heading`, `meta`, `description`, `actions` or `layout`, and its text, in the primary text color, aligns to the start. A button card can only hold phrasing content, such as spans.
- **Action strip**: `actions` puts the strip along the bottom of a stacked card. It has a fill of its own, the action strip color, which sets it apart from the card's body in both themes.

## Content guidelines

- Give a card a short heading that names its subject, such as a project's name, and keep its text to a sentence or two.
- Put the fact that matters most for choosing in `meta`, such as when the card was updated.
- Name actions with verbs, and put the main one last: "Share", then "Open project".
- Start a link card with its destination's name, so its accessible name, which is its whole text, starts with what people look for.

## Do and don't

### Do

- Use `href` when the whole card goes to one place, and `onClick` when it starts one action.
- Let a link or button card's text name it, and keep that text short: a title and a line of summary.
- Set `headingLevel` to the level that fits the page's outline.
- Lay cards out in a grid that fits as many columns as the room allows.
- Put several actions in an action strip instead of making the card interactive.

### Don't

- Don't put links, buttons or other controls inside a link or button card.
- Don't name a link or button card with `aria-label` or `aria-labelledby` that leaves out part of its visible text: speech input users say what they see.
- Don't use a card for a list of similar rows; use [List](../components/list.md).
- Don't nest cards inside each other.
- Don't use a card only for its fill; use [Surface](../components/surface.md).

## Accessibility

### Keyboard

| Key                                             | Action                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to a link or button card, or into a card's controls. |
| <kbd>Enter</kbd>                                | Follows a link card or presses a button card.                    |
| <kbd>Space</kbd>                                | Presses a button card.                                           |

### envUI provides

- Native `<a>` and `<button>` elements for link and button cards, named by their content, and `div` elements for content cards, or the element of `render`, such as `article`, with a `footer` for the action strip.
- The heading as an `h3`, or an `h2` in the feature layout, at the level `headingLevel` sets.
- A focus outline around link and button cards, and `aria-disabled` with no destination on a disabled link card.
- The feature layout's icon hidden from assistive technology.

### You provide

- A heading level that fits the page's outline, through `headingLevel`.
- `render={<article />}` for a card that stands on its own, such as a post in a feed.
- The routing behind `href`, through `LinkProvider`.

## Examples

### Action strip

`heading`, `meta` and `actions` make a heading row and a strip of controls along the bottom; `render` makes the card an article.

```tsx example=ActionStrip

```

### Link cards

Each card is one link, named by its title and summary, in a grid of as many columns as fit.

```tsx example=Destinations

```

### Button cards

A button card starts an action, here one way to start a project; a disabled one cannot be pressed.

```tsx example=StartOptions

```

### Feature cards

The feature layout presents a feature with an icon and one action, and stacks them when the card is narrow.

```tsx example=FeatureCards

```

## Changelog

- **1.0.0**: ClickableCard, ActionCard and FeatureCard are Card: `onClick` makes a button card, `render` the element of a content card, and `layout="feature"` the feature card. `tone` is `background`, `heading` takes `headingLevel`, and Card takes `description`. The page is `card`, after the component.
- **0.5.0**: `meta` sits at the end of the heading row, also in right-to-left text.
- **0.2.0**: Link cards render through the application's router link, from `LinkProvider`.
- **0.1.0**: Card for plain, interactive and action-strip cards, with ClickableCard and ActionCard as wrappers; FeatureCard.
