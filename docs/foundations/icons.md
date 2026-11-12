---
title: Icons
summary: Thousands of Material Symbols that follow their text, outlined or filled.
components:
  - Icon
aliases:
  - icon
  - Material Symbols
  - symbol
  - logo
avoidWhen:
  - text: A button that is only an icon, with a name of its own.
    use: IconButton
  - text: Navigation that fills the icon of the place that is selected.
    use: NavigationDrawer
  - text: Views whose selected tab fills its icon.
    use: Tabs
  - text: Names and announcements for everything people can use.
    see: accessibility
examples:
  OutlinedAndFilled: example
  Catalogue: example
  FollowText: example
---

# Icons

## Options

### Outlined and filled

Every icon comes in two forms: outlined, the usual form, light beside text, and filled, for what is selected or an icon that stands alone.

- Navigation and tabs fill the icon of the place that is selected, so it stands out from the rest.

```tsx figure=OutlinedAndFilled

```

### Every icon

Thousands of icons come with envUI: search them by name, switch to filled, and choose one to see how to use it.

```tsx figure=Catalogue

```

## Behaviour

### Icons follow their text

An icon takes the color and the size of the words around it, so in a button, a menu or a message it always matches its label, in every theme.

```tsx figure=FollowText

```

## Rules

An icon beside a label adds nothing for a screen reader, so it stays silent.

- An icon that stands alone, such as a button that is only an icon, gets a name of its own.

### Logos and own icons

envUI comes with no logos. Show the application's logo, and an icon envUI doesn't have, with [Graphic](../components/graphic.md): it takes the same sizes and slots as envUI's icons.

## Words to use

Ask an agent for icons in these words, and name the icon you chose from the list above.

| Words                    | In code                                                                      | Use for                                                                         |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| An icon button           | IconButton with the icon and an `aria-label`                                 | A button that is only an icon, with a name that screen readers say.             |
| An icon before the label | `startIcon` on Button or a field, `icon` on a menu item                      | An icon at the start of a button or a menu item.                                |
| A filled icon            | `filled` on the symbol; navigation and tabs fill the selected one themselves | The filled form, for what is selected or stands alone.                          |
| Our own logo or icon     | `Graphic`, with the file in `src` or the SVG component as its children       | The app's own mark or an icon envUI lacks, at envUI's sizes.                    |
| The icon's name          | Its import, such as `IconSettings` from `@envsemble/envui/icons/Settings`    | The icon you chose from the list, such as Settings, so the agent uses that one. |

## Compose

### Usage

```tsx
import { Button, Column } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconHome } from '@envsemble/envui/icons/Home';

<Column gap={4}>
  <IconHome filled label="Home" />
  <Button startIcon={<IconAdd />}>Create project</Button>
</Column>;
```

| Name     | Takes                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Symbols  | Material Symbols Rounded, bundled and imported one by one: `Icon<Name>` from `@envsemble/envui/icons/<Name>`                             |
| `filled` | The filled form of a standalone symbol; navigation and tabs fill the selected one themselves                                             |
| `label`  | The accessible name of a meaningful standalone icon; leave it out for decoration                                                         |
| `tone`   | A status tone's text color, `--env-color-fg-{tone}`, such as `success` for a step that is done; `neutral`, the default, keeps the text's |
| `Icon`   | The SVG that envUI's symbols render: `currentColor`, 1 em, and hidden unless labelled                                                    |
| Your own | A logo or an icon of the application's own: `Graphic`, which every icon slot sizes like a symbol                                         |

#### The words of the figures

- **Icons follow their text**: nothing to do; a symbol takes `currentColor` and the size its control or text gives it.
- **A name when it stands alone**: `label` on a meaningful standalone symbol; without it the icon is hidden from assistive technology.

### Composition

- Copy an icon's import from the list on the Icons page of the catalogue. Each icon has its own path, such as `@envsemble/envui/icons/Add` for `IconAdd`.
- Icons take the color of their text; `tone` gives a status icon its tone's color instead, such as the done and failed steps of a run. Decorative icons stay hidden from assistive technology; icon-only controls need an accessible name.

The symbols are Material Design's [Material Symbols](https://m3.material.io/styles/icons), in their Rounded style, under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0); the package carries the license and its notice.

TypeScript declarations provide the complete public API.
