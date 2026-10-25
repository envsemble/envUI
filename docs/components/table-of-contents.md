---
title: TableOfContents
summary: The page's sections as links, nested by level, with the section the reader is in marked as they scroll.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - on this page
  - contents
  - page contents
  - page outline
  - outline
  - TOC
  - scroll spy
  - in-page navigation
  - jump links
  - anchor links
useWhen:
  - A long page of several sections, such as a guide or an article, read from top to bottom
  - Seeing where you are on the page, and jumping to another of its sections
avoidWhen:
  - text: Switching between views of one subject, of which one shows at a time.
    use: Tabs
  - text: The path from the top of a hierarchy down to the current page.
    use: Breadcrumbs
  - text: The application's pages, rather than the sections of one.
    use: Drawer
  - text: The previous and next pages of a guide.
    use: Pager
components:
  - TableOfContents
---

# TableOfContents

## Overview

It lists the page's headings on its own, nesting each under the one above it, and marks the section the reader is in: a short dash before each section, like a ruler, darker once passed; the current one's the longest and darkest, and those beside it and under the pointer a little longer. Sections not yet reached are quieter, so the list reads as how far the reader has come. A link scrolls its section to the top, below anything that stays there, such as a header.

```tsx example=DocsArticle

```

### Sections of your own

A section need not be a heading: name any part of the page, such as a card or a chart, in words of your own.

```tsx example=CustomSections

```

## When to use

```tsx do=TwoLevels caption="Two levels at most: the sections and their parts."

```

```tsx dont=DeepOutline caption="Every level of the page: the deepest ones crowd the column."

```

### Beside the content

Place it in a column beside the content, at the top and staying in view as the page scrolls. Leave it out where the page is too narrow for the column, or has fewer than three sections.

### Labels

Use the headings' own words, or a short name a reader would find on the page.

## Anatomy

```tsx anatomy=TableOfContentsAnatomy enlarge

```

1. **Contents** (`env-table-of-contents`)
2. **Link** (`env-table-of-contents-link`)
3. **Current section** (`env-table-of-contents-link[aria-current='location']`)

Not shown: the sections before the current one, whose dashes are darker.

## Adapting to width

Long labels wrap onto more lines, and the current section's pill grows to their height.

```tsx example=LongLabels widths="12 20"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                      |
| ----------------------------------------------- | ----------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the links.                                    |
| <kbd>Enter</kbd>                                | Scrolls to the link's section and moves focus to its start. |

### envUI provides

- A `nav` landmark named On this page, from `messages.tableOfContents`, around nested ordered lists of links.
- `aria-current="location"` on the link of the section the reader is in.
- Links that scroll smoothly, or at once where reduced motion is preferred, add the section to the address and move focus to it, so reading and the keyboard go on from there.
- Dots drawn by the style sheet alone, which assistive technology doesn't read.

### You provide

- An `aria-label` that tells it apart from other navigation on the page, such as the contents of an article in a page with its own.
- Ids on the elements that `items` name.
- A scroll margin on the sections, or scroll padding on the area that scrolls, where something stays at its top, such as a sticky header: a sticky PageHeader in a Page sets it for you.

## In code

### Usage

Without `items`, TableOfContents reads the headings in `container`, a ref or a CSS selector, or the page's `main` element, once it mounts and again as they change. `levels` chooses the heading levels, `[2, 3]` by default, and each heading nests under the one above it of a lower level. A heading without an id gets one from its words, such as `invite-your-team`. `filter` leaves out headings it returns false for, such as an example's own.

```tsx source=DocsArticle

```

#### Sections of your own

`items` lists the sections instead: each has the `id` of the element it leads to, any element with an id, its `label`, and its own sections in `children`. The server renders them as they are; the current one is marked once the page has hydrated.

```tsx source=CustomSections

```

#### The current section

The current section is the last one whose start, less its scroll margin, has passed a line a quarter of the way down the area that scrolls, below its scroll padding; before the first has, it is the first. Sections too near the end of the page to reach the line share the scrolling left after the last one that does, evenly, so each becomes current in turn and the last one at the very end. It follows whichever area scrolls the sections, the window or an element. A link pressed keeps its section current until the reader scrolls again, also where the page can't scroll it to the top.

### Composition

The landmark is `env-table-of-contents`, around `env-table-of-contents-body`, which holds the list. Each level is an ordered list, `env-table-of-contents-list`, of items, `env-table-of-contents-item`, each a link, `env-table-of-contents-link`, with its level below it, indented by the depth the component sets on it, `--env-table-of-contents-depth`. Links before the current one carry `data-passed`, and the sections after it are quieter. Each link's dash is its `::before`, which grows and shrinks as the current section moves unless reduced motion is preferred. Its name comes from EnvUIProvider's `messages.tableOfContents`.

## Changelog

- **1.0.0**: TableOfContents: the page's headings or sections of your own, nested, with the current section marked as the reader scrolls.
