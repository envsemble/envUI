---
title: TableOfContents
summary: The page's sections as links, with the one the reader is in marked.
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
  - A long page of several sections, such as a guide or an article
  - Seeing where you are on the page, and jumping to another of its sections
avoidWhen:
  - text: Switching between views of one subject, of which one shows at a time.
    use: SegmentedControl
  - text: The application's pages, rather than the sections of one.
    use: NavigationDrawer
  - text: The previous and next pages of a guide.
    use: Pager
components:
  - TableOfContents
examples:
  DocsArticle:
    role: overview
    caption: The page's headings on its own, each nested under the one above it, with the section the reader is in marked.
  TableOfContentsAnatomy: anatomy
  LongLabels: example
---

# TableOfContents

## Anatomy

```tsx figure=TableOfContentsAnatomy enlarge width="21"

```

1. **Contents** (`env-table-of-contents`)
2. **Reader's place** (`env-table-of-contents-wave`)
3. **Link** (`env-table-of-contents-item:last-child > env-table-of-contents-link:not([aria-current])`)
4. **Current section** (`env-table-of-contents-link[aria-current='location']`)

## Behaviour

### The reader's place

<!-- specimen: ReadersPlace -->

### Adapting to width

```tsx figure=LongLabels widths="20 12" motion

```
