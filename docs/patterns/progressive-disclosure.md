---
title: Progressive disclosure
summary: Show what most people need first, and keep the rest one step away, in the place and at the depth that fits it.
status: beta
since: 1.0.0
intent: Work with lists and tables
aliases:
  - progressive disclosure
  - advanced options
  - show more
  - more actions
  - overflow menu
  - details panel
  - accordion
  - help text
useWhen:
  - Options, details or actions most people rarely need
  - An explanation of a term that would clutter the page
avoidWhen:
  - text: Switching between views of the same content.
    use: Tabs
  - text: Moving between the places of the application.
    see: navigation
  - text: Information people need to complete a task, such as a required field or an error.
    see: forms
composes:
  - Disclosure
  - Accordion
  - Popover
  - Tooltip
  - Sheet
  - Dialog
  - Menu
  - Button
  - IconButton
  - Link
  - List
  - Badge
  - DescriptionList
  - Select
  - Checkbox
  - TextField
  - Column
  - Row
  - Text
examples:
  AdvancedOptions:
    role: overview
    motion: true
  ShowMore: example
  DetailsInSheet: example
  OverflowActions: example
  ExplainATerm: example
  DisclosureLayers: anatomy
---

# Progressive disclosure

## Variants

### Show all

The button stays after the list and says what a press does.

- It reads "Show all 12", then "Show fewer".
- It tells assistive technology whether the whole list shows.

```tsx figure=ShowMore motion

```

### Details in a sheet

The list stays in place under the Sheet, so people continue from the row they opened.

```tsx figure=DetailsInSheet motion

```

### Overflow actions

Share and Edit stay visible; the rest wait in a [Menu](../components/menu.md) named More actions.

```tsx figure=OverflowActions motion

```

### Explain a term

A help button opens a Popover with a short definition and a link.

```tsx figure=ExplainATerm motion

```

## Anatomy

```tsx figure=DisclosureLayers

```

1. **Visible layer** (`env-text-field`)
2. **Summary** (`env-disclosure summary`, `title`)
3. **Disclosed layer** (`env-disclosure-panel`)
4. **More actions** (`env-button ~ env-button`)

## Rules

Show what most people need, and keep the rest a step away: advanced options wait behind a [Disclosure](../components/disclosure.md).

### Which to use

Keep the rest at the depth that fits it: in the page, over it, or on a page of its own.

| Component         | Depth   | Use for                                               |
| ----------------- | ------- | ----------------------------------------------------- |
| Disclosure        | Inline  | Optional settings or guidance below a summary.        |
| Accordion         | Inline  | Sections of one topic, such as questions and answers. |
| Show all          | Inline  | The rest of a long list.                              |
| Popover           | Overlay | An explanation or a small form, opened on a press.    |
| Menu              | Overlay | Actions used less often.                              |
| Sheet             | Overlay | The details of an item, beside the list it came from. |
| Dialog            | Overlay | A focused task that blocks the page until it ends.    |
| A page of its own | Page    | Everything about one thing, through a link.           |

### One step away

Keep the rest one step away at most: no disclosure in a disclosure, and no menu in a popover in a sheet.

### Content

Label a disclosure with what it holds, "Advanced options", and say how much more there is.

- Say "Show all 12", not "Show more".
- Name an overflow menu "More actions", or "More actions for Launch brief" in a row.

## Accessibility

### Focus and keyboard

A Disclosure's summary is a button; <kbd>Enter</kbd> or <kbd>Space</kbd> opens it, and focus stays.

- Show all keeps focus as the list grows.
- A Sheet, Menu or Popover moves focus in as it opens and back to its trigger as it closes.

### envUI provides

- Disclosure on native `details` and `summary`, whose closed content is hidden from assistive technology.
- Focus moved in, trapped while modal and returned by Sheet and Dialog; the menu button pattern for Menu.

### You provide

- A name for every icon-only trigger, and `aria-expanded` and `aria-controls` on a Show all button.

## Compose

### Usage

A Disclosure takes its summary as `title` and holds the optional settings.

- Control it with `open` and `onOpenChange` where the application opens it, or start it open with `defaultOpen`.
- Open it from the application when it holds an invalid field, as the Disclosure page describes.

```tsx source=AdvancedOptions

```

#### Show all

A text Button after the list, with `aria-expanded` and `aria-controls` naming the list, toggles between the first few items and all of them, and keeps focus as the list grows.

```tsx
<Button
  variant="text"
  aria-expanded={expanded}
  aria-controls={listId}
  onClick={() => setExpanded((current) => !current)}
>
  {expanded ? 'Show fewer' : `Show all ${activity.length}`}
</Button>
```

#### Details in a sheet

A row's text Button, with `aria-haspopup="dialog"`, opens a Sheet controlled through `open` and `onOpenChange`, with the item's details, such as a stacked DescriptionList, and an `actions` link to its own page. Keep the shown item while the sheet closes, so its content doesn't empty as it slides out.

```tsx
<Sheet
  open={open}
  onOpenChange={setOpen}
  title={project.name}
  closeLabel="Close details"
  actions={<Button href={`/projects/${project.id}`}>Open project</Button>}
>
  <DescriptionList.Root layout="stacked">{details}</DescriptionList.Root>
</Sheet>
```

#### Overflow actions

A Menu named by `aria-label` takes a ghost IconButton with IconMoreVert and `aria-label="More actions"` as its `trigger`, wrapped in a Tooltip that names it. A `Menu.Separator` sets a destructive item apart, last, as on Menu.

```tsx
<Menu.Root
  aria-label="Launch brief actions"
  trigger={
    <Tooltip content="More actions">
      <IconButton variant="ghost" icon={<IconMoreVert />} aria-label="More actions" />
    </Tooltip>
  }
>
  <Menu.Item icon={<IconFileCopy />}>Duplicate</Menu.Item>
  <Menu.Separator />
  <Menu.Item icon={<IconArchive />}>Archive</Menu.Item>
</Menu.Root>
```

#### Explain a term

A Popover with `side="bottom"` opens from an IconButton named for the term, such as `aria-label="About billable hours"`, and holds a short definition and a Link.

### Composition

The anatomy's parts are the visible layer, here a TextField's `env-text-field`, the Disclosure's summary, `env-disclosure summary`, its panel, `env-disclosure-panel`, and the More actions trigger, `env-button ~ env-button`.
