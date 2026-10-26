---
title: Page
summary: The invisible column a page's content sits in, at a readable width, under its header with the page's title and actions.
status: beta
since: 1.0.0
category: App frame & layout
aliases:
  - Container
  - container
  - page container
  - content width
  - max width
  - page column
  - page layout
  - main column
  - page header
  - page heading
  - page title
  - header bar
  - title bar
  - page toolbar
  - heading row
  - sticky header
useWhen:
  - A readable width in a wide window, such as for a form or a document
  - A page's title and the actions for the whole page, such as New project (PageHeader)
  - A trail, a status or a count beside the title, or search and filters under it
  - A page heading that stays in view as the page scrolls
avoidWhen:
  - text: The frame of an application, with its top bar and navigation.
    use: Scaffold
  - text: The application's bar across every page, with its name, search and account menu.
    use: TopBar
  - text: Two panes side by side, such as a list and its detail.
    use: Panes
  - text: Content in a column with even gaps inside a page.
    use: Column
  - text: The heading of a section inside a page, with its own actions.
    use: Row
  - text: Controls for one subject that the arrow keys move between.
    use: Toolbar
components:
  - Page
  - PageHeader
examples:
  WithHeader: overview
  WithBreadcrumbs: example
  WithToolbar: example
  PageAnatomy: anatomy
  PageHeaderAnatomy: anatomy
  Sticky: example
  Gutters:
    role: example
    caption: The muted fill shows the gutter.
---

# Page

## Variants

### The header

The title can have a trail above it, a status or a count beside it and a sentence under it, with the page's actions at the end of its row.

```tsx figure=WithBreadcrumbs

```

### Search and filters

A row below the title holds search, filters and view switches.

- On a dense page, its buttons and the actions take the small control height.

```tsx figure=WithToolbar

```

### Widths

| Width  | Use for                                            |
| ------ | -------------------------------------------------- |
| Small  | A form, a settings page or a sign-in page.         |
| Medium | A document, an article or the details of one item. |
| Large  | A dashboard, a list or a table. The default.       |
| Full   | A board, a canvas or a wide table.                 |

<!-- specimen: ColumnWidths -->

### Without the gutter

A page can leave its sides to its content, such as a table that runs to the edges.

## Anatomy

```tsx figure=PageAnatomy

```

1. **Page** (`env-page`)
2. **Header** (`env-page-header`, `header`)
3. **Content** (`env-page-content`, `children`)

```tsx figure=PageHeaderAnatomy

```

1. **Header** (`env-page-header`)
2. **Breadcrumbs** (`env-page-header-breadcrumbs`, `breadcrumbs`)
3. **Start** (`env-page-header-start`, `start`)
4. **Title** (`env-page-header-title`, `title`)
5. **Meta** (`env-page-header-meta`, `meta`)
6. **Description** (`env-page-header-description`, `description`)
7. **Actions** (`env-page-header-actions`, `actions`)
8. **Toolbar** (`env-page-header-toolbar`, `toolbar`)

## Behaviour

### Sticky

A header can stay at the top of the area that scrolls, under a Scaffold's top bar.

- What takes focus in the page keeps clear of it.

```tsx figure=Sticky

```

### Adapting to width

The gutter at the page's sides is narrower in a compact region, such as on a phone or in a narrow pane of a wide window, and the header follows its own width.

- Where the header is narrow, the actions move under the title and wrap.
- The title wraps too and is never cut short.
- More actions than fit go in a [Menu](menu.md) as the last one.

```tsx figure=Gutters widths="44 22" sweep classes

```

## Rules

Page goes in a [Scaffold](scaffold.md)'s body, and its header sits at the top of the same column, so the title lines up with the content.

### Width

One page per page, at the width for what it holds, and never the full width for text.

- A part that needs a narrower width takes it from its own content.

### One heading

Give each page one header, whose title is the page's main heading.

- In a pane or a dialog, its heading sits a level lower.

## Accessibility

### envUI provides

- A plain element without a role, so the page adds no landmark inside the Scaffold's `main`.
- The header as a `div`, no landmark, with the title as a heading at `headingLevel`.
- The header's parts in the same order to read, to tab through and to see, at every width.
- With a sticky header, a scroll margin that keeps what takes focus clear of it.

### You provide

- The page's one `h1`, usually its header's title, and a `headingLevel` that fits the headings around a header in a pane or a dialog.
- `render={<article />}` where the page is one, such as a document.
- Names for icon-only actions and labels for the fields in the header's toolbar.

## Compose

### Usage

