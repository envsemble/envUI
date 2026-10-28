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
  Themes: example
  Roles: example
  Swatches: example
  Status: example
  OwnColors: example
---

# Colors & themes

## Options

### Light, dark and high contrast

People choose one, or the app follows their system.

```tsx figure=Themes

```

1. **Light**
2. **Light, high contrast**
3. **Dark**
4. **Dark, high contrast**

### Colors are roles

Each part of a screen takes a role, never a color of its own; the theme gives every role its color.

```tsx figure=Roles

```

1. **Page**
2. **Surface**
3. **Filled card**
4. **Text**
5. **Supporting text**
6. **Accent**

### Every role in this theme

A status shows its text, soft fill and solid fill. The Display menu switches the theme and contrast.

```tsx figure=Swatches

```

1. **Surfaces**: Page, Recessed surface, Surface, Filled surface, Raised surface, Field, Backdrop.
2. **Text and lines**: Text, Supporting text, Link, Edges, Hairlines, Focus ring.
3. **Actions and selection**: Accent, On the accent, Quiet action, Important, Selected, On the selected.
4. **Status**: Neutral, Accent, Success, Warning, Danger, Done.

### What each color means

A tone means the same on every component.

```tsx figure=Status

```

### Your own colors

An area can take a color scheme of its own, such as a brand's; every component in it follows, hover and press included.

```tsx figure=OwnColors

```

1. **Lavender**
2. **Mint**
3. **Peach**

## Rules

A tone always comes with words or an icon, so nobody has to tell colors apart.

## Words to use

Ask an agent for color in these words; envUI turns each into a role.

| Words              | In code                                                                                                                                                                                                                                                                                                               | Use for                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| A quieter surface  | `background="page"` on a Surface or Card, so it parts from the page by space rather than a fill                                                                                                                                                                                                                       | A panel that draws less attention.                 |
| Success or warning | `tone` on Badge, Alert, Toast, Button and the components that take one: Badge takes neutral, accent, success, warning, danger and done; Alert info, success, warning and danger; Toast neutral, info, success and danger; Button neutral, accent and danger. In your own CSS, `--env-color-fg-{tone}` and their tints | How something stands, such as saved or failed.     |
| Its own color      | The component's color properties, such as `--env-button-container`; most components have them, listed on each one's page in the Docs under Color properties; see [Customize and extend](../customizing.md)                                                                                                            | One element in a color the roles don’t give.       |
| A dark area        | A nested `<Theme theme="dark">`, or `light` on a dark page                                                                                                                                                                                                                                                            | One part of a page in the other theme.             |
| High contrast      | `contrast="high"` on Theme, or `system`, the default, which follows the reader's system                                                                                                                                                                                                                               | Stronger text and edges, for people who need them. |

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

- **Page**: `--env-color-bg-page`, the document's background, behind everything: deeper than the panes and cards on it.
- **Recessed surface**: `--env-color-bg-recessed`, a well on the page, `background="recessed"`, such as the stage of a preview: a shade deeper than the page in dark, lighter than the page and the panes in light.
- **Surface**: `--env-color-bg-default`: Surface's `background="default"`, panes, the navigation and sheets, a step lighter than the page.
- **Filled card**: `--env-color-bg-muted`: a group inside a surface, a Card's fill, `background="muted"`, list rows and tab rails, lighter than the surface: white in light.
- **Text**: `--env-color-fg-default`, Text's default, for headings and the main words.
- **Supporting text**: `--env-color-fg-muted`: `emphasis="muted"` on Text, details, captions, hints and icons.
- **Accent**: `--env-color-bg-brand-emphasis`, the main action's fill; `--env-color-fg-accent` and `fg-link` in text, such as links and what is selected.
- **Edges**: `--env-color-border-default`, the outline of fields and outline buttons.
- **Selected**: `--env-color-bg-selected` with `--env-color-fg-on-selected`.

#### Status tones

Status icons, short status text and badges share these tokens, at least 4.5:1 on the page, surfaces and rows in both themes, and 7:1 at high contrast.

