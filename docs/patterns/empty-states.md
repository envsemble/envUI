---
title: Empty states
summary: Show what a region holds when it has nothing to show, and the one way on.
status: beta
since: 1.0.0
intent: Keep people informed
aliases:
  - EmptyState
  - empty state
  - no results
  - no data
  - zero state
  - first use
  - nothing found
  - no access
  - page not found
  - not found
  - 404 page
  - offline
  - error page
useWhen:
  - A list, a table or a page with nothing to show
  - A search or filters that match nothing
  - Content that failed to load, or that people may not see
  - A whole page that can't show, such as one not found
avoidWhen:
  - text: Content that is still loading.
    see: loading
  - text: Reporting that an action, such as a save, failed.
    see: feedback
composes:
  - Alert
  - PageHeader
  - SearchField
  - Select
  - List
  - Table
  - placeholders
  - Badge
  - Scaffold
  - TopBar
  - Page
  - Button
  - Surface
  - Column
  - Row
  - Grid
  - Text
examples:
  FirstUse:
    role: overview
    motion: true
  NoResults: example
  LoadFailed: example
  NoAccess: example
  AllDone: example
  WholePage: example
  EmptyStatesAnatomy: anatomy
  OneAction:
    role: do
    caption: One action, the one that ends the state.
  CompetingActions:
    role: dont
    caption: Several actions compete, and none says what ends the state.
---

# Empty states

## Variants

### No results

The search and the filters stay, and Clear filters resets them, as in [filtering](filtering.md).

```tsx figure=NoResults motion

```

### Load failed

A failure is a danger [Alert](../components/alert.md), announced as it appears, in the room the table takes. It says the documents are safe.

```tsx figure=LoadFailed

```

### No access

The state says who to ask, and Request access sends the request.

```tsx figure=NoAccess

```

### All done

When the last review is approved, the queue says so, and what comes next.

```tsx figure=AllDone motion

```

### A whole page

When the whole page can't show, the frame stays and the page says so, with the way on.

- Its address leads nowhere: Go to Home.
- The person may not see it: Request access.
- The device is offline: Try again.

```tsx figure=WholePage stage=shaded motion

```

## Anatomy

```tsx figure=EmptyStatesAnatomy

```

1. **The frame that stays** (`env-page-header`)
2. **Icon** (`env-page-header ~ * env-text > svg`)
3. **Heading** (`env-page-header ~ * env-text[data-variant='title']`)
4. **Description** (`env-page-header ~ * env-text[data-variant='body-sm']`)
5. **Action** (`env-page-header ~ * env-button`)

## Behaviour

### In place of the content

The state takes the place of the list or the table, under the heading and toolbar that stay: an icon, a heading, a sentence and the one action.

- Until something exists, it holds the create action.
- Then the page's own action takes over.

## Rules

Each empty state says what happened, and offers the one way on.

### Which to use

Each kind says something different, and offers a different way on.

| Kind         | Use for                                                      |
| ------------ | ------------------------------------------------------------ |
| First use    | Nothing has been made yet.                                   |
| No results   | A search or a filter matches nothing.                        |
| All done     | People cleared a queue, such as their reviews.               |
| Load failed  | The content couldn't load, as a danger Alert.                |
| No access    | The content exists, but not for this person.                 |
| A whole page | The page can't show at all: not found, no access or offline. |

```tsx figure=OneAction

```

```tsx figure=CompetingActions

```

### Placement

Centre the state, with a large icon, where it takes a region's place and the region gives it height. In a small card or under a list's toolbar, start it at the edge, with a smaller icon.

### Content

The title states the fact, the description says why or what next, and one action at most resolves it.

- First use says what the place is for, "No projects yet", and offers "Create project".
- No results names the query in curly quotes, "Nothing matches “roadmap” with these filters.", and offers "Clear filters".
- A done state stays factual, "No reviews waiting", never "All caught up! Great job!".
- A failure says the work is safe, "Your documents are safe. Check your connection and try again.", and offers "Try again".
- A whole page says what happened in its title: "Page not found", "You don't have access to this page" or "You're offline".

## Accessibility

### Focus and keyboard

An empty state doesn't take focus; <kbd>Tab</kbd> reaches its action after the toolbar. When the action makes the state go, move focus on.

- Clear filters moves it to the search.
- Create project moves it to the new list.
- Try again moves it to the region's heading.

### envUI provides

- The icons hidden from assistive technology, so the heading and the sentence are what is read.

### You provide

- The heading's level, such as `render={<h4 />}` under a section's `h3`, so the state takes its place in the page's outline; its look stays the title type whatever the level, except inside a section whose own heading is a title, such as in a pane, where it is body text so it doesn't match its section.
- A danger Alert with `announce` for content that failed to load, so it is announced; a neutral state isn't.
- The right kind of state, its words and its one action.
- A count of results in a `role="status"` text beside a search, since a neutral state isn't announced.
- For a whole page, the page's one `h1` and `document.title` saying what happened, such as "Page not found – Northwind".

## Compose

### Usage

An empty state is a Column of Text and a Button, with no component of its own:

- the icon in a muted Text;
- the heading as Text with `variant="title"` at the level the outline needs, such as `render={<h4 />}`;
- the description as Text with `variant="body-sm"`;
- then the one Button.

Render it in place of the List or the Table when there is nothing to show, and once something exists, show the page's own action instead.

```tsx source=FirstUse

```

#### Placement and icon size

Centred, the Column takes `align="center"`, `justify="center"` and `textAlign: 'center'`, with a 2.5 rem icon, in a region that gives it height, such as a Surface with a `minBlockSize`. At the start, under a toolbar or in a small card, it keeps the default alignment and a 1.5 rem icon.

#### No results

Keep the SearchField and the Select in the PageHeader's `toolbar`, and say the count of matches in a Text with `role="status"`, since a neutral state isn't announced. Clear filters resets the query and the filters, then focuses the search, as the button goes with the state.

#### Load failed

A failure is an Alert with `tone="danger"` and `announce`, its Try again Button in `actions`, in the table's place. Try again moves focus to the region's heading, a Text with `tabIndex={-1}` and a ref, while the same Table loads as a `skeleton` over `placeholders()` rows, as the LoadFailed example does.

```tsx
<Alert
  tone="danger"
  announce
  title="Couldn’t load documents"
  actions={
    <Button variant="secondary" onClick={retry}>
      Try again
    </Button>
  }
>
  Your documents are safe. Check your connection and try again.
</Alert>
```

#### A whole page

Keep the Scaffold and its navigation, and render the state as the router's page: the same Column, centred in the body, with the page's `h1` as its heading, as the WholePage example does. Not found offers a Link or Button to the home page, no access a Request access Button, and offline a Try again Button that loads the page again once the connection is back.

```tsx
<Scaffold topBar={<TopBar title="Northwind" />}>
  <Page>
    <Column gap={4} padding={5} align="center" justify="center" style={{ textAlign: 'center' }}>
      <Text render={<h1 />} variant="title">
        Page not found
      </Text>
      <Button variant="secondary" href="/">
        Go to Home
      </Button>
    </Column>
  </Page>
</Scaffold>
```

## Changelog

- **1.0.0**: Empty states are built from Column, Text and Button, in place of the EmptyState component. The page is on the figure template, with a whole page and the empty states of the content guidelines.
