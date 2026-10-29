# Customize and extend

Make envUI the application's own without copying its styles: give one element colors of its own or recolor a whole area, compose components into product components, and adjust a component's parts where its props don't reach. Props come first; set no color and no part style, and every component looks as its theme draws it.

## Color one element

Each component has a few public color properties, named `--env-<component>-<role>`, which the application sets on one instance through `style` or its CSS: on the component's root, or, for a collection's rows and destinations, on each item, as their properties take the item's name, such as `--env-menu-item-container`. They don't inherit, so the menu itself ignores an item's:

```tsx
import type { CSSProperties } from 'react';
import { Button } from '@envsemble/envui';

const forest = {
  '--env-button-container': '#0a5c42',
  '--env-button-content': '#ffffff',
} as CSSProperties;

<Button variant="primary" style={forest}>
  Start trial
</Button>;
```

```css
.release-notes .env-alert {
  --env-alert-container: #fdf4e3;
  --env-alert-outline: #e7c48a;
}
```

Colors set this way stay the same in every theme, the high-contrast ones too, so choose a content color with at least 7:1 on its container, as the green above has with white.

The roles are the same across components:

- **container**: the fill behind the content, such as a button's, a row's or a tooltip's.
- **content**: the label, text or icons on the container, and the color of its state layers.
- **outline**: the edge, where the component draws one.
- **icon**: an icon with a color of its own, such as an alert's or a menu item's leading icon.
- **selected** and **selected-content**: the fill and content of what is chosen, current or on: a selected row, the current destination, a checked box, an on switch, a pressed toggle.
- **indicator**: the part that shows the value or the focus, such as a slider's fill, a selected tab's indicator or a field's focused edge.

The properties don't inherit: each is registered with `@property` as a property that doesn't inherit, so set them on the element itself, through its `style` or a selector that matches it, such as `.my-toolbar .env-button`. Set on a toolbar, `--env-button-container` colors none of its buttons, and a surface inside a recolored surface keeps its own color.

Each component's page lists its color properties under Anatomy, and `docs/generated/parts.json` lists them with the parts, with what each colors. Like the part classes and state attributes, they are public and versioned. So are the few other custom properties it lists under `properties`, such as a popup's `--env-popup-opacity`, which an application sets, or Scaffold's `--env-scaffold-sticky-top`, which it reads. The other custom properties a component declares for itself, such as `--env-card-padding`, stay private.

### Give a field a fill

Fields and editors have no fill of their own: TextField, Textarea, SearchField, Combobox, DatePicker, TimePicker, MonthPicker, MarkdownEditor, RichTextEditor, ColorPicker's fields and `Field.Control` take the background of what they sit on, the page, a card, a sheet or a dialog, in every theme. ColorPickerButton does too. To give one a fill, set its container:

```tsx
import type { CSSProperties } from 'react';
import { TextField } from '@envsemble/envui';

<TextField label="Search" style={{ '--env-text-field-container': '#f6f8fa' } as CSSProperties} />;
```

```css
/* The well of an editor's field, which it holds inside. */
.notes-editor .env-text-field {
  --env-text-field-container: #f6f8fa;
}
```

`--env-text-field-container` sets the well of TextField and Textarea, and of the fields built on them: SearchField, Combobox and the date, time and month pickers on their root, and MarkdownEditor's and RichTextEditor's field, `env-text-field`, inside them. `--env-color-picker-button-container` sets ColorPickerButton's. A control given to `Field.Control`, through `render` or not, is the application's own to style.

## States follow the colors you set

With no color property set, a component paints its designed colors in every state, from the theme's tokens. Once you set its container or its content, hover, keyboard focus and press are state layers: the content color over the container at a low opacity, so the component keeps working states without further settings. The opacities are tokens:

- `--env-state-hover-opacity`: 8%, and 6% at high contrast.
- `--env-state-focus-opacity`: 10%, and 7% at high contrast, under the focus ring.
- `--env-state-pressed-opacity`: 10%, 12% in the dark theme and 7% at high contrast.

A few layers are stronger or lighter, as the designed states beside them are: a tab that isn't selected, whose muted label makes a lighter layer, and an alert's dismiss button, in the alert's tone, are stronger; a selected item's are lighter. For what is chosen, current or on, selected and selected-content start its layers.