| Token                            | Meaning                                                             |
| -------------------------------- | ------------------------------------------------------------------- |
| `--env-color-fg-muted`           | Neutral: no particular state, such as archived, and most actions    |
| `--env-color-fg-accent`          | Accent: what is current or highlighted                              |
| `--env-color-bg-info-strong`     | Info, an info toast's fill: something to know, neither good nor bad |
| `--env-color-fg-success`         | Success: healthy, ready or saved                                    |
| `--env-color-fg-warning`         | Warning: needs attention soon                                       |
| `--env-color-fg-danger`          | Danger: failed, or an action that destroys something                |
| `--env-color-fg-done`            | Done: completed work                                                |
| `--env-color-bg-{tone}-muted`    | The tone's tint behind badges, and behind alerts at high contrast   |
| `--env-color-bg-{tone}-emphasis` | A solid fill in the tone, with `fg-on-emphasis`                     |

```css
.work-status[data-status='blocked'] {
  color: var(--env-color-fg-warning);
}
```

### Composition

#### Semantic tokens

Tokens are named `--env-color-{bg|fg|border}-{role}[-{emphasis}][-{state}]`, emphasis weakest first: `subtle`, `muted`, none, `emphasis` and `strong`. Every `fg-on-X` pairs with a `bg-X`, every state token has its resting token, and the contrast gate measures every pair a component paints, in all four themes.

- **Backgrounds:** `bg-page`, the deepest; `bg-recessed`, a well on it; `bg-default`, `bg-muted` and `bg-raised`, the surfaces; `bg-popup`, the fill of menus, popovers and dialogs; `bg-field`, `bg-selected`; `bg-overlay`, the scrim behind dialogs.
- **Fills:** `bg-neutral-muted`, a translucent layer of the text color under secondary buttons, chips, switch tracks and skeletons; `bg-neutral-subtle`, the state layer of controls without a fill; `emphasis` and `strong` solid fills.
- **Text:** `fg-default`, `fg-muted` for supporting text and icons, `fg-control`, `fg-link`, `fg-on-selected`, and one per tone.
- **Borders:** `border-default`, the only boundary of a control, at least 3:1; `border-muted` for the hairlines between a list's items, quote bars and other decorative edges; `border-focus`; `border-media`, the inner edge of images.

The colors come from an internal palette of eleven hues, and the pastel hues of avatars, in grades from 0 to 100, where the grade difference alone sets the contrast: 50 grades apart give at least 4.5:1. The light theme takes a nearly neutral gray, the dark theme a slightly blue-tinted one. The 0.7 names are gone; the [migration guide](../migration.md#tokens) lists what replaces each.

#### States and contrast

- **Hover and pressed** are tokens of their own, other grades of the same hue, so labels keep their contrast in every state. A component given colors of its own through its color properties draws its states as state layers instead: the content color over the container at `--env-state-hover-opacity`, `--env-state-focus-opacity` and `--env-state-pressed-opacity`.
- **Selection** stays apart from every other item, at rest and under the pointer, and carries a second cue: its label color, a check or a bar.
- **High contrast** moves text to 7:1 and boundaries, indicators and focus rings to 4.5:1. A nested Theme and envUI's popups take the contrast and theme of where they open.
- **Elevation** 0–3 is an edge, not a shadow: envUI draws no shadows, so a floating layer separates by its background and its edge, and a modal by its scrim as well. The one exception is an avatar's faint shadow, which parts the avatars of a group. Popups float at 2, dialogs, sheets and the command palette at 3. A sheet keeps the navigation's fill, so navigation that opens in one looks as it does at the window's edge.
- **Hairlines separate a list's items, never regions:** Markdown rules, menu separators, table rows and accordion items take a hairline across their container's full width, never inset from its edges. Regions, such as a top bar, a footer, a sticky header, a tab bar and two panes, separate by space and background instead; controls and floating layers keep their edges.
- **Forced colors** take system colors, such as `Highlight` and `GrayText`, for every state a fill carried.

#### Guidelines

- Choose the role for what an element is, not the color it should have: `fg-muted` for any supporting text, `border-muted` for the line between a list's items. Separate regions by space or a background, not a line.
- Use one role in both themes; the themes give it its grade.
- Disabled controls take 0.48 opacity, which WCAG exempts from contrast.
- Wrap the application's own portal content in `<Theme {...useTheme()}>`, so it takes the theme and contrast of where it opens.

### Customize

Each component has public color properties, such as `--env-button-container`, for colors of its own on one instance. A nested `<Theme>` whose `style` sets the semantic tokens for each theme, such as `--env-color-bg-brand-emphasis` with its hover and pressed tokens, gives an area a color scheme of its own, such as a brand's. [Customize and extend](../customizing.md#recolor-an-area) describes both.

TypeScript declarations provide the complete public API.
