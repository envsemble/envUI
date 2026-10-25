---
title: Card
summary: A rounded surface that groups content about one subject, as a content card with a title and actions, or one link or button.
status: stable
since: 0.1.0
category: App frame & layout
aliases:
  - tile
  - panel
  - content card
  - clickable card
  - link card
  - button card
  - action card
  - ClickableCard
  - ActionCard
  - FeatureCard
  - feature card
  - feature layout
  - layout="feature"
  - call to action card
  - promo card
  - onboarding card
useWhen:
  - Content about one subject, such as a project's summary
  - A summary with its own actions, such as Share and Open
  - A whole surface that leads to one place or starts one action
  - Introducing a feature with the one action that starts it, such as inviting the team
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
    see: empty-states
  - text: Content that needs no surface of its own, such as a form on a page.
    use: Column
components:
  - Card
examples:
  ProjectSummary: overview
  ActionStrip: example
  Destinations: example
  StartOptions: example
  ImportPlans: example
  Backgrounds: variants
  CardAnatomy: anatomy
  InviteFeature: example
  OneCardSections:
    role: do
    caption: One card per subject, with Text for its parts.
  NestedCards:
    role: dont
    caption: 'Cards inside cards: the fills and corners stack up.'
---

# Card

## Variants

### Content card

The default: a title, a short fact beside it, a description, its content, and actions in a strip along the bottom.

```tsx figure=ActionStrip

```

### Link card

The whole card is one link.

```tsx figure=Destinations

```

### Button card

The whole card is one button.

```tsx figure=StartOptions

```

### Feature card

An icon, a heading, a sentence and the one button that starts a feature.

- The heading names the feature.
- The sentence says what it gives people.
- The button starts it with a verb, such as Invite people.

```tsx figure=ImportPlans

```

### Backgrounds

```tsx figure=Backgrounds

```

1. **Muted**
2. **Default**
3. **Page**

| Background | Use for                                         |
| ---------- | ----------------------------------------------- |
| Muted      | A card on the page or in a pane. The default.   |
| Default    | A quieter fill, such as a settings section.     |
| Page       | The page's own color, set apart by its corners. |

## Anatomy

```tsx figure=CardAnatomy

```

1. **Surface** (`env-card`)
2. **Header** (`env-card-header`)
3. **Title** (`env-card-heading`, `title`)
4. **Meta** (`env-card-meta`, `meta`)
5. **Description** (`env-card-description`, `description`)
6. **Content** (`env-card-body > env-text:last-child`, `children`)
7. **Actions** (`env-card-footer`, `actions`)

## Behaviour

### Loading

While its content loads, a card can show as its own skeleton, as [Loading](../patterns/loading.md) shows.

### Adapting to width

A card fills its container.

- In a narrow feature card, the button moves below the text.

```tsx figure=InviteFeature widths="24 40"

```

## Rules

One card holds one subject, and lays out its parts inside it.

```tsx figure=OneCardSections

```

```tsx figure=NestedCards

```

### Content

Put the fact that matters most for choosing beside the title.

- Start a link card with its destination's name.
- A link or button card holds no links or controls of its own.

## Accessibility

### Keyboard

| Key                                             | Action                                          |
| ----------------------------------------------- | ----------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to a link or button card, or into a card. |
| <kbd>Enter</kbd>                                | Follows a link card or presses a button card.   |
| <kbd>Space</kbd>                                | Presses a button card.                          |

### envUI provides

- Native `<a>` and `<button>` for link and button cards, named by their text.
- The title as an `h3`, or the level of `headingLevel`.
- A focus outline, and `aria-disabled` on a disabled link card.

### You provide

- A `headingLevel` that fits the page's outline.
- `render={<article />}` for a card that stands on its own.
- No `aria-label` that leaves out the card's visible text.
- Routing behind `href`, through `LinkProvider`.

## Compose

### Usage

A content card takes its `title`, a `meta` fact at the end of the title row, a `description` under it, its content as `children`, and `actions` in a strip along the bottom.

- Set `render={<article />}` on a card that stands on its own.

```tsx source=ActionStrip

```

#### Link and button cards

With `href`, the whole card is one native link, through the application's router link from `LinkProvider`; with `onClick`, it is one native button.

