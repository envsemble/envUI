---
title: Colors & themes
summary: Colors named by their role, so every screen works in light, dark and high contrast.
aliases:
  - dark mode
  - dark theme
  - light mode
  - color scheme
  - high contrast
  - contrast
avoidWhen:
  - text: A plain pane in the surface colors.
    use: Surface
  - text: The main action in the accent, or a danger action.
    use: Button
  - text: Navigation whose selected place takes the selected color.
    use: Drawer
  - text: Letting people pick a color of their own.
    use: ColorPicker
  - text: A short status in its tone, with words.
    use: Badge
  - text: Contrast, forced colors and what every component does for people.
    see: accessibility
examples:
  Roles: example
  Swatches: example
  Themes: example
  Status: example
  OwnColors: example
---

# Colors & themes

## Options

### Colors are roles

envUI never colors a screen by hand. Each part takes a role, such as the page, a surface or supporting text, and the theme gives every role its color.

- So a screen looks right in light, dark and high contrast at once.

```tsx figure=Roles

```

1. **Page**: The background behind everything.
2. **Surface**: Panes, dialogs and menus that sit on the page.
3. **Filled card**: A soft fill for a card or a group inside a surface.
4. **Text**: Headings and the main words.
5. **Supporting text**: Details, captions and hints, a step quieter.
6. **Accent**: The main action, links and what is selected.
7. **Status**: Success, warning, danger and done, always with words.

### Every role in this theme

Each role in the theme you are reading in; a status shows its text, soft fill and solid fill.

- Switch the theme in the Display menu to see the others.

```tsx figure=Swatches

```

1. **Surfaces**: Page, Surface, Filled surface, Raised surface, Field, Backdrop.
2. **Text and lines**: Text, Supporting text, Link, Edges, Hairlines, Focus ring.
3. **Actions and selection**: Accent, On the accent, Quiet action, Important, Selected, On the selected.
4. **Status**: Neutral, Accent, Success, Warning, Danger, Done.

### Light, dark and high contrast

Every role has a color in the light and the dark theme, and a high-contrast version of each, with stronger text and edges.

- People choose, or the app follows their system, and every screen follows without changes.

```tsx figure=Themes

```

1. **Light**
2. **Dark**
3. **Light, high contrast**
4. **Dark, high contrast**

### Try it on this site

Choose a theme and a contrast in the Display menu, at the top of the page, and every page and example here follows.

### What each color means

A tone means the same on every component, on badges, alerts, buttons, toasts and charts alike.

```tsx figure=Status

```

| Tone    | Use for                                                  |
| ------- | -------------------------------------------------------- |
| Neutral | No particular state, such as archived, and most actions. |
| Accent  | The main action, and the current or highlighted state.   |
| Info    | Something to know, neither good nor bad, such as a tip.  |
| Success | Healthy, ready or saved.                                 |
| Warning | Needs attention soon.                                    |
| Danger  | Failed, or an action that destroys something.            |
| Done    | Completed work.                                          |

### Colors of its own

Where a screen needs a color the roles don't give, most components, such as buttons, fields, cards, badges, alerts, menus and navigation, can take colors of their own, and one area can take the other theme.

- A button in a brand color keeps its hover and press, made from its own color, and its label stays readable in every state.
- An area in the other theme, such as a dark banner on a light page, brings all its roles along.

```tsx figure=OwnColors

```

## Rules

A tone always comes with words or an icon, so nobody has to tell colors apart.

## Words to use

Ask an agent for color in these words; envUI turns each into a role, so the result works in every theme.

| Words              | In code                                                                                                                                                                                                                                                                                                               | Use for                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| A quieter surface  | `background="page"` on a Surface or Card, so it parts from the page by space rather than a fill                                                                                                                                                                                                                       | A fill closer to the page, so a panel draws less attention.      |
| A filled card      | `--env-color-bg-muted`: a Card's fill, `background="muted"`, and tab rails                                                                                                                                                                                                                                            | A card with the soft fill, for a group inside a surface.         |
| Supporting text    | `--env-color-fg-muted`: `emphasis="muted"` on Text, captions, hints and icons                                                                                                                                                                                                                                         | Quieter text for details, captions and hints.                    |
| The accent         | `--env-color-bg-brand-emphasis`, the primary button's fill; `--env-color-fg-accent` and `fg-link` in text                                                                                                                                                                                                             | The color of the main action, links and what is selected.        |
| Success or warning | `tone` on Badge, Alert, Toast, Button and the components that take one: Badge takes neutral, accent, success, warning, danger and done; Alert info, success, warning and danger; Toast neutral, info, success and danger; Button neutral, accent and danger. In your own CSS, `--env-color-fg-{tone}` and their tints | A tone that says how something stands, with words or an icon.    |
| A danger button    | `tone="danger"` on Button                                                                                                                                                                                                                                                                                             | A red action for deleting or anything that can’t be undone.      |
| Its own color      | The component's color properties, such as `--env-button-container`; most components have them, listed on each one's page in the Docs under Color properties; see [Customize and extend](../customizing.md)                                                                                                            | One element in a color of its own, keeping its hover and press.  |
| A dark area        | A nested `<Theme theme="dark">`, or `light` on a dark page                                                                                                                                                                                                                                                            | One part of a light page in the dark theme, or the other way.    |
| High contrast      | `contrast="high"` on Theme, or `system`, the default, which follows the reader's system                                                                                                                                                                                                                               | Stronger text and edges for people who need them, on every page. |

## Compose

### Usage

```tsx
import { Theme, Text, useTheme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

function ThemeLabel() {
  const { theme, contrast } = useTheme();
  return (
    <Text>
      Current theme: {theme}, {contrast} contrast
    </Text>
  );
}

<Theme theme="dark" contrast="high">
  <ThemeLabel />
</Theme>;
```

