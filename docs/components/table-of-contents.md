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
examples:
  DocsArticle:
    role: overview
    caption: The page's headings on its own, each nested under the one above it, with the section the reader is in marked.
  CustomSections: example
  TableOfContentsAnatomy: anatomy
  LongLabels: example
  TwoLevels:
    role: do
    caption: 'Two levels at most: the sections and their parts.'
  DeepOutline:
    role: dont
    caption: 'Every level of the page: the deepest ones crowd the column.'
---

# TableOfContents

## Variants

### Sections of your own

A section need not be a heading: name any part of the page, such as a card or a chart, in words of your own.

```tsx figure=CustomSections

```

## Anatomy

```tsx figure=TableOfContentsAnatomy enlarge

```

1. **Contents** (`env-table-of-contents`)
2. **Reader's place** (`env-table-of-contents-wave`)
3. **Link** (`env-table-of-contents-link`)
4. **Current section** (`env-table-of-contents-link[aria-current='location']`)

Not shown: the sections passed, their labels as dark as the current one's.

## Behaviour

### The reader's place

One shape down the side of the list bulges beside the section the reader is in, in one quiet color.

- It travels to the next section with a little give: it stretches as it goes and settles with a short wobble, then stays still.
- It moves at once, without the wobble, where reduced motion is preferred.
- The section under the pointer swells it a little, and its label takes the accent color.

<!-- specimen: ReadersPlace -->

### Going to a section

A link scrolls its section to the top, below anything that stays there, such as a header.

### Adapting to width

Long labels wrap onto more lines, and the shape runs beside all of them.

```tsx figure=LongLabels widths="20 12" motion

```

## Rules

Keep the contents short: two levels, each section on one line.

```tsx figure=TwoLevels

```

```tsx figure=DeepOutline

```

### Beside the content

Place it in a column beside the content, at the top and staying in view as the page scrolls.

- Leave it out where the page is too narrow for the column, or has fewer than three sections.

### Labels

Use the headings' own words, or a short name a reader would find on the page. Keep each on one line: give the column the room its labels need.

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
- A shape hidden from assistive technology, which reads the current link instead; in forced colors it takes the system's text color, its width still marking the place.

### You provide

- An `aria-label` that tells it apart from other navigation on the page, such as the contents of an article in a page with its own.
- Ids on the elements that `items` name.
- A scroll margin on the sections, or scroll padding on the area that scrolls, where something stays at its top, such as a sticky header: a sticky PageHeader in a Page sets it for you.

## Compose

### Usage

```tsx
<article ref={article}>…</article>
<TableOfContents container={article} levels={[2, 3]} />
```

Without `items`, TableOfContents reads the headings in `container`, a ref or a CSS selector, or the page's `main` element, once it mounts and again as they change. `levels` chooses the heading levels, `[2, 3]` by default, and each heading nests under the one above it of a lower level. A heading without an id gets one from its words, such as `invite-your-team`. `filter` leaves out headings it returns false for, such as an example's own.

#### Sections of your own

```tsx
<TableOfContents
  items={[
    { id: 'revenue', label: 'Revenue', children: [{ id: 'by-region', label: 'By region' }] },
    { id: 'customers', label: 'Customers' },
  ]}
/>
```

Each item has the `id` of the element it leads to, any element with an id, its `label`, and its own sections in `children`. The server renders them as they are; the current one is marked once the page has hydrated.

#### The current section

The current section is the last one whose start, less its scroll margin, has passed a line a quarter of the way down the area that scrolls, below its scroll padding; before the first has, it is the first.

- Sections too near the end of the page to reach the line share the scrolling left after the last one that does, evenly, so each becomes current in turn and the last one at the very end.
- It follows whichever area scrolls the sections, the window or an element, measured in that area's own pixels, also inside a transformed or zoomed container, such as a scaled preview.
- A link pressed keeps its section current until the reader scrolls again, also where the page can't scroll it to the top.

### Composition

The landmark is `env-table-of-contents`, around `env-table-of-contents-body`, which holds the list. Each level is an ordered list, `env-table-of-contents-list`, of items, `env-table-of-contents-item`, each a link with its level below it, indented by the depth the component sets on it, `--env-table-of-contents-depth`. Links before the current one carry `data-passed`, and the sections after it are quieter. Its name comes from EnvUIProvider's `messages.tableOfContents`.

The reader's place is `env-table-of-contents-wave`, an SVG hidden from assistive technology in the body's start column, `--env-table-of-contents-stroke` wide at its fullest, `--env-space-5` by default, and a tenth of that elsewhere. The component draws its outline every frame the place moves, without rendering again, from the links' layout positions.

- It is one path in `--env-color-bg-neutral-muted`, a round bulb over about two entries either side of the place, fewer in a list of under seven. In right-to-left text, its straight edge is on the right.
- It follows the scroll on a spring, and two more springs stretch it and lean it back with its speed, so it wobbles once as it lands; no frame is drawn once they rest. At once under reduced motion; in forced colors it is `CanvasText`.

## Changelog

- **1.0.0-prerelease.5**: The reader's place is one shape down the side of the list instead of a dash before each section, in one color: straight along the list's start and bulging broadly toward the labels beside the current section, thin a few sections away. It moves on a spring, stretching as it travels and settling with a short wobble, at once under reduced motion. The labels sit a little further in. Inside a transformed or zoomed container, the current section is measured in the scrolling area's own pixels.
- **1.0.0**: TableOfContents: the page's headings or sections of your own, nested, with the current section marked as the reader scrolls.