- Either holds only phrasing content, such as spans, and no links or controls of its own, and its text names it.
- `disabled` turns either off.

```tsx
<Card href="/projects/northwind">
  <Text render={<span />} variant="title">
    Northwind launch
  </Text>
  <Text render={<span />} emphasis="muted">
    12 open tasks
  </Text>
</Card>
```

#### Feature card

A feature card is a Card holding a Row with `wrap` and `align="center"`: the icon in a muted Text with `render={<span />}`, a Column of a headline Text and a `body-sm` Text, and the Button that starts the feature.

- The Column takes `flex: '1 1 16rem'`, so the text keeps at least 16 rem and the button wraps below it in a narrower card.
- Render the heading at the level the outline needs, such as `render={<h3 />}` under a section's `h2`; `variant="headline"` keeps its look.
- The Button takes `href` where the action goes somewhere.
- Lay several side by side in a Grid of even columns.

```tsx
<Card>
  <Row wrap align="center" gap={4}>
    <Text render={<span />} emphasis="muted">
      <UploadFile width="1.5rem" height="1.5rem" />
    </Text>
    <Column gap={1} style={{ flex: '1 1 16rem' }}>
      <Text render={<h3 />} variant="headline">
        Import your plans
      </Text>
      <Text variant="body-sm">Bring in spreadsheets and documents from another tool.</Text>
    </Column>
    <Button variant="secondary">Import</Button>
  </Row>
</Card>
```

#### Backgrounds

`background` is `muted`, the default, `default` or `page`.

```tsx
<Card background="default" title="Notifications">
  <Text emphasis="muted">Email for mentions and a weekly summary.</Text>
</Card>
```

#### Loading

`skeleton` shows the card as its own skeleton until its content arrives: text becomes bars and controls filled shapes.

- Render the same cards over placeholder items, from `placeholders`.
- A `title` or `description` given as undefined is a bar of its usual length.

```tsx
<Grid columns={2} gap={4}>
  {(members ?? placeholders<Member>(2)).map((member) => (
    <Card key={member.id} skeleton={!members} title={member.name} description={member.role} />
  ))}
</Grid>
```

### Composition

The title is an `h3`; set `headingLevel` to fit the page's outline, and its type stays the title type.

- Lay out the content with Text, Row and Column, one card per subject, never a card inside a card, and put cards side by side in a Grid.
- A card fills its container's width.
- The parts are the surface, `env-card`, its header, `env-card-header`, with the title, `env-card-heading`, and the meta, `env-card-meta`; the description, `env-card-description`; the body, `env-card-body`; and the actions, `env-card-footer`.
- A feature card's parts are envUI's own components inside it: its icon, `env-card env-text > svg`, its heading, `env-card env-text[data-variant='headline']`, its sentence, `env-card env-text[data-variant='body-sm']`, and its action, `env-card env-button`.

### Customize

`--env-card-container`, `--env-card-content` and `--env-card-outline` set the colors of one Card, through `style` or CSS.

- Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.
- `padding` sets the inset as a step of the spacing scale, such as `6` for 2 rem, and `0` removes it.

```tsx
<Card
  title="Northwind launch"
  padding={6}
  style={{ '--env-card-container': 'var(--env-color-bg-brand-muted)' } as CSSProperties}
/>
```

## Changelog

- **1.0.0-prerelease.3**: The feature cards pattern is the feature card on this page, which the pattern's address opens.
- **1.0.0**: ClickableCard, ActionCard and FeatureCard are Card: `onClick` makes a button card, `render` the element of a content card, and the feature card is a Card holding a Row of Text and a Button, as [Feature card](#feature-card) shows, in place of `layout` and `icon`, with `env-card-layout` and `env-card-icon`. `tone` is `background`, `heading` is `title`, which takes `headingLevel`, and Card takes `description`; the native `title` attribute is not a prop of a card. The page is `card`, after the component.
- **0.5.0**: `meta` sits at the end of the heading row, also in right-to-left text.
- **0.2.0**: Link cards render through the application's router link, from `LinkProvider`.
- **0.1.0**: Card for plain, interactive and action-strip cards, with ClickableCard and ActionCard as wrappers; FeatureCard.