| Name                    | Takes                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Theme theme             | Required: light or dark; scopes the tokens and provides the theme to React                                                                                   |
| Theme contrast          | `high`; `standard`, even when the system asks for more; or `system`, the default, which follows `prefers-contrast: more`; inherited from the enclosing Theme |
| Theme scale             | comfortable or compact, the app's [scale](spacing.md); inherited from the enclosing Theme                                                                    |
| useTheme()              | `{ theme, contrast, scale }` of the nearest Theme, also across envUI's portals                                                                               |
| ThemePreferenceProvider | Stores the preference, follows the system and other windows, and themes the document root; see [setup](../setup.md)                                          |
| useThemePreference()    | `preference` (light, dark or system), the resolved `theme`, `setPreference` and `toggleTheme`                                                                |
| ThemeToggle             | An IconButton that switches between light and dark                                                                                                           |

#### The words of the figures

The Design tokens page of the Docs lists every value in each theme, and this guide ends with the palette, which shows each role's value in the theme you are reading in and lets you try another.

- **Page**: `--env-color-bg-page`, the document's background.
- **Surface**: `--env-color-bg-default`: Surface's `background="default"`, dialogs, menus and popups.
- **Text**: `--env-color-fg-default`, Text's default.
- **Edges**: `--env-color-border-default`, the outline of fields and outline buttons.
- **Selected**: `--env-color-bg-selected` with `--env-color-fg-on-selected`.

#### Status tones

Status icons, short status text and badges share these tokens, at least 4.5:1 on the page, surfaces and rows in both themes, and 7:1 at high contrast.

| Token                            | Meaning                                         |
| -------------------------------- | ----------------------------------------------- |
| `--env-color-fg-muted`           | No particular state, such as archived           |
| `--env-color-fg-accent`          | The current or highlighted state                |
| `--env-color-fg-success`         | Healthy or ready                                |
| `--env-color-fg-warning`         | Needs attention                                 |
| `--env-color-fg-danger`          | Failed or destructive                           |
| `--env-color-fg-done`            | Completed work                                  |
| `--env-color-bg-{tone}-muted`    | The tone's tint behind badges and alerts        |
| `--env-color-bg-{tone}-emphasis` | A solid fill in the tone, with `fg-on-emphasis` |

```css
.work-status[data-status='blocked'] {
  color: var(--env-color-fg-warning);
}
```

### Composition

#### Semantic tokens

Tokens are named `--env-color-{bg|fg|border}-{role}[-{emphasis}][-{state}]`, emphasis weakest first: `subtle`, `muted`, none, `emphasis` and `strong`. Every `fg-on-X` pairs with a `bg-X`, every state token has its resting token, and the contrast gate measures every pair a component paints, in all four themes.

- **Backgrounds:** `bg-page`; `bg-default`, `bg-muted` and `bg-raised`, the surfaces; `bg-popup`, `bg-field`, `bg-selected`; `bg-overlay`, the scrim behind dialogs.
- **Fills:** `bg-neutral-muted`, a translucent layer of the text color under secondary buttons, chips, switch tracks and skeletons; `bg-neutral-subtle`, the state layer of controls without a fill; `emphasis` and `strong` solid fills.
- **Text:** `fg-default`, `fg-muted` for supporting text and icons, `fg-control`, `fg-link`, `fg-on-selected`, and one per tone.
- **Borders:** `border-default`, the only boundary of a control, at least 3:1; `border-muted` for the hairlines between a list's items, quote bars and other decorative edges; `border-focus`; `border-media`, the inner edge of images.

The colors come from an internal palette of ten hues, and the pastel hues of avatars, in grades from 0 to 100, where the grade difference alone sets the contrast: 50 grades apart give at least 4.5:1. The 0.7 names are gone; the [migration guide](../migration.md#tokens) lists what replaces each.

#### States and contrast

- **Hover and pressed** are tokens of their own, other grades of the same hue, so labels keep their contrast in every state. A component given colors of its own through its color properties draws its states as state layers instead: the content color over the container at `--env-state-hover-opacity`, `--env-state-focus-opacity` and `--env-state-pressed-opacity`.
- **Selection** stays apart from every other item, at rest and under the pointer, and carries a second cue: its label color, a check or a bar.
- **High contrast** moves text to 7:1 and boundaries, indicators and focus rings to 4.5:1. A nested Theme and envUI's popups take the contrast and theme of where they open.
- **Elevation** 0–3 is an edge, not a shadow: envUI draws no shadows, so a floating layer separates by its background and its edge, and a modal by its scrim as well. Popups float at 2, dialogs, sheets and the command palette at 3.
- **Hairlines separate a list's items, never regions:** Markdown rules, menu separators, table rows and accordion items take a hairline across their container's full width, never inset from its edges. Regions, such as a top bar, a footer, a sticky header, a tab bar and two panes, separate by space and background instead; controls and floating layers keep their edges.
- **Forced colors** take system colors, such as `Highlight` and `GrayText`, for every state a fill carried.

#### Guidelines

- Choose the role for what an element is, not the color it should have: `fg-muted` for any supporting text, `border-muted` for the line between a list's items. Separate regions by space or a background, not a line.
- Use one role in both themes; the themes give it its grade.
- Disabled controls take 0.48 opacity, which WCAG exempts from contrast.
- Wrap the application's own portal content in `<Theme {...useTheme()}>`, so it takes the theme and contrast of where it opens.

### Customize

Each component has public color properties, such as `--env-button-container`, for colors of its own on one instance, and a nested Theme that overrides the semantic tokens recolors a whole area. [Customize and extend](../customizing.md) describes both.

TypeScript declarations provide the complete public API.
