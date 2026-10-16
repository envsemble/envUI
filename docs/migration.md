# Migrate an interface to envUI

Use the [documentation index](index.md) to find only the components involved in the migration. Public declarations define the exact API for the selected release.

## Inspect the existing application

Confirm the requested scope: one screen/component, a shared component family or the whole client. Follow project instructions, discover check commands and inspect the working tree.

Identify:

- React/React DOM versions, package manager, bundler, router, rendering mode and deployment build.
- Shared UI wrappers/callers, component-library dependencies, icon loaders, fonts, CSS entry points, tokens and resets.
- Theme initialization/persistence, provider order and modal/toast/portal roots.
- Forms, validation, controlled state, native submit/reset, pending mutations, dirty drafts and errors.
- Vendor widgets requiring their own components, CSS or peer dependencies.
- Affected user journeys and responsive states.

Inspect representative source and behavior before mapping components. Matching appearance does not establish matching semantics. Preserve application logic, data contracts, authorization and persistence unless a behavior change is requested.

For broad migrations, record a compact mapping in the task or PR: existing owner → envUI composition → behavior to retain → gaps/vendor exceptions. For narrow changes, do this directly in the implementation. Do not create another permanent migration manual.

## Choose and connect the version

Use React 19 and inspect envUI's peers/exports. Upgrade framework dependencies only as required by the authorized migration. Select an exact envUI release, retain its lockfile and use matching bundled skills. Follow [setup](setup.md) for registry access, CSS, themes and entry points.

For co-development with an authorized local envUI checkout, follow [local development](local-development.md).

Connect Theme to the current preference and first-render initialization. Scope old/new styles deliberately during coexistence. Check inherited tokens/cascade on migrated controls and vendor widgets. Retain vendor theme providers and portal styling where required.

## Upgrade from envUI 0.x to 1.0

envUI 1.0 renames components, compound parts, classes and documentation pages, and makes a few helpers internal; nothing is exported under a 0.x name. The codemods and the lint packages, released with envUI at the same version, do most of the work. The codemods are meant for 0.x code, run once: code already written for 1.0 can read as 0.x to them. Commit first, as the codemods write files in place:

```sh
npx @envsemble/envui-codemods@<version> v1-names src --dry   # the files that would change, and the reports
npx @envsemble/envui-codemods@<version> v1-names src
npx @envsemble/envui-codemods@<version> v1-structure src
npx @envsemble/envui-codemods@<version> v1-render src
npx @envsemble/envui-codemods@<version> v1-props src
npx @envsemble/envui-codemods@<version> v1-classes src
```

Then install envUI 1.0, format, type-check and lint with the ESLint plugin:

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import envui from '@envsemble/eslint-plugin-envui';

