# Customize and extend

Make envUI the application's own without copying its styles: give one element colors of its own or recolor a whole area, compose components into product components, and adjust a component's parts where its props don't reach. Props come first; set no color and no part style, and every component looks as its theme draws it.

## Color one element

Each component has a few public color properties, named `--env-<component>-<role>`, which the application sets on one instance through `style` or its CSS: on the component's root, or, for a collection's rows and destinations, on each item, as their properties take the item's name, such as `--env-menu-item-container`. Its page in the Docs lists them. They don't inherit, so set them on the element itself, or through a selector that matches it, such as `.my-toolbar .env-button`: set on a toolbar, `--env-button-container` colors none of its buttons, and the menu ignores an item's.

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

## Motion

Every component moves with six system tokens, its loops included, such as a spinner's turn and a skeleton's pulse, which last a multiple of the slow duration. Set them to tune envUI's motion, and use them in the application's own:

| Token                          | Value                             | For                                                                                    |
| ------------------------------ | --------------------------------- | -------------------------------------------------------------------------------------- |
| `--env-motion-duration-fast`   | `0.12s`                           | A small change, such as a state layer or a color under the pointer, and a part leaving |
| `--env-motion-duration-medium` | `0.16s`                           | A part that opens, moves or fades in, such as a popup or a field's floating label      |
| `--env-motion-duration-slow`   | `0.24s`                           | A larger movement, such as a sheet sliding in or a dialog's backdrop                   |
| `--env-motion-ease`            | `cubic-bezier(0.45, 0, 0.2, 1)`   | A change on screen, which speeds up and then settles                                   |
| `--env-motion-ease-enter`      | `cubic-bezier(0.05, 0.7, 0.1, 1)` | A part entering, which decelerates into place                                          |
| `--env-motion-ease-exit`       | `cubic-bezier(0.4, 0, 1, 1)`      | A part leaving, which accelerates away                                                 |

### Switch motion off

Durations of `0s` switch off every component's motion, the motion it runs from script included: parts appear, move and leave at once, and loops stand still. Set them on `.env-theme`, outside cascade layers, so every Theme takes them, the ones envUI's popups render in too:

```css
.env-theme {
  --env-motion-duration-fast: 0s;
  --env-motion-duration-medium: 0s;
  --env-motion-duration-slow: 0s;
}
```

- **Slower or quicker.** Longer or shorter durations change all of envUI's motion in proportion.
- **Reduced motion is built in.** Under `prefers-reduced-motion: reduce`, components keep only fades, a spinner turns slowly and a skeleton pulses gently, without these settings.

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

Props come first. Where CSS must adjust a component, it targets its parts, `env-<component>-<part>` such as `.env-card-header`, and its `data-*` states, such as `[data-tone='danger']`, without extra specificity, through the [cascade layers](#cascade-layers). Part classes, states and color properties are public and versioned, and so are the few other custom properties `docs/generated/parts.json` lists under `properties`, such as `--env-popup-opacity`, which an application sets, or `--env-scaffold-sticky-top`, which it reads; `parts.json` lists them all.

```css
@layer app {
  .project-card .env-card-header {
    align-items: baseline;
  }
}
```

Set system tokens, such as `--env-space-4`, to change what every component takes from them. Component tokens, such as `--env-card-padding`, are each component's own and may change in any release: don't set or read them.

## Cascade layers

envUI's styles sit in the `env` cascade layer, so CSS outside layers overrides them whatever its specificity, without `!important`. That cuts both ways:

- **Resets and element rules.** A rule outside layers, such as `* { margin: 0 }` or `button { border: 0 }`, or a utility framework's preflight, restyles envUI's components too. Put resets in a layer before `env` and the application's own styles after it. Declare the order once, in a style sheet the client entry imports before any component, so `env` takes its place in it:

  ```css
  @layer reset, env, app;
  ```

  A framework with layers of its own takes its place in the same statement, its base before `env`: `@layer reset, base, env, components, utilities, app;`.

- **Token overrides.** A token set on `.env-theme` outside layers wins in every theme: a color set there applies in dark and at high contrast too, and can break the contrast the themes are checked for. Override a token per theme and contrast, with the themes' selectors, in this order:

  ```css
  .env-theme {
    --env-color-fg-link: #0b57d0;
  }
  .env-theme[data-env-theme='dark'] {
    --env-color-fg-link: #a8c7fa;
  }
  .env-theme[data-env-contrast='high'] {
    --env-color-fg-link: #0842a0;
  }
  .env-theme[data-env-theme='dark'][data-env-contrast='high'] {
    --env-color-fg-link: #d3e3fd;
  }
  /* Under the system's prefers-contrast: more, high contrast applies to a boundary that sets no
     data-env-contrast too, unless it opts out with 'standard'. */
  @media (prefers-contrast: more) {
    .env-theme:not([data-env-contrast='standard']) {
      --env-color-fg-link: #0842a0;
    }
    .env-theme[data-env-theme='dark']:not([data-env-contrast='standard']) {
      --env-color-fg-link: #d3e3fd;
    }
  }
  ```

- **`!important`.** envUI declares nothing `!important`, so an important declaration of the application's wins as its other rules do.

## When envUI lacks it

What every application needs, a control's look or interaction, belongs in envUI as a variant, slot or component, built on its primitives and tokens; don't copy a component's styles into the application.