Page holds the page's content as `children`, and its heading, a PageHeader, in `header`, at the top of the same column.

- Put it in a Scaffold's body, which is already the `main` landmark: add none around a Page.

```tsx source=WithHeader

```

#### Width and gutter

- `width` is `sm`, 40 rem, `md`, 60 rem, `lg`, 76 rem and the default, or `full`.
- `gutter` pads the column's inline edges with the page gutter, 1 rem in a compact region and 1.5 rem from medium, by the window class of the region the page sits in, so a page in a narrow pane of a wide window keeps the compact gutter.
- `gutter={false}` leaves them to the content, such as a full-bleed table.

```tsx
<Page width="sm" header={<PageHeader title="Settings" />}>
  …
</Page>
<Page width="full" gutter={false}>
  …
</Page>
```

#### Element and name

`render` sets the element, a `div` by default, such as `render={<article />}` for a document. `name` names the node for dev mode, as `data-env-name`.

#### The header

A PageHeader takes the page's `title`, which wraps, balanced across its lines, and is never cut short.

- `description` goes under it, in the smaller muted text.
- `breadcrumbs` go above it, usually Breadcrumbs with `wrap={false}`.
- `start` goes before it, such as an Avatar, an icon or a back IconButton.
- `meta` goes beside it, such as Badges or a count.
- The page's `actions` go at the end of the title row, the primary action last.
- The page's title and actions go here, not in the top bar, which belongs to the frame.

```tsx
<PageHeader
  title="Northwind launch"
  description="Press kit, venue and invitations for the spring launch."
  breadcrumbs={<Breadcrumbs wrap={false} items={trail} />}
  meta={<Badge tone="success">On track</Badge>}
  actions={
    <>
      <Button variant="secondary" startIcon={<Share />}>
        Share
      </Button>
      <Button>New task</Button>
    </>
  }
/>
```

#### Heading level

The title is an `h1` by default. Set `headingLevel` lower for a header inside a pane, a dialog or a section under another heading; it looks the same at every level.

#### Toolbar

`toolbar` adds a second row under the title for search, filters and view switches, laid out with `<Row wrap justify="between">`.

- A row that holds a text field is a Row, not a Toolbar, so the field keeps its arrow keys.
- `controlSize` is `md`, the default, or `sm` for a dense page, such as one in a small window: it sizes the buttons and icon buttons in `actions` and `toolbar` that set none.
- Give fields in the toolbar the same `size`.

```tsx
<PageHeader
  title="People"
  controlSize="sm"
  actions={<Button startIcon={<Add />}>Invite</Button>}
  toolbar={
    <Row wrap align="center" justify="between" gap={3}>
      <SearchField label="Search people" size="sm" />
      <SegmentedControl
        aria-label="View"
        size="sm"
        value={view}
        onValueChange={setView}
        items={views}
      />
    </Row>
  }
/>
```

#### Sticky

`sticky` keeps the header in view at the top of the area that scrolls, over the content under it: under a Scaffold's top bar where the document scrolls, or at the top of a Scaffold's body that scrolls.

- As a Page's header, what scrolls into view below it, such as a field taking focus, keeps clear of it.
- The header measures its height, which CSS reckons from its rows until script runs.

```tsx
<Page
  header={
    <PageHeader
      sticky
      title="Annual report"
      actions={<Button variant="secondary">Download</Button>}
    />
  }
>
  …
</Page>
```

### Composition

The page, `env-page`, holds its header and its content, `env-page-content`, at its width.

- It never paints, and it is the `env-page` size container for the content inside.
- `data-width` carries a width other than `lg`, and `data-gutter="none"` a page without the gutter.

The header is a `div`, no landmark, `env-page-header`, with the breadcrumbs, `env-page-header-breadcrumbs`, the start, `env-page-header-start`, the title, `env-page-header-title`, the meta, `env-page-header-meta`, the description, `env-page-header-description`, the actions, `env-page-header-actions`, and the toolbar, `env-page-header-toolbar`.

- It responds to its own width: below 37.5 rem the actions move under the title and wrap.
- Put more actions than fit in a Menu as the last one.

## Changelog

- **1.0.0-prerelease.3**: PageHeader is documented on this page, `page`, which its page's address opens.
- **1.0.0**: Page, with the widths `sm`, `md`, `lg` and `full`, `header`, `gutter`, `name` and `render`; invisible structure whose gutters follow the window class of the region it sits in, and the `env-page` container. PageHeader, with `title`, `headingLevel`, `description`, `breadcrumbs`, `start`, `meta`, `actions`, `toolbar`, `sticky` and `controlSize`.
