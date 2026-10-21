---
title: Card
summary: A rounded surface that groups content about one subject, as a content card with a title and actions, a feature card, or one link or button.
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

> What is a card, and what does it look like?

A card is a rounded surface that groups content about one subject, such as a project's summary, and sets it apart from the page. Its content is spaced 1 rem apart. One component makes every kind of card: a content card with a title row and actions, a feature card, and a card that is one link or button.

```tsx example=ProjectSummary

```

Cards fill the width their container gives them; set their width on the container or a grid. Card sets no type of its own, so compose its content from Text and other components.

## Variants

> Which kinds of card are there?

### Content card

The default. `title` and `meta` make a title row, `description` a sentence under it, and `actions` a strip of controls along the bottom, in a fill of its own that sets it apart from the card's body in both themes. `render` makes the card an article.

```tsx example=ActionStrip

```

### Feature card

`layout="feature"` presents a feature with an icon at the start, its title and description, and one action at the end.

```tsx example=FeatureCards

```

### Link card

With `href` the whole card is one native link, through the `LinkProvider`'s link component, named by its text: its title, then its summary.

```tsx example=Destinations

```

### Button card

With `onClick` the whole card is a native button with `type="button"`, which can only hold phrasing content, such as spans. A disabled one cannot be pressed.

```tsx example=StartOptions

```

- **Hover and press**: the whole card, padding included, is the target. Hover and pressed take the hover and pressed colors of its background, and keyboard focus shows a focus outline 0.125 rem outside the card.
- **Disabled**: a disabled button card cannot be pressed; a disabled link card has no destination, cannot be focused and reports `aria-disabled`. Both take the shared disabled opacity.
- **Content**: an interactive card takes no `title`, `meta`, `description`, `actions` or `layout`, and its text, in the primary text color, aligns to the start.

> Which backgrounds can a card take?

| Background | Use for                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------- |
| `muted`    | A card on the page or in a pane: the standalone card fill. The default.                     |
| `default`  | A quieter fill that groups content, such as a section of a settings page.                   |
| `page`     | A card in the page's own color, such as inside a pane, where only its corners set it apart. |

<!-- specimen: Backgrounds -->

## When to use

> When should I use a card, and when something else?

```tsx do=MembersInList caption="Use a List for rows of similar items, each with a label, a description and an action."

```

```tsx dont=MembersAsCards caption="Don't stack cards for a list of similar rows: the repeated fills and corners crowd out the content."

```

```tsx do=OneCardSections caption="Group what belongs to one subject in one card, with Text for its parts."

```

```tsx dont=NestedCards caption="Don't nest cards inside each other; the fills and corners stack up and blur what belongs together."

```

- Use `href` when the whole card goes to one place, and `onClick` when it starts one action. Put several actions in an action strip instead of making the card interactive.
- Don't put links, buttons or other controls inside a link or button card.
- Don't name a link or button card with `aria-label` or `aria-labelledby` that leaves out part of its visible text: speech input users say what they see.
- Lay cards out in a grid that fits as many columns as the room allows, and set `headingLevel` to the level that fits the page's outline.
- Don't use a card only for its fill; use [Surface](../components/surface.md).

> How do I write a card's content?

- Give a card a short title that names its subject, such as a project's name, and keep its text to a sentence or two.
- Put the fact that matters most for choosing in `meta`, such as when the card was updated.
- Name actions with verbs, and put the main one last: "Share", then "Open project".
- Start a link card with its destination's name, so its accessible name, which is its whole text, starts with what people look for.

## Anatomy

> What is a card made of?

```tsx anatomy=CardAnatomy

```

1. **Surface** (`env-card`, `background`, `padding`): the fill with 1.75 rem corners and padding that grows from 1.25 to 1.5 rem with the window, or a fixed step of the spacing scale.
2. **Title** (`env-card-heading`, `title`): an `h3` in the title type; `headingLevel` sets another level for the page's outline.
3. **Meta** (`env-card-meta`, `meta`): supporting text at the end of the title row, `env-card-header`, 0.75 rem from the title; the row wraps when it runs out of room.
4. **Description** (`env-card-description`, `description`): a sentence under the title in muted text.
5. **Content** (`env-card-body > env-text:last-child`, `children`): spaced 1 rem apart, in `env-card-body`.
6. **Footer** (`env-card-footer`, `actions`): a `footer` along the bottom, in the action strip's fill, with 0.75 rem block padding and the card's inline padding, its controls lined up at the end.

The feature layout, `env-card-layout`, lays out an **icon** (`env-card-icon`), 1.5 rem in the muted color in a 2.75 rem box, the title, an `h2` in the headline type, the description in supporting text, more content 1 rem below, and the actions at the end.

## Adapting to width

> How does a card adapt to the room it has?

A card fills the width its container gives it, and its padding grows from 1.25 to 1.5 rem with the window. A feature card follows its own width, not the window's: narrower than 38 rem, it moves its action below the text, and the action fills the card's width.

```tsx example=InviteFeature widths="24 44"

```

- The title row wraps when it runs out of room, and `meta` keeps to the end of the row, also in right-to-left text.
- Text in a plain paragraph of a card with an action strip is muted body text, at most 32 characters wide.
- Lay link and button cards out in a grid of as many columns as fit, as the link cards above do.

## Accessibility

> How do I keep cards accessible?

A content card is a `div`, or the element of `render`; a link or button card is one native element, named by everything it says. Keep its text short, since all of it is the name.

### Keyboard

| Key                                             | Action                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to a link or button card, or into a card's controls. |
| <kbd>Enter</kbd>                                | Follows a link card or presses a button card.                    |
| <kbd>Space</kbd>                                | Presses a button card.                                           |

### envUI provides

- Native `<a>` and `<button>` elements for link and button cards, named by their content, and `div` elements for content cards, or the element of `render`, such as `article`, with a `footer` for the action strip.
- The title as an `h3`, or an `h2` in the feature layout, at the level `headingLevel` sets.
- A focus outline around link and button cards, and `aria-disabled` with no destination on a disabled link card.
- The feature layout's icon hidden from assistive technology.

### You provide

- A heading level that fits the page's outline, through `headingLevel`.
- `render={<article />}` for a card that stands on its own, such as a post in a feed.
- The routing behind `href`, through `LinkProvider`.

## Changelog

- **1.0.0**: ClickableCard, ActionCard and FeatureCard are Card: `onClick` makes a button card, `render` the element of a content card, and `layout="feature"` the feature card. `tone` is `background`, `heading` is `title`, which takes `headingLevel`, as on EmptyState, and Card takes `description`; the native `title` attribute is not a prop of a card. The page is `card`, after the component.
- **0.5.0**: `meta` sits at the end of the heading row, also in right-to-left text.
- **0.2.0**: Link cards render through the application's router link, from `LinkProvider`.
- **0.1.0**: Card for plain, interactive and action-strip cards, with ClickableCard and ActionCard as wrappers; FeatureCard.
