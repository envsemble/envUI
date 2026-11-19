---
title: Icons
summary: Thousands of Material Symbols, sized by their component, outlined or filled.
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
  - text: Names and announcements for everything people can use.
    see: accessibility
examples:
  OutlinedAndFilled: example
  Catalogue: example
  FollowText: example
---

# Icons

## Options

Thousands of Material Symbols, each outlined or filled. Navigation fills the icon of the selected place.

```tsx figure=OutlinedAndFilled

```

```tsx figure=Catalogue

```

## Behaviour

An icon takes the color of the text around it, and the size that the component around it sets for its icons.

```tsx figure=FollowText

```

## Rules

An icon beside a label is silent to screen readers; one that stands alone, such as an icon button's, needs a name. envUI ships no logos: show the application's own marks and icons with [Graphic](../components/graphic.md).

## Compose

### Usage

Import each icon by its own path, `Icon<Name>` from `@envsemble/envui/icons/<Name>`. An icon is `--env-icon-size` square; set it on an element of your own to size the icons inside.

```tsx
import { Button } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconHome } from '@envsemble/envui/icons/Home';

<>
  <IconHome filled label="Home" />
  <Button start={<IconAdd />}>Create project</Button>
</>;
```

The symbols are Material Design's [Material Symbols](https://m3.material.io/styles/icons), in their Rounded style, under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0); the package carries the license and its notice.

### Customize

Values at the default 16 px root.

#### Icon sizes

| Token                | Comfortable | Compact    | Use                                                                                                                                                                                                                                       |
| -------------------- | ----------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env-icon-size`    | `1rem`      | `1rem`     | The size of the icons here, which content lines up with: the control icon size, 1 rem, at the root; a component that sizes its icons, such as a button, a navigation item or a list row, sets it on its own element for the icons inside. |
| `--env-icon-size-lg` | `1.25rem`   | `1.125rem` | A leading icon in a large row, such as a list item's.                                                                                                                                                                                     |
| `--env-icon-size-md` | `1.125rem`  | `1rem`     | An icon beside body text, such as in a tree or a select trigger.                                                                                                                                                                          |
| `--env-icon-size-sm` | `1rem`      | `1rem`     | A small icon, such as inside a control: the control's icon size, 1 rem.                                                                                                                                                                   |