How the guard works: the color properties are registered with `@property` and no initial value, so unset they are invalid, and so is every value that refers to one without a fallback. Each state reads `var(<the layered fill>, <the designed token>)`, and the layered fill refers to the container or the content, so it applies only while you set one. It works in every engine, for properties set inline or in CSS, without style queries.

## Recolor an area

To recolor a whole area, such as a promotion or a section in a product's brand color, override the semantic tokens on a nested Theme. Every component inside takes them, with the hover and pressed tokens you give:

```tsx
import type { CSSProperties } from 'react';
import { Button, Switch, Theme, useTheme } from '@envsemble/envui';

const green = {
  light: {
    '--env-color-bg-primary-emphasis': '#176f35',
    '--env-color-bg-primary-emphasis-hover': '#115a2a',
    '--env-color-bg-primary-emphasis-pressed': '#0b4520',
    '--env-color-fg-on-emphasis': '#ffffff',
  },
  dark: {
    '--env-color-bg-primary-emphasis': '#7ad197',
    '--env-color-bg-primary-emphasis-hover': '#5fbf80',
    '--env-color-bg-primary-emphasis-pressed': '#45ad69',
    '--env-color-fg-on-emphasis': '#1e1f21',
  },
};

function GreenArea({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Theme theme={theme} style={green[theme] as CSSProperties}>
      {children}
    </Theme>
  );
}
```

- Give each theme its own values: a token takes another grade in the dark theme, and high contrast asks 7:1 of text.
- A popup that opens from the area, such as a menu or a select's list, renders in a portal outside it. Set the same tokens on a class of yours and pass it to the popup, or set them on the application's Theme to recolor everything.
- Override the roles, never the palette: the palette is internal and never becomes CSS.

## Contrast is yours

envUI's contrast gate measures its own tokens and the colors its components compose, in all four themes. It can't measure colors an application chooses: keep text at 4.5:1 on your container, 7:1 at high contrast, and boundaries and icons at 3:1, also on the state layers. Under forced colors, the system's colors take the place of yours.

## Compose one root

[Surface](components/surface.md) supplies fill, padding and corners; [Row](components/row.md), [Column](components/column.md) and [Grid](components/grid.md) supply layout. `render` puts both on one element, with the semantic tag on the element it supplies. A custom render component passes native props, `className`, `style`, `children` and `ref` to its root.

```tsx
import { Surface, Column, Text } from '@envsemble/envui';

export function WorkspacePane() {
  return (
    <Surface background="default" padding={5} render={<Column render={<section />} gap={4} />}>
      <Text render={<h2 />} variant="title">
        Workspace
      </Text>
      <Text>Shared plans and notes for the project.</Text>
    </Surface>
  );
}
```

## Create a product component

Wrap public components to give them product meaning, and spread the rest of the props onto them, so `id`, `aria-*`, handlers and `ref` reach the element. Card keeps its appearance and spacing.

```tsx
import { Card, type CardContentProps } from '@envsemble/envui';

type ProjectSummaryProps = Omit<
  CardContentProps,
  'title' | 'description' | 'render' | 'children'
> & {
  title: string;
  description: string;
};

export function ProjectSummary({ title, description, ...props }: ProjectSummaryProps) {
  return <Card {...props} render={<article />} title={title} description={description} />;
}
```

## Style a component's parts

Props come first. Where CSS must adjust a component, it targets its parts, `env-<component>-<part>` such as `.env-card-header`, and its `data-*` states, such as `[data-tone='danger']`. Part classes and states are public and versioned; `docs/generated/parts.json` lists them. envUI's CSS is in the `env` cascade layer, so an application's rule wins without extra specificity.

```css
@layer app {
  .project-card .env-card-header {
    align-items: baseline;
  }
}
```

Set system tokens, such as `--env-space-4`, to change what every component takes from them. Component tokens, such as `--env-card-padding`, are each component's own and may change in any release: don't set or read them.

## When envUI lacks it

What every application needs, a control's look or interaction, belongs in envUI as a variant, slot or component, built on its primitives and tokens; don't copy a component's styles into the application.