export default defineConfig(envui.configs.recommended);
```

- `v1-names` rewrites imports and references from `@envsemble/envui` and `@envsemble/envui/theme-bootstrap`: renamed components and types (`Input` is `TextField`), namespace parts (`MenuItem` is `Menu.Item`, `<Menu>` is `<Menu.Root>`), `DirectionLink` by its literal `direction` (`Pager.Previous` or `Pager.Next`), re-exports, `defaultThemeStorageKey`, which becomes `'env-theme'`, and `<Theme theme={useTheme()}>`, which becomes `<Theme {...useTheme()}>`. Other `useTheme()` calls, imported by name or through a namespace import, become `useTheme().theme`, the color scheme they returned in 0.x, unless the file already reads them as `{ theme, contrast }`.
- `v1-structure` rewrites elements whose 1.0 form is another element: ActionGroup becomes a Stack, as [the vocabulary](#variants-tones-and-render) lists.
- `v1-render` turns a literal `as` into `render`, `as="h2"` into `render={<h2 />}`.
- `v1-props` moves the props that 1.0 removed, renamed or changed, as [scale and density](#scale-and-density) and [the vocabulary](#variants-tones-and-render) list them.
- `v1-classes` renames `env-*` classes and `--env-*` custom properties in style sheets, class names and selector strings, turns the modifier classes that became attributes into attribute selectors, and renames the tokens' custom properties: `--color-text-muted` becomes `--env-color-fg-muted` and `--space-4` becomes `--env-space-4`, as [tokens](#tokens) lists them. It reports a token that 1.0 removes, and a 0.7 fixed color no token replaces, with what to use instead.
- `envui/no-renamed-exports` reports the 0.x names left in imports and re-exports, and also those it can follow statically through namespace imports, `require()`, `import()`, `import … = require()`, destructuring and `createElement()`, with each one's 1.0 name or what to use instead. A name read through a computed member such as `envui[name]` is not followed; the type check catches those. The recommended config also reports raw elements that envUI provides, envUI's private classes and raw colors; `@envsemble/stylelint-config-envui` does the same for style sheets.

Change by hand what the codemods report, each with its file and line:

- removed exports: `LoadingBar` (AppShell's `loading` prop, or Progress), the manual `Toast` (`useToast()` inside `Toast.Provider`), `ToastProps` (`ToastNotification`), `getInitials`, `useLinkComponent`, `useSidebarCompact`, and the `MenuDensity` and `SurfaceDensity` types (menus have one anatomy; give controls a `size` or a Theme a `scale`);
- a `DirectionLink` whose `direction` is computed or spread, or that is used outside JSX;
- re-exports of namespace parts, and names destructured from a namespace import, `useTheme` among them;
- a `useTheme()` call that is returned, as by a hook that wraps it, or passed as the `value` of what may be a context provider, directly or through a variable: whether its readers expect the scheme or the object is out of the file's sight;
- each `require()` and `import()` of `@envsemble/envui`, which the codemods do not follow;
- a `variant`, `tone`, `corners` or Text `variant` whose value is an expression, which keeps or takes its new name and may need its values mapped; an `as` that is an expression, or beside a `render`; an ActionGroup whose `stacked` is an expression, and a child of a stacked one that is not a Button, whose width the codemod can't set;
- a modifier class in a `className`, such as `env-button-important`, which the component's props set in 1.0;
- a local that shadows a namespace or a new name: the codemod writes a second import under an alias, such as `Menu as EnvMenu`, which you may rename;
- comments the codemod drops: a `@ts-expect-error` above an import whose names change, which TypeScript would report once the 0.x name it expected an error from is gone; a disable comment of an import that is removed with nothing in its place; and comments on a removed import name that no namespace import takes the place of.

The codemods also leave class names built at run time, CSS-in-JS, selectors nested in a Sass or Less rule (a DiffCount label in a nested `.env-diff-count` rule becomes `env-diff-stat-label`), mocks and `declare module` augmentations; search for the old names there. The codemods' rename map, the folder `src/maps/v1` in `@envsemble/envui-codemods`, lists every change.

### Scale and density

1.0 sizes an interface on two axes: an app scale, `comfortable` or `compact`, set with `scale` on a Theme, and a row density on data components. Every control takes a `size`, `sm`, `md` or `lg`, with the same height for every control of that size; see [scale and density](foundations/scale.md). The per-component density props go, and `v1-props` moves them where the meaning carries over:

| 0.x                                                                | 1.0                                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `density="compact"` on Select                                      | `size="sm"`                                                             |
| `density="compact"` on Combobox and DatePicker                     | `size="sm" showLabel={false}`                                           |
| `density="standard"` on Combobox and DatePicker                    | `variant="floating"`, the tall field; without it, the control height    |
| `compact` on TextField                                             | `showLabel={false}`; the field takes the control height                 |
| `compact={false}` on TextField or SearchField                      | `variant="floating"`                                                    |
| `density` on Table.Root: `compact`, `standard`                     | `density="sm"`, `"md"` (the default)                                    |
| `density` on Tree: `compact`, `standard`                           | `"sm"` (the default), `density="md"`                                    |
| `size="compact"` on Tabs, SegmentedControl, Pagination, CopyButton | `size="sm"`                                                             |
| `compact` on DropZone                                              | `size="sm"`                                                             |
| `density` on Surface, Menu.Root, ContextMenu, Menubar.Menu         | Removed: give controls `size="sm"`, or set `scale="compact"` on a Theme |
| `size` on NavList.Item                                             | Removed: items follow the scale                                         |

The codemod reports each use it can't move, such as a value that is an expression. Fields now take the control height by default, menus and the popups of Select and Combobox have one anatomy at the scale's row height, and controls in table cells take the small height; check screens that relied on the 3.5 rem field. In style sheets, `--control-height-small` and `--icon-button-size` become `--env-control-height`, `--control-height-compact` becomes `--env-control-height-sm`, and `--scale` is gone.

### Variants, tones and render

Buttons take a `variant` for their emphasis and a `tone` for their meaning, and Text, Skeleton and Surface take the words the rest of envUI uses. `v1-props` moves each literal value, `v1-render` each literal `as` and `v1-structure` each ActionGroup:

| 0.x                                                                                                          | 1.0                                                                 |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `variant="important"` on Button, IconButton, ConfirmButton, CopyButton, DialogClose, ThemeToggle, Pagination | `variant="primary" tone="accent"`                                   |
| `variant="destructive"`                                                                                      | `variant="primary" tone="danger"`                                   |
| `variant="outlined"`, `variant="quiet"`                                                                      | `variant="outline"`, `variant="ghost"`                              |
| Text `tone`: `primary`, `muted`, `quiet`                                                                     | `emphasis`: `default`, `muted`, `subtle`                            |
| Text `variant`: `page-heading`, `section-heading`, `supporting`                                              | `headline`, `title`, `body-sm`                                      |
| Skeleton `tone`: `base`, `highlight`                                                                         | `emphasis`: `muted`, `default`                                      |
| Surface `tone`: `pane`, `row`, `canvas`, `alternate`                                                         | `background`: `default`, `muted`, `page`, `raised`                  |
| Surface `corners`: `surface`, `standard`, `pill`, `none`                                                     | `radius`: `xl`, `sm`, `full`, `none`                                |
| `as="h2"` on Text, Stack and Surface                                                                         | `render={<h2 />}`                                                   |
| `<ActionGroup align="end">`                                                                                  | `<Stack direction="row" wrap align="center" gap={4} justify="end">` |
| `<ActionGroup stacked>`                                                                                      | `<Stack gap={2}>` with `fullWidth` on each labelled Button          |
| `TextTone`, `SurfaceTone`, `SurfaceCorners`                                                                  | `TextEmphasis`, `SurfaceBackground`, `SurfaceRadius`                |
| `ActionGroup`, `ActionGroupProps`, `StackElement`, `TextElement`                                             | Removed: `Stack` and `render`                                       |

In style sheets the modifier classes become attributes on the component's root class, which `v1-classes` writes with the specificity they had: `.env-button-important` is `.env-button:where([data-variant='primary'][data-tone='accent'])`, `.env-text-tone-muted` `.env-text:where([data-emphasis='muted'])`, `.env-surface-row` `.env-surface:where([data-background='muted'])` and `.env-skeleton-highlight` `.env-skeleton:where([data-emphasis='default'])`. The icon wrapper `env-symbol` is `env-icon`. A button without a `variant` takes its container's, such as ghost in a Toolbar.

### useTheme returns the theme, its contrast and its scale

`useTheme()` returns `{ theme, contrast, scale }` instead of the color scheme alone. Read the scheme as `const { theme } = useTheme()`. An application's own portal that re-themed with `<Theme theme={useTheme()}>` takes all three with `<Theme {...useTheme()}>`, so it keeps a high contrast or a `standard` opt-out and the compact scale too; `v1-names` makes that change, turns other calls into `useTheme().theme` unless the file already reads them as `{ theme, contrast }`, and reports those whose value is returned or passed to a context. In JavaScript, `theme={useTheme()}` would render `data-env-theme="[object Object]"`, so in development Theme warns about a `theme` that is not `light` or `dark`.

### Cascade layers

envUI's style sheet puts every rule in a cascade layer of `env`: `env.reset`, `env.tokens`, `env.base`, `env.components` and `env.utilities`. CSS outside cascade layers now overrides it whatever its specificity, which is what lets an application restyle a component without `!important`. It also means that rules which used to lose to envUI's more specific selectors now win, so check the application's own CSS:

- **Resets and element styles.** A global or element rule outside layers, such as `* { margin: 0 }`, `button { background: none; border: 0 }` or `h2 { font-size: 1.5rem }`, now restyles envUI's components too. So does a preflight that a utility framework adds outside layers. Put resets and element base styles in a layer declared before `env`, and the application's own component styles after it:

  ```css
  @layer reset, env, app;
  @layer reset {
    * {
      margin: 0;
    }
    button {
      background: none;
      border: 0;
    }
  }
  ```

  Declare the order before any style sheet that uses the layers, envUI's included, so a library whose layers load first takes its place in that order too. A framework that brings layers of its own, such as `base`, `components` and `utilities`, takes its place in the same statement: its base layer, with its preflight, before `env`, and its components and utilities after it, so they can restyle envUI's:

  ```css
  @layer reset, base, env, components, utilities, app;
  ```

- **Token overrides.** A token set on `.env-theme` outside layers now wins over every theme's value: a color set there applies in dark and at high contrast as well, and can break the contrast every theme is checked for. Override a token per theme and contrast, with the selectors the themes use, in this order:

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

- **`!important`.** An important declaration in a cascade layer beats every important declaration outside layers. envUI uses `!important` only where ColorPicker replaces the styles of react-colorful, its picker, so an `!important` in the application's style sheets outside layers doesn't override those few properties; one in a layer declared before `env`, or in a `style` attribute, does.

### Tokens

Every token is a custom property with the `--env-` prefix in 1.0, and colors are named by semantic role, `--env-color-{bg|fg|border}-{role}[-{emphasis}][-{state}]` (see [colors](foundations/colors.md)). The 0.7 alias tokens are removed, each for the token that replaces it; a few names change beyond the prefix, such as the old corner scale, which is the radius scale now; and the unused ones and the state values that the hover and pressed color tokens replace are removed. `v1-classes` rewrites every name below in style sheets and scripts, including a style sheet that themes envUI by setting a token, which then sets the new name. Check a renamed declaration of an application property that happens to share an old token's name, such as `--space-4`. The `tokens` section of the codemods' rename map lists the same entries.

A style sheet that themes envUI through its tokens needs a look for [cascade layers](#cascade-layers) too.

<!-- token-migration:start: npm run tokens:build writes this list from packages/ui/src/generated/token-migration.json. Change the tokens, not the list. -->

Renamed beyond the prefix:

| Before 1.0                          | 1.0                                          | Note                                                                                                   |
| ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `--app-sticky-top`                  | `--env-frame-sticky-top`                     | Where sticky content sticks below the app frame's header or title bar, which the frame sets.           |
| `--avatar-group-ring`               | `--env-avatar-group-ring`                    | The ring color an application sets for an avatar group on a fill that is not an envUI surface.         |
| `--color-bg-page-muted`             | `--env-color-bg-inset`                       | Named for its role: a background that leans back toward the page inside a fill.                        |
| `--color-border-accent`             | `--env-color-border-accent-emphasis`         | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge. |
| `--color-border-accent-emphasis`    | `--env-color-border-accent`                  | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.    |
| `--color-border-accent-hover`       | `--env-color-border-accent-emphasis-hover`   | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge. |
| `--color-border-accent-pressed`     | `--env-color-border-accent-emphasis-pressed` | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge. |
| `--color-border-danger`             | `--env-color-border-danger-emphasis`         | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge. |
| `--color-border-danger-emphasis`    | `--env-color-border-danger`                  | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.    |
| `--color-border-danger-hover`       | `--env-color-border-danger-emphasis-hover`   | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge. |
| `--color-border-danger-pressed`     | `--env-color-border-danger-emphasis-pressed` | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge. |
| `--color-border-done-emphasis`      | `--env-color-border-done`                    | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.    |
| `--color-border-neutral-emphasis`   | `--env-color-border-neutral`                 | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.    |
| `--color-border-success-emphasis`   | `--env-color-border-success`                 | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.    |
| `--color-border-translucent`        | `--env-color-border-media`                   | Named for its role: the inner edge of content of any color, such as images and color areas.            |
| `--color-border-warning-emphasis`   | `--env-color-border-warning`                 | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.    |
| `--env-app-sticky-top`              | `--env-frame-sticky-top`                     | Where sticky content sticks below the app frame's header or title bar, which the frame sets.           |
| `--env-app-topbar-block-size`       | `--env-frame-header-block-size`              | The height of the app frame's header or title bar, which the frame sets on the document.               |
| `--env-topbar-height`               | `--env-app-shell-header-height`              | The app frame's header height.                                                                         |
| `--font-family-code`                | `--env-code-font-family`                     |                                                                                                        |
| `--font-size-code`                  | `--env-code-font-size`                       |                                                                                                        |
| `--line-height-body`                | `--env-line-height-body`                     | The body line height an application may set; envUI reads it with a fallback of 1.4.                    |
| `--md-sys-shape-corner-extra-large` | `--env-radius-xl`                            | The old corner scale is the radius scale now.                                                          |
| `--md-sys-shape-corner-extra-small` | `--env-radius-xs`                            | The old corner scale is the radius scale now.                                                          |
| `--md-sys-shape-corner-full`        | `--env-radius-full`                          | The old corner scale is the radius scale now.                                                          |
| `--md-sys-shape-corner-large`       | `--env-radius-lg`                            | The old corner scale is the radius scale now.                                                          |
| `--md-sys-shape-corner-medium`      | `--env-radius-md`                            | The old corner scale is the radius scale now.                                                          |
| `--md-sys-shape-corner-none`        | `--env-radius-none`                          | The old corner scale is the radius scale now.                                                          |
| `--md-sys-shape-corner-small`       | `--env-radius-sm`                            | The old corner scale is the radius scale now.                                                          |
| `--radius-large`                    | `--env-radius-lg`                            | One radius scale: the large corner is its lg step.                                                     |
| `--radius-standard`                 | `--env-radius-sm`                            | One radius scale: the standard corner is its sm step.                                                  |
| `--topbar-height`                   | `--env-app-shell-header-height`              | The app frame's header height.                                                                         |
| `--viewport-gutter`                 | `--env-viewport-gutter`                      |                                                                                                        |

The 0.7 aliases, removed, each with the token that replaces it:

| 0.7 custom property                     | 1.0                                       | Used for                           |
| --------------------------------------- | ----------------------------------------- | ---------------------------------- |
| `--color-accent`                        | `--env-color-bg-important-strong`         | Important buttons                  |
| `--color-accent-hover`                  | `--env-color-bg-important-strong-hover`   | Important buttons                  |
| `--color-accent-pressed`                | `--env-color-bg-important-strong-pressed` | Important buttons                  |
| `--color-action-strip`                  | `--env-color-bg-default`                  | The action strip of a card         |
| `--color-avatar`                        | `--env-color-avatar-bg`                   | Avatars                            |
| `--color-avatar-figure`                 | `--env-color-avatar-figure`               | Avatars                            |
| `--color-border-hover`                  | `--env-color-border-muted-hover`          |                                    |
| `--color-border-strong`                 | `--env-color-border-muted`                |                                    |
| `--color-calendar-selected`             | `--env-color-bg-brand-emphasis`           | Calendars                          |
| `--color-calendar-today`                | `--env-color-border-accent-emphasis`      | Calendars                          |
| `--color-canvas`                        | `--env-color-bg-page`                     |                                    |
| `--color-checkbox`                      | `--env-color-bg-brand-emphasis`           | Checkboxes                         |
| `--color-checkbox-border`               | `--env-color-fg-muted`                    | Checkboxes                         |
| `--color-checkbox-hover`                | `--env-color-bg-brand-emphasis-hover`     | Checkboxes                         |
| `--color-checkbox-pressed`              | `--env-color-bg-brand-emphasis-pressed`   | Checkboxes                         |
| `--color-checkbox-ring-hover`           | `--env-color-fg-muted-hover`              | Checkboxes                         |
| `--color-checkbox-ring-pressed`         | `--env-color-fg-muted-pressed`            | Checkboxes                         |
| `--color-checkbox-text`                 | `--env-color-fg-default`                  | Checkboxes                         |
| `--color-chip`                          | `--env-color-bg-neutral-muted`            | Chips                              |
| `--color-chip-text`                     | `--env-color-fg-accent`                   | Chips                              |
| `--color-control-blue`                  | `--env-color-bg-brand-emphasis`           | Spinners, sliders and meters       |
| `--color-destructive-action`            | `--env-color-bg-danger-strong`            | Destructive buttons                |
| `--color-destructive-action-hover`      | `--env-color-bg-danger-strong-hover`      | Destructive buttons                |
| `--color-destructive-action-pressed`    | `--env-color-bg-danger-strong-pressed`    | Destructive buttons                |
| `--color-dialog`                        | `--env-color-bg-raised`                   |                                    |
| `--color-dialog-overlay`                | `--env-color-bg-overlay`                  |                                    |
| `--color-direction-link`                | `--env-color-bg-raised`                   | Pager links                        |
| `--color-direction-link-border`         | `--env-color-border-muted`                | Pager links                        |
| `--color-direction-link-border-hover`   | `--env-color-border-muted-hover`          | Pager links                        |
| `--color-direction-link-border-pressed` | `--env-color-border-muted-pressed`        | Pager links                        |
| `--color-direction-link-icon`           | `--env-color-fg-accent`                   | Pager links                        |
| `--color-direction-link-label`          | `--env-color-fg-muted`                    | Pager links                        |
| `--color-direction-link-text`           | `--env-color-fg-default`                  | Pager links                        |
| `--color-disabled-text`                 | `--env-color-fg-muted`                    |                                    |
| `--color-disclosure-text`               | `--env-color-fg-muted`                    | Disclosure summaries               |
| `--color-field`                         | `--env-color-bg-field`                    |                                    |
| `--color-field-active`                  | `--env-color-border-accent-emphasis`      | Fields                             |
| `--color-field-border`                  | `--env-color-border-default`              | Fields                             |
| `--color-field-error`                   | `--env-color-fg-danger`                   | Fields                             |
| `--color-field-hint`                    | `--env-color-fg-muted`                    | Fields                             |
| `--color-field-label`                   | `--env-color-fg-muted`                    | Fields                             |
| `--color-field-placeholder`             | `--env-color-fg-muted`                    | Fields                             |
| `--color-field-text`                    | `--env-color-fg-default`                  | Fields                             |
| `--color-fill`                          | `--env-color-bg-neutral-muted`            |                                    |
| `--color-focus-ring`                    | `--env-color-border-focus`                |                                    |
| `--color-icon`                          | `--env-color-fg-muted`                    |                                    |
| `--color-link`                          | `--env-color-fg-link`                     |                                    |
| `--color-link-hover`                    | `--env-color-fg-link-hover`               |                                    |
| `--color-link-pressed`                  | `--env-color-fg-link-pressed`             |                                    |
| `--color-markdown-border`               | `--env-color-border-muted`                | Markdown                           |
| `--color-menu-row`                      | `--env-color-bg-popup`                    | Menu rows                          |
| `--color-navigation-hover`              | `--env-color-bg-selected-hover`           | Navigation items                   |
| `--color-navigation-icon`               | `--env-color-fg-muted`                    | Navigation items                   |
| `--color-navigation-pressed`            | `--env-color-bg-selected-pressed`         | Navigation items                   |
| `--color-navigation-quiet`              | `--env-color-list-item-bg`                | Navigation items                   |
| `--color-navigation-quiet-hover`        | `--env-color-bg-navigation-hover`         | Navigation items                   |
| `--color-navigation-quiet-pressed`      | `--env-color-bg-navigation-pressed`       | Navigation items                   |
| `--color-navigation-selected`           | `--env-color-bg-selected`                 | Navigation items                   |
| `--color-navigation-text`               | `--env-color-fg-control`                  | Navigation items                   |
| `--color-on-accent`                     | `--env-color-fg-on-strong`                | Important buttons                  |
| `--color-on-avatar`                     | `--env-color-avatar-fg`                   | Avatars                            |
| `--color-on-calendar-selected`          | `--env-color-fg-on-emphasis`              | Calendars                          |
| `--color-on-checkbox`                   | `--env-color-fg-on-emphasis`              | Checkboxes                         |
| `--color-on-destructive-action`         | `--env-color-fg-on-strong`                | Destructive buttons                |
| `--color-on-navigation-selected`        | `--env-color-fg-on-selected`              | Navigation items                   |
| `--color-on-primary-action`             | `--env-color-fg-on-emphasis`              | Primary buttons                    |
| `--color-on-secondary-action`           | `--env-color-fg-control`                  | Secondary buttons                  |
| `--color-on-select-selected`            | `--env-color-fg-on-selected`              | Select options                     |
| `--color-on-subtle-action`              | `--env-color-fg-accent`                   | Outlined buttons                   |
| `--color-on-toast`                      | `--env-color-fg-on-strong`                | Toasts and tooltips                |
| `--color-on-tone`                       | `--env-color-fg-on-emphasis`              |                                    |
| `--color-outlined-focus`                | `--env-color-border-focus`                | Outlined buttons                   |
| `--color-pane`                          | `--env-color-bg-default`                  |                                    |
| `--color-popup`                         | `--env-color-bg-popup`                    |                                    |
| `--color-popup-border`                  | `--env-elevation-2-border`                | Popups                             |
| `--color-primary-action`                | `--env-color-bg-brand-emphasis`           | Primary buttons                    |
| `--color-primary-action-hover`          | `--env-color-bg-brand-emphasis-hover`     | Primary buttons                    |
| `--color-primary-action-pressed`        | `--env-color-bg-brand-emphasis-pressed`   | Primary buttons                    |
| `--color-quiet-label-hover`             | `--env-color-fg-muted-hover`              | Disclosure summaries               |
| `--color-quiet-label-pressed`           | `--env-color-fg-muted-pressed`            | Disclosure summaries               |
| `--color-radio`                         | `--env-color-bg-brand-emphasis`           | Radios                             |
| `--color-radio-detail`                  | `--env-color-fg-muted`                    | Radios                             |
| `--color-radio-hover`                   | `--env-color-bg-brand-emphasis-hover`     | Radios                             |
| `--color-radio-pressed`                 | `--env-color-bg-brand-emphasis-pressed`   | Radios                             |
| `--color-radio-row`                     | `--env-color-bg-muted`                    | Radio rows                         |
| `--color-radio-row-hover`               | `--env-color-bg-muted-hover`              | Radio rows                         |
| `--color-radio-row-pressed`             | `--env-color-bg-muted-pressed`            | Radio rows                         |
| `--color-radio-text`                    | `--env-color-fg-default`                  | Radios                             |
| `--color-row`                           | `--env-color-list-item-bg`                | List rows                          |
| `--color-row-alternate`                 | `--env-color-bg-raised`                   | List rows on a contrasting surface |
| `--color-row-detail`                    | `--env-color-fg-muted`                    | List rows                          |
| `--color-row-hover`                     | `--env-color-list-item-bg-hover`          | List rows                          |
| `--color-row-pressed`                   | `--env-color-list-item-bg-pressed`        | List rows                          |
| `--color-row-selected-hover`            | `--env-color-bg-selected-hover`           | Tree and table rows                |
| `--color-row-selected-pressed`          | `--env-color-bg-selected-pressed`         | Tree and table rows                |
| `--color-row-text`                      | `--env-color-fg-default`                  | List rows                          |
| `--color-secondary-action`              | `--env-color-bg-neutral-muted`            | Secondary buttons                  |
| `--color-secondary-action-hover`        | `--env-color-bg-neutral-muted-hover`      | Secondary buttons                  |
| `--color-secondary-action-pressed`      | `--env-color-bg-neutral-muted-pressed`    | Secondary buttons                  |
| `--color-select-option`                 | `--env-color-bg-popup`                    | Select options                     |
| `--color-select-option-hover`           | `--env-color-bg-popup-hover`              | Select options                     |
| `--color-select-option-pressed`         | `--env-color-bg-popup-pressed`            | Select options                     |
| `--color-select-option-text`            | `--env-color-fg-control`                  | Select options                     |
| `--color-select-selected`               | `--env-color-bg-selected`                 | Select options                     |
| `--color-select-selected-hover`         | `--env-color-bg-selected-hover`           | Select options                     |
| `--color-select-selected-pressed`       | `--env-color-bg-selected-pressed`         | Select options                     |
| `--color-skeleton-base`                 | `--env-color-bg-neutral-muted`            | Skeletons                          |
| `--color-skeleton-highlight`            | `--env-color-bg-neutral-muted-hover`      | Skeletons                          |
| `--color-state-layer`                   | `--env-color-fg-default`                  |                                    |
| `--color-state-layer-hover`             | `--env-color-bg-neutral-subtle-hover`     |                                    |
| `--color-state-layer-pressed`           | `--env-color-bg-neutral-subtle-pressed`   |                                    |
| `--color-subtle-action`                 | `--env-color-bg-raised`                   | Outlined buttons                   |
| `--color-subtle-action-border`          | `--env-color-border-default`              | Outlined buttons                   |
| `--color-subtle-action-border-hover`    | `--env-color-border-default-hover`        | Outlined buttons                   |
| `--color-subtle-action-border-pressed`  | `--env-color-border-default-pressed`      | Outlined buttons                   |
| `--color-subtle-action-hover`           | `--env-color-bg-raised-hover`             | Outlined buttons                   |
| `--color-subtle-action-pressed`         | `--env-color-bg-raised-pressed`           | Outlined buttons                   |
| `--color-surface`                       | `--env-color-bg-raised`                   |                                    |
| `--color-surface-muted`                 | `--env-color-bg-muted`                    |                                    |
| `--color-switch-off`                    | `--env-color-bg-neutral-muted`            | Switches                           |
| `--color-switch-off-hover`              | `--env-color-bg-neutral-muted-hover`      | Switches                           |
| `--color-switch-off-pressed`            | `--env-color-bg-neutral-muted-pressed`    | Switches                           |
| `--color-switch-on`                     | `--env-color-bg-brand-emphasis`           | Switches                           |
| `--color-switch-on-hover`               | `--env-color-bg-brand-emphasis-hover`     | Switches                           |
| `--color-switch-on-pressed`             | `--env-color-bg-brand-emphasis-pressed`   | Switches                           |
| `--color-switch-text`                   | `--env-color-fg-default`                  | Switches                           |
| `--color-switch-thumb`                  | `--env-color-fg-control`                  | Switches                           |
| `--color-switch-thumb-on`               | `--env-color-fg-on-emphasis`              | Switches                           |
| `--color-text-muted`                    | `--env-color-fg-muted`                    |                                    |
| `--color-text-primary`                  | `--env-color-fg-default`                  |                                    |
| `--color-text-quiet`                    | `--env-color-fg-muted`                    |                                    |
| `--color-text-strong`                   | `--env-color-fg-control`                  |                                    |
| `--color-toast-error`                   | `--env-color-bg-danger-strong`            | Toasts                             |
| `--color-toast-info`                    | `--env-color-bg-info-strong`              | Toasts                             |
| `--color-toast-neutral`                 | `--env-color-bg-neutral-strong`           | Toasts and tooltips                |
| `--color-toast-success`                 | `--env-color-bg-success-strong`           | Toasts                             |
| `--color-tone-accent`                   | `--env-color-fg-accent`                   |                                    |
| `--color-tone-danger`                   | `--env-color-fg-danger`                   |                                    |
| `--color-tone-done`                     | `--env-color-fg-done`                     |                                    |
| `--color-tone-neutral`                  | `--env-color-fg-muted`                    |                                    |
| `--color-tone-success`                  | `--env-color-fg-success`                  |                                    |
| `--color-tone-warning`                  | `--env-color-fg-warning`                  |                                    |

Aliases whose replacement is not the 0.7 role, or whose value changed, so a style that relied on them needs a look:

| 0.7 custom property         | 1.0                                     | What changed                                                                                                                                                                                                                                                                                                                       |
| --------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-avatar`            | `--env-color-avatar-bg`                 | A component token now.                                                                                                                                                                                                                                                                                                             |
| `--color-avatar-figure`     | `--env-color-avatar-figure`             | A component token now.                                                                                                                                                                                                                                                                                                             |
| `--color-checkbox`          | `--env-color-bg-brand-emphasis`         | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-checkbox-hover`    | `--env-color-bg-brand-emphasis-hover`   | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-checkbox-pressed`  | `--env-color-bg-brand-emphasis-pressed` | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-control-blue`      | `--env-color-bg-brand-emphasis`         | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-dialog-overlay`    | `--env-color-bg-overlay`                | 0.7's was opaque, #1f1f1f (hsl(0 0% 12.157%) in both themes), and the dialog backdrop made it 55% opaque with --state-dialog-overlay-opacity, which is removed. The role is the scrim itself, 55% opaque: paint it as it is, since a style that applies its own opacity now applies it twice. For the opaque color, write #1f1f1f. |
| `--color-navigation-quiet`  | `--env-color-list-item-bg`              | The quiet navigation item’s rest, which envUI no longer reads; list items have the same fill.                                                                                                                                                                                                                                      |
| `--color-on-avatar`         | `--env-color-avatar-fg`                 | A component token now.                                                                                                                                                                                                                                                                                                             |
| `--color-on-checkbox`       | `--env-color-fg-on-emphasis`            | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-row`               | `--env-color-list-item-bg`              | A component token: the default surface in light, the muted one in dark.                                                                                                                                                                                                                                                            |
| `--color-row-hover`         | `--env-color-list-item-bg-hover`        | A component token: the default surface in light, the muted one in dark.                                                                                                                                                                                                                                                            |
| `--color-row-pressed`       | `--env-color-list-item-bg-pressed`      | A component token: the default surface in light, the muted one in dark.                                                                                                                                                                                                                                                            |
| `--color-switch-on`         | `--env-color-bg-brand-emphasis`         | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-switch-on-hover`   | `--env-color-bg-brand-emphasis-hover`   | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-switch-on-pressed` | `--env-color-bg-brand-emphasis-pressed` | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |
| `--color-switch-thumb-on`   | `--env-color-fg-on-emphasis`            | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                        |

Fixed colors, which no token replaces: write the value, or a custom property of your own that holds it.

| 0.7 custom property   | Used for              | Value     |
| --------------------- | --------------------- | --------- |
| `--color-canvas-dark` | Fixed dark page color | `#1e1f21` |
| `--color-white`       | Fixed white           | `#ffffff` |

Removed, with what to use instead:

| 0.7 custom property                   | Use instead                             | Note                                                                                                                       |
| ------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--color-border-pressed`              | `--env-color-border-muted-pressed`      | Unused.                                                                                                                    |
| `--color-control-blue-hover`          | `--env-color-bg-brand-strong-hover`     | Unused.                                                                                                                    |
| `--color-control-blue-pressed`        | `--env-color-bg-brand-strong-pressed`   | Unused.                                                                                                                    |
| `--color-control-text`                | `--env-color-fg-control`                | Unused synonym.                                                                                                            |
| `--color-fill-hover`                  | `--env-color-bg-neutral-muted-hover`    | Unused.                                                                                                                    |
| `--color-fill-pressed`                | `--env-color-bg-neutral-muted-pressed`  | Unused.                                                                                                                    |
| `--color-neutral-fill`                | `--env-color-bg-neutral-strong`         | Unused.                                                                                                                    |
| `--color-surface-base`                | `--env-color-bg-raised`                 | Unused.                                                                                                                    |
| `--color-surface-raised`              | `--env-color-bg-raised`                 | Unused.                                                                                                                    |
| `--color-text-subtle`                 | `--env-color-fg-muted`                  | Unused synonym.                                                                                                            |
| `--control-height-compact`            | `--env-control-height-sm`               | The small control height. For a compact app or region, set scale="compact" on its Theme instead.                           |
| `--control-height-small`              | `--env-control-height`                  | It always equalled --control-height, which every control reads now.                                                        |
| `--icon-button-size`                  | `--env-control-height`                  | An icon button is as tall as the other controls of its size.                                                               |
| `--member-identity-avatar-size`       | —                                       | Unused.                                                                                                                    |
| `--member-identity-copy-height`       | —                                       | Unused.                                                                                                                    |
| `--member-identity-email-line-height` | —                                       | Unused.                                                                                                                    |
| `--member-identity-email-size`        | —                                       | Unused.                                                                                                                    |
| `--member-identity-gap`               | —                                       | Unused.                                                                                                                    |
| `--member-identity-name-line-height`  | —                                       | Unused.                                                                                                                    |
| `--member-identity-name-size`         | —                                       | Unused.                                                                                                                    |
| `--scale`                             | —                                       | The multiplier is gone: components read sized tokens. Set scale="compact" on a Theme for the compact scale.                |
| `--state-card-strip-weight`           | —                                       | Unused.                                                                                                                    |
| `--state-dialog-overlay-opacity`      | `--env-color-bg-overlay`                | The scrim is a translucent color token now.                                                                                |
| `--state-fill-hover-opacity`          | `--env-color-bg-neutral-muted-hover`    | The fill's states are color tokens now.                                                                                    |
| `--state-fill-opacity`                | `--env-color-bg-neutral-muted`          | The neutral fill is a translucent color token; layer it over a surface rather than mixing.                                 |
| `--state-fill-pressed-opacity`        | `--env-color-bg-neutral-muted-pressed`  | The fill's states are color tokens now.                                                                                    |
| `--state-hover-lightness`             | —                                       | The runtime hover rule is gone: use the role's -hover token.                                                               |
| `--state-hover-shift`                 | —                                       | The runtime hover rule is gone.                                                                                            |
| `--state-layer-hover-opacity`         | `--env-color-bg-neutral-subtle-hover`   | The state layer is a color token now.                                                                                      |
| `--state-layer-pressed-opacity`       | `--env-color-bg-neutral-subtle-pressed` | The state layer is a color token now.                                                                                      |
| `--state-lightness-direction`         | —                                       | The runtime hover rule is gone: every role has hover and pressed tokens.                                                   |
| `--state-lightness-threshold`         | —                                       | The runtime hover rule is gone.                                                                                            |
| `--state-pressed-lightness`           | —                                       | The runtime hover rule is gone: use the role's -pressed token.                                                             |
| `--state-pressed-shift`               | —                                       | The runtime hover rule is gone.                                                                                            |
| `--state-selected-base-weight`        | —                                       | Unused.                                                                                                                    |
| `--state-surface-hover-lightness`     | —                                       | The runtime hover rule is gone: use the surface's -hover token.                                                            |
| `--state-surface-hover-shift`         | —                                       | The runtime hover rule is gone.                                                                                            |
| `--state-surface-pressed-lightness`   | —                                       | The runtime hover rule is gone: use the surface's -pressed token.                                                          |
| `--state-surface-pressed-shift`       | —                                       | The runtime hover rule is gone.                                                                                            |
| `--state-tone-subtle-opacity`         | —                                       | Each tone has its tint as a color token: color.bg.{tone}.muted.                                                            |
| `--surface-card-padding`              | —                                       | Internal to the 0.7 card. Set a card's padding with its padding prop.                                                      |
| `--toast-fill`                        | —                                       | Internal to the 0.7 toast. A toast takes its fill from its tone; restyle a toast through the component, not this property. |

Every other name only takes the prefix, `--body-font-weight` as `--env-body-font-weight`: `--body-font-weight`, `--color-bg-accent-emphasis`, `--color-bg-accent-muted`, `--color-bg-accent-subtle-hover`, `--color-bg-accent-subtle-pressed`, `--color-bg-brand-emphasis`, `--color-bg-brand-emphasis-hover`, `--color-bg-brand-emphasis-pressed`, `--color-bg-brand-muted`, `--color-bg-brand-strong`, `--color-bg-brand-strong-hover`, `--color-bg-brand-strong-pressed`, `--color-bg-danger-emphasis`, `--color-bg-danger-muted`, `--color-bg-danger-strong`, `--color-bg-danger-strong-hover`, `--color-bg-danger-strong-pressed`, `--color-bg-danger-subtle-hover`, `--color-bg-danger-subtle-pressed`, `--color-bg-default`, `--color-bg-default-hover`, `--color-bg-default-pressed`, `--color-bg-done-emphasis`, `--color-bg-done-muted`, `--color-bg-field`, `--color-bg-important-strong`, `--color-bg-important-strong-hover`, `--color-bg-important-strong-pressed`, `--color-bg-info-strong`, `--color-bg-info-strong-hover`, `--color-bg-info-strong-pressed`, `--color-bg-muted`, `--color-bg-muted-hover`, `--color-bg-muted-pressed`, `--color-bg-navigation-hover`, `--color-bg-navigation-pressed`, `--color-bg-neutral-emphasis`, `--color-bg-neutral-muted`, `--color-bg-neutral-muted-hover`, `--color-bg-neutral-muted-pressed`, `--color-bg-neutral-strong`, `--color-bg-neutral-strong-hover`, `--color-bg-neutral-strong-pressed`, `--color-bg-neutral-subtle`, `--color-bg-neutral-subtle-hover`, `--color-bg-neutral-subtle-pressed`, `--color-bg-overlay`, `--color-bg-overlay-muted`, `--color-bg-page`, `--color-bg-page-hover`, `--color-bg-page-pressed`, `--color-bg-popup`, `--color-bg-popup-hover`, `--color-bg-popup-pressed`, `--color-bg-raised`, `--color-bg-raised-hover`, `--color-bg-raised-pressed`, `--color-bg-selected`, `--color-bg-selected-hover`, `--color-bg-selected-pressed`, `--color-bg-success-emphasis`, `--color-bg-success-muted`, `--color-bg-success-strong`, `--color-bg-success-strong-hover`, `--color-bg-success-strong-pressed`, `--color-bg-success-subtle-hover`, `--color-bg-success-subtle-pressed`, `--color-bg-warning-emphasis`, `--color-bg-warning-muted`, `--color-bg-warning-subtle-hover`, `--color-bg-warning-subtle-pressed`, `--color-border-accent-muted`, `--color-border-danger-muted`, `--color-border-danger-strong`, `--color-border-default`, `--color-border-default-hover`, `--color-border-default-pressed`, `--color-border-focus`, `--color-border-info-strong`, `--color-border-muted`, `--color-border-muted-hover`, `--color-border-muted-pressed`, `--color-border-neutral-strong`, `--color-border-success-muted`, `--color-border-success-strong`, `--color-border-warning-muted`, `--color-fg-accent`, `--color-fg-control`, `--color-fg-danger`, `--color-fg-default`, `--color-fg-done`, `--color-fg-link`, `--color-fg-link-hover`, `--color-fg-link-pressed`, `--color-fg-muted`, `--color-fg-muted-hover`, `--color-fg-muted-pressed`, `--color-fg-on-emphasis`, `--color-fg-on-selected`, `--color-fg-on-strong`, `--color-fg-success`, `--color-fg-warning`, `--control-border-width`, `--control-font-size`, `--control-gap`, `--control-height`, `--control-height-lg`, `--control-height-md`, `--control-height-sm`, `--control-height-touch`, `--control-icon-size`, `--control-target-min`, `--elevation-0-border`, `--elevation-0-shadow`, `--elevation-1-border`, `--elevation-1-shadow`, `--elevation-2-border`, `--elevation-2-shadow`, `--elevation-3-border`, `--elevation-3-shadow`, `--field-floating-height`, `--font-family`, `--font-size-body`, `--font-size-body-small`, `--font-size-caption`, `--font-size-heading`, `--font-size-heading-small`, `--font-size-label`, `--font-size-label-small`, `--icon-size-lg`, `--icon-size-md`, `--icon-size-sm`, `--motion-duration-fast`, `--motion-duration-medium`, `--motion-duration-slow`, `--motion-ease`, `--motion-ease-enter`, `--motion-ease-exit`, `--motion-ease-standard`, `--radius-row-inner`, `--radius-row-outer`, `--radius-row-single`, `--radius-surface`, `--row-content-height`, `--row-height`, `--row-padding-block-lg`, `--row-padding-block-md`, `--row-padding-block-sm`, `--row-padding-block-xs`, `--row-padding-inline`, `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-5`, `--space-6`, `--space-7`, `--space-8`, `--space-9`, `--state-disabled-opacity`, `--title-bar-height`, `--tree-row-padding-block-lg`, `--tree-row-padding-block-md`, `--tree-row-padding-block-sm`, `--type-body`, `--type-body-font-family`, `--type-body-font-size`, `--type-body-font-weight`, `--type-body-letter-spacing`, `--type-body-line-height`, `--type-body-small`, `--type-body-small-font-family`, `--type-body-small-font-size`, `--type-body-small-font-weight`, `--type-body-small-letter-spacing`, `--type-body-small-line-height`, `--type-h1`, `--type-h1-font-family`, `--type-h1-font-size`, `--type-h1-font-weight`, `--type-h1-letter-spacing`, `--type-h1-line-height`, `--type-h2`, `--type-h2-font-family`, `--type-h2-font-size`, `--type-h2-font-weight`, `--type-h2-letter-spacing`, `--type-h2-line-height`.

<!-- token-migration:end -->

## Migrate by responsibility

Prefer a small complete slice with shared controls and representative interactions, then expand through callers. The first slice should expose routing, forms or overlays rather than only a static button. Choose an order that fits the application; shared wrappers can reduce repetition when their contract still fits.

Consult the relevant [component documentation](index.md) before adopting these candidates:

| Existing responsibility                          | Candidate                                                 |
| ------------------------------------------------ | --------------------------------------------------------- |
| Typography, panes, vertical layouts, action rows | Text, Surface, Stack, ActionGroup                         |
| Buttons, inline links, icon/connected actions    | Button, Link, IconButton, ButtonGroup                     |
| Side navigation and selected destinations        | NavList.Item with router-owned selection                  |
| Content/action/clickable cards                   | Appropriate public Card composition                       |
| Fields and choices                               | TextField, Textarea, Select, Checkbox, RadioGroup, Switch |
| Modal/inspector shells, notifications            | Dialog, Toast.Provider/useToast                           |
| Loading and empty results                        | LoadingState, Skeleton, EmptyState                        |
| Source, Markdown, formatted editing              | Optional content or rich-text entry                       |

Port behavior explicitly instead of mechanically translating props. Preserve labels, accessible names, href/router state, callback payloads, refs, form names/reset, focus restoration and mutation timing. Check button types inside forms, pending-operation dismissal rules and draft state through dialogs/navigation.

Keep vendor dependencies with remaining consumers. A vendor widget can require another component library and its theme as a peer even after the application's own controls migrate. Inspect the installed widget's manifest and behavior. Scope its CSS and theme to the widget's area and adapt tokens through supported configuration or narrowly scoped existing styles.

Identify gaps early: dropdown/organization menus, avatars, tables or other features may lack a direct envUI export. Compose public primitives only when they preserve the interaction. Retain a functioning implementation for unmigrated features and report gaps; avoid incomplete imitations and silent behavior loss. Shared library additions require envUI work to be in scope.

Treat stored rich text as a data contract. Check representative documents, references, images and tables before switching editors/serializers. Preserve source editing when normalization would change the product's promise. Do not rewrite persisted content as an incidental UI migration.

## Remove obsolete implementation after replacement

Search remaining imports/callers, styles, assets, vendor peers and generated tooling before deleting dependencies, providers, resets, fonts or icon pipelines. Remove obsolete wrappers/CSS once their responsibilities are covered. Preserve application layouts and vendor styles. Update existing project instructions that point to retired UI owners.

For partial migrations, identify migrated/retained areas and concrete gaps in the task or PR. Dependency installation alone is not a completed migration. Keep guidance improvements in their relevant documentation pages.

## Validate and hand over

Run established application checks and production builds, including deployment dry runs when they are normal verification. Exercise affected journeys in a browser: both themes, keyboard interaction, narrow portrait/landscape containers, expanded/collapsed navigation where present, and enlarged text. Check portal focus/theme, form submit/reset/validation, links and vendor widgets.

Use meaningful existing tests; update assertions intentionally tied to replaced markup. Add focused coverage for behavior at risk. Run envUI acceptance for library additions. Confirm the final manifest/lockfile uses the intended package rather than a machine-specific link.

Report the adopted version, completed scope, checks, retained dependencies and unresolved gaps. Turn integration issues into targeted edits to the relevant component documentation or this workflow.
