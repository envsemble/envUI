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

envUI 1.0 renames components, compound parts, classes and documentation pages, and makes a few helpers internal; nothing is exported under a 0.x name. The codemods and the lint packages, released with envUI at the same version, do most of the work. Commit first, as the codemods write files in place:

```sh
npx @envsemble/envui-codemods@<version> v1-names src --dry   # the files that would change, and the reports
npx @envsemble/envui-codemods@<version> v1-names src
npx @envsemble/envui-codemods@<version> v1-classes src
```

Then install envUI 1.0, format, type-check and lint with the ESLint plugin:

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import envui from '@envsemble/eslint-plugin-envui';

export default defineConfig(envui.configs.recommended);
```

- `v1-names` rewrites imports and references from `@envsemble/envui` and `@envsemble/envui/theme-bootstrap`: renamed components and types (`Input` is `TextField`), namespace parts (`MenuItem` is `Menu.Item`, `<Menu>` is `<Menu.Root>`), `DirectionLink` by its literal `direction` (`Pager.Previous` or `Pager.Next`), re-exports, `defaultThemeStorageKey`, which becomes `'env-theme'`, and `<Theme theme={useTheme()}>`, which becomes `<Theme {...useTheme()}>`.
- `v1-classes` renames `env-*` classes and `--env-*` custom properties in style sheets, class names and selector strings.
- `envui/no-renamed-exports` reports every 0.x name left, also through `require()`, `import()` and `createElement()`, with its 1.0 name or what to use instead. The recommended config also reports raw elements that envUI provides, envUI's private classes and raw colors; `@envsemble/stylelint-config-envui` does the same for style sheets.

Change by hand what the codemods report, each with its file and line:

- removed exports: `LoadingBar` (AppShell's `loading` prop, or Progress), the manual `Toast` (`useToast()` inside `Toast.Provider`), `ToastProps` (`ToastNotification`), `getInitials`, `useLinkComponent` and `useSidebarCompact`;
- a `DirectionLink` whose `direction` is computed or spread, or that is used outside JSX;
- re-exports of namespace parts, and names destructured from a namespace import;
- a local that shadows a namespace or a new name: the codemod writes a second import under an alias, such as `Menu as EnvMenu`, which you may rename;
- a removed import's `@ts-expect-error` or disable comment, which the codemod drops with the line it applied to;
- `useTheme()` compared with a color scheme or passed as another element's `theme`, which takes `useTheme().theme`.

The codemods also leave class names built at run time, CSS-in-JS, selectors nested in a Sass or Less rule (a DiffCount label in a nested `.env-diff-count` rule becomes `env-diff-stat-label`), mocks and `declare module` augmentations; search for the old names there. The codemods' rename map, `src/maps/v1.json` in `@envsemble/envui-codemods`, lists every change.

### useTheme returns the theme and its contrast

`useTheme()` returns `{ theme, contrast }` instead of the color scheme alone. Read the scheme as `const { theme } = useTheme()`. An application's own portal that re-themed with `<Theme theme={useTheme()}>` takes both with `<Theme {...useTheme()}>`, so it keeps a high contrast or a `standard` opt-out too; `v1-names` makes that change. In JavaScript, `theme={useTheme()}` would render `data-env-theme="[object Object]"`, so in development Theme warns about a `theme` that is not `light` or `dark`.

### Tokens

envUI 1.0 names its colors by semantic role, `--color-{bg|fg|border}-{role}-{emphasis}[-{state}]` (see [colors](foundations/colors.md)). A few 0.7 custom properties are removed: unused ones, and the state values that the hover and pressed color tokens replace. The other 0.7 names remain for now as aliases of their roles, so style sheets that read them keep working; they are removed in the CSS-architecture step of 1.0, together with the move of every token to the `--env-` prefix. Move to the roles before then. The codemods do not rename tokens yet; the `tokens` section of their rename map lists the same replacements as below.

<!-- token-migration:start: npm run tokens:build writes this list from packages/ui/src/generated/token-migration.json. Change the tokens, not the list. -->

Removed, with what to use instead:

| 0.7 custom property                   | Use instead                         | Note                                                                                       |
| ------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| `--color-border-pressed`              | `--color-border-muted-pressed`      | Unused.                                                                                    |
| `--color-control-blue-hover`          | `--color-bg-brand-strong-hover`     | Unused.                                                                                    |
| `--color-control-blue-pressed`        | `--color-bg-brand-strong-pressed`   | Unused.                                                                                    |
| `--color-control-text`                | `--color-fg-control`                | Unused synonym.                                                                            |
| `--color-fill-hover`                  | `--color-bg-neutral-muted-hover`    | Unused.                                                                                    |
| `--color-fill-pressed`                | `--color-bg-neutral-muted-pressed`  | Unused.                                                                                    |
| `--color-neutral-fill`                | `--color-bg-neutral-strong`         | Unused.                                                                                    |
| `--color-surface-base`                | `--color-bg-raised`                 | Unused.                                                                                    |
| `--color-surface-raised`              | `--color-bg-raised`                 | Unused.                                                                                    |
| `--color-text-subtle`                 | `--color-fg-muted`                  | Unused synonym.                                                                            |
| `--member-identity-avatar-size`       | —                                   | Unused.                                                                                    |
| `--member-identity-copy-height`       | —                                   | Unused.                                                                                    |
| `--member-identity-email-line-height` | —                                   | Unused.                                                                                    |
| `--member-identity-email-size`        | —                                   | Unused.                                                                                    |
| `--member-identity-gap`               | —                                   | Unused.                                                                                    |
| `--member-identity-name-line-height`  | —                                   | Unused.                                                                                    |
| `--member-identity-name-size`         | —                                   | Unused.                                                                                    |
| `--state-card-strip-weight`           | —                                   | Unused.                                                                                    |
| `--state-dialog-overlay-opacity`      | `--color-bg-overlay`                | The scrim is a translucent color token now.                                                |
| `--state-fill-hover-opacity`          | `--color-bg-neutral-muted-hover`    | The fill's states are color tokens now.                                                    |
| `--state-fill-opacity`                | `--color-bg-neutral-muted`          | The neutral fill is a translucent color token; layer it over a surface rather than mixing. |
| `--state-fill-pressed-opacity`        | `--color-bg-neutral-muted-pressed`  | The fill's states are color tokens now.                                                    |
| `--state-hover-lightness`             | —                                   | The runtime hover rule is gone: use the role's -hover token.                               |
| `--state-hover-shift`                 | —                                   | The runtime hover rule is gone.                                                            |
| `--state-layer-hover-opacity`         | `--color-bg-neutral-subtle-hover`   | The state layer is a color token now.                                                      |
| `--state-layer-pressed-opacity`       | `--color-bg-neutral-subtle-pressed` | The state layer is a color token now.                                                      |
| `--state-lightness-direction`         | —                                   | The runtime hover rule is gone: every role has hover and pressed tokens.                   |
| `--state-lightness-threshold`         | —                                   | The runtime hover rule is gone.                                                            |
| `--state-pressed-lightness`           | —                                   | The runtime hover rule is gone: use the role's -pressed token.                             |
| `--state-pressed-shift`               | —                                   | The runtime hover rule is gone.                                                            |
| `--state-selected-base-weight`        | —                                   | Unused.                                                                                    |
| `--state-surface-hover-lightness`     | —                                   | The runtime hover rule is gone: use the surface's -hover token.                            |
| `--state-surface-hover-shift`         | —                                   | The runtime hover rule is gone.                                                            |
| `--state-surface-pressed-lightness`   | —                                   | The runtime hover rule is gone: use the surface's -pressed token.                          |
| `--state-surface-pressed-shift`       | —                                   | The runtime hover rule is gone.                                                            |
| `--state-tone-subtle-opacity`         | —                                   | Each tone has its tint as a color token: color.bg.{tone}.muted.                            |

Aliases of one role, which replaces them:

| 0.7 custom property                     | Role                                  | Used for                           |
| --------------------------------------- | ------------------------------------- | ---------------------------------- |
| `--color-accent`                        | `--color-bg-important-strong`         | Important buttons                  |
| `--color-accent-hover`                  | `--color-bg-important-strong-hover`   | Important buttons                  |
| `--color-accent-pressed`                | `--color-bg-important-strong-pressed` | Important buttons                  |
| `--color-action-strip`                  | `--color-bg-default`                  | The action strip of a card         |
| `--color-border-hover`                  | `--color-border-muted-hover`          |                                    |
| `--color-border-strong`                 | `--color-border-muted`                |                                    |
| `--color-calendar-selected`             | `--color-bg-brand-emphasis`           | Calendars                          |
| `--color-calendar-today`                | `--color-border-accent`               | Calendars                          |
| `--color-canvas`                        | `--color-bg-page`                     |                                    |
| `--color-checkbox-border`               | `--color-fg-muted`                    | Checkboxes                         |
| `--color-checkbox-ring-hover`           | `--color-fg-muted-hover`              | Checkboxes                         |
| `--color-checkbox-ring-pressed`         | `--color-fg-muted-pressed`            | Checkboxes                         |
| `--color-checkbox-text`                 | `--color-fg-default`                  | Checkboxes                         |
| `--color-chip`                          | `--color-bg-neutral-muted`            | Chips                              |
| `--color-chip-text`                     | `--color-fg-accent`                   | Chips                              |
| `--color-destructive-action`            | `--color-bg-danger-strong`            | Destructive buttons                |
| `--color-destructive-action-hover`      | `--color-bg-danger-strong-hover`      | Destructive buttons                |
| `--color-destructive-action-pressed`    | `--color-bg-danger-strong-pressed`    | Destructive buttons                |
| `--color-dialog`                        | `--color-bg-raised`                   |                                    |
| `--color-dialog-overlay`                | `--color-bg-overlay`                  |                                    |
| `--color-direction-link`                | `--color-bg-raised`                   | Pager links                        |
| `--color-direction-link-border`         | `--color-border-muted`                | Pager links                        |
| `--color-direction-link-border-hover`   | `--color-border-muted-hover`          | Pager links                        |
| `--color-direction-link-border-pressed` | `--color-border-muted-pressed`        | Pager links                        |
| `--color-direction-link-icon`           | `--color-fg-accent`                   | Pager links                        |
| `--color-direction-link-label`          | `--color-fg-muted`                    | Pager links                        |
| `--color-direction-link-text`           | `--color-fg-default`                  | Pager links                        |
| `--color-disabled-text`                 | `--color-fg-muted`                    |                                    |
| `--color-disclosure-text`               | `--color-fg-muted`                    | Disclosure summaries               |
| `--color-field`                         | `--color-bg-field`                    |                                    |
| `--color-field-active`                  | `--color-border-accent`               | Fields                             |
| `--color-field-border`                  | `--color-border-default`              | Fields                             |
| `--color-field-error`                   | `--color-fg-danger`                   | Fields                             |
| `--color-field-hint`                    | `--color-fg-muted`                    | Fields                             |
| `--color-field-label`                   | `--color-fg-muted`                    | Fields                             |
| `--color-field-placeholder`             | `--color-fg-muted`                    | Fields                             |
| `--color-field-text`                    | `--color-fg-default`                  | Fields                             |
| `--color-fill`                          | `--color-bg-neutral-muted`            |                                    |
| `--color-focus-ring`                    | `--color-border-focus`                |                                    |
| `--color-icon`                          | `--color-fg-muted`                    |                                    |
| `--color-link`                          | `--color-fg-link`                     |                                    |
| `--color-link-hover`                    | `--color-fg-link-hover`               |                                    |
| `--color-link-pressed`                  | `--color-fg-link-pressed`             |                                    |
| `--color-markdown-border`               | `--color-border-muted`                | Markdown                           |
| `--color-menu-row`                      | `--color-bg-popup`                    | Menu rows                          |
| `--color-navigation-hover`              | `--color-bg-selected-hover`           | Navigation items                   |
| `--color-navigation-icon`               | `--color-fg-muted`                    | Navigation items                   |
| `--color-navigation-pressed`            | `--color-bg-selected-pressed`         | Navigation items                   |
| `--color-navigation-quiet-hover`        | `--color-bg-navigation-hover`         | Navigation items                   |
| `--color-navigation-quiet-pressed`      | `--color-bg-navigation-pressed`       | Navigation items                   |
| `--color-navigation-selected`           | `--color-bg-selected`                 | Navigation items                   |
| `--color-navigation-text`               | `--color-fg-control`                  | Navigation items                   |
| `--color-on-accent`                     | `--color-fg-on-strong`                | Important buttons                  |
| `--color-on-calendar-selected`          | `--color-fg-on-emphasis`              | Calendars                          |
| `--color-on-destructive-action`         | `--color-fg-on-strong`                | Destructive buttons                |
| `--color-on-navigation-selected`        | `--color-fg-on-selected`              | Navigation items                   |
| `--color-on-primary-action`             | `--color-fg-on-emphasis`              | Primary buttons                    |
| `--color-on-secondary-action`           | `--color-fg-control`                  | Secondary buttons                  |
| `--color-on-select-selected`            | `--color-fg-on-selected`              | Select options                     |
| `--color-on-subtle-action`              | `--color-fg-accent`                   | Outlined buttons                   |
| `--color-on-toast`                      | `--color-fg-on-strong`                | Toasts and tooltips                |
| `--color-on-tone`                       | `--color-fg-on-emphasis`              |                                    |
| `--color-outlined-focus`                | `--color-border-focus`                | Outlined buttons                   |
| `--color-pane`                          | `--color-bg-default`                  |                                    |
| `--color-popup`                         | `--color-bg-popup`                    |                                    |
| `--color-popup-border`                  | `--elevation-2-border`                | Popups                             |
| `--color-primary-action`                | `--color-bg-brand-emphasis`           | Primary buttons                    |
| `--color-primary-action-hover`          | `--color-bg-brand-emphasis-hover`     | Primary buttons                    |
| `--color-primary-action-pressed`        | `--color-bg-brand-emphasis-pressed`   | Primary buttons                    |
| `--color-quiet-label-hover`             | `--color-fg-muted-hover`              | Disclosure summaries               |
| `--color-quiet-label-pressed`           | `--color-fg-muted-pressed`            | Disclosure summaries               |
| `--color-radio`                         | `--color-bg-brand-emphasis`           | Radios                             |
| `--color-radio-detail`                  | `--color-fg-muted`                    | Radios                             |
| `--color-radio-hover`                   | `--color-bg-brand-emphasis-hover`     | Radios                             |
| `--color-radio-pressed`                 | `--color-bg-brand-emphasis-pressed`   | Radios                             |
| `--color-radio-row`                     | `--color-bg-muted`                    | Radio rows                         |
| `--color-radio-row-hover`               | `--color-bg-muted-hover`              | Radio rows                         |
| `--color-radio-row-pressed`             | `--color-bg-muted-pressed`            | Radio rows                         |
| `--color-radio-text`                    | `--color-fg-default`                  | Radios                             |
| `--color-row-alternate`                 | `--color-bg-raised`                   | List rows on a contrasting surface |
| `--color-row-detail`                    | `--color-fg-muted`                    | List rows                          |
| `--color-row-selected-hover`            | `--color-bg-selected-hover`           | Tree and table rows                |
| `--color-row-selected-pressed`          | `--color-bg-selected-pressed`         | Tree and table rows                |
| `--color-row-text`                      | `--color-fg-default`                  | List rows                          |
| `--color-secondary-action`              | `--color-bg-neutral-muted`            | Secondary buttons                  |
| `--color-secondary-action-hover`        | `--color-bg-neutral-muted-hover`      | Secondary buttons                  |
| `--color-secondary-action-pressed`      | `--color-bg-neutral-muted-pressed`    | Secondary buttons                  |
| `--color-select-option`                 | `--color-bg-popup`                    | Select options                     |
| `--color-select-option-hover`           | `--color-bg-popup-hover`              | Select options                     |
| `--color-select-option-pressed`         | `--color-bg-popup-pressed`            | Select options                     |
| `--color-select-option-text`            | `--color-fg-control`                  | Select options                     |
| `--color-select-selected`               | `--color-bg-selected`                 | Select options                     |
| `--color-select-selected-hover`         | `--color-bg-selected-hover`           | Select options                     |
| `--color-select-selected-pressed`       | `--color-bg-selected-pressed`         | Select options                     |
| `--color-skeleton-base`                 | `--color-bg-neutral-muted`            | Skeletons                          |
| `--color-skeleton-highlight`            | `--color-bg-neutral-muted-hover`      | Skeletons                          |
| `--color-state-layer`                   | `--color-fg-default`                  |                                    |
| `--color-state-layer-hover`             | `--color-bg-neutral-subtle-hover`     |                                    |
| `--color-state-layer-pressed`           | `--color-bg-neutral-subtle-pressed`   |                                    |
| `--color-subtle-action`                 | `--color-bg-raised`                   | Outlined buttons                   |
| `--color-subtle-action-border`          | `--color-border-default`              | Outlined buttons                   |
| `--color-subtle-action-border-hover`    | `--color-border-default-hover`        | Outlined buttons                   |
| `--color-subtle-action-border-pressed`  | `--color-border-default-pressed`      | Outlined buttons                   |
| `--color-subtle-action-hover`           | `--color-bg-raised-hover`             | Outlined buttons                   |
| `--color-subtle-action-pressed`         | `--color-bg-raised-pressed`           | Outlined buttons                   |
| `--color-surface`                       | `--color-bg-raised`                   |                                    |
| `--color-surface-muted`                 | `--color-bg-muted`                    |                                    |
| `--color-switch-off`                    | `--color-bg-neutral-muted`            | Switches                           |
| `--color-switch-off-hover`              | `--color-bg-neutral-muted-hover`      | Switches                           |
| `--color-switch-off-pressed`            | `--color-bg-neutral-muted-pressed`    | Switches                           |
| `--color-switch-text`                   | `--color-fg-default`                  | Switches                           |
| `--color-switch-thumb`                  | `--color-fg-control`                  | Switches                           |
| `--color-text-muted`                    | `--color-fg-muted`                    |                                    |
| `--color-text-primary`                  | `--color-fg-default`                  |                                    |
| `--color-text-quiet`                    | `--color-fg-muted`                    |                                    |
| `--color-text-strong`                   | `--color-fg-control`                  |                                    |
| `--color-toast-error`                   | `--color-bg-danger-strong`            | Toasts                             |
| `--color-toast-info`                    | `--color-bg-info-strong`              | Toasts                             |
| `--color-toast-neutral`                 | `--color-bg-neutral-strong`           | Toasts and tooltips                |
| `--color-toast-success`                 | `--color-bg-success-strong`           | Toasts                             |
| `--color-tone-accent`                   | `--color-fg-accent`                   |                                    |
| `--color-tone-danger`                   | `--color-fg-danger`                   |                                    |
| `--color-tone-done`                     | `--color-fg-done`                     |                                    |
| `--color-tone-neutral`                  | `--color-fg-muted`                    |                                    |
| `--color-tone-success`                  | `--color-fg-success`                  |                                    |
| `--color-tone-warning`                  | `--color-fg-warning`                  |                                    |

Aliases whose value changed, so a style that relied on the 0.7 value needs a look:

| 0.7 custom property      | Role                 | What changed                                                                                                                                                                                                                                                                                    |
| ------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-dialog-overlay` | `--color-bg-overlay` | 0.7's was opaque, #1e1f21, and the dialog backdrop made it 55% opaque with --state-dialog-overlay-opacity, which is removed. The role is the scrim itself, 55% opaque: paint it as it is, since a style that applies its own opacity now applies it twice. For the opaque color, write #1e1f21. |

Component tokens that take another role in some themes, so no one role replaces them; use the role of each theme:

| 0.7 custom property         | Used for                     | Light                             | Dark                                | Light, high contrast                | Dark, high contrast                 |
| --------------------------- | ---------------------------- | --------------------------------- | ----------------------------------- | ----------------------------------- | ----------------------------------- |
| `--color-checkbox`          | Checkboxes                   | `--color-bg-brand-strong`         | `--color-bg-brand-emphasis`         | `--color-bg-brand-emphasis`         | `--color-bg-brand-emphasis`         |
| `--color-checkbox-hover`    | Checkboxes                   | `--color-bg-brand-strong-hover`   | `--color-bg-brand-emphasis-hover`   | `--color-bg-brand-emphasis-hover`   | `--color-bg-brand-emphasis-hover`   |
| `--color-checkbox-pressed`  | Checkboxes                   | `--color-bg-brand-strong-pressed` | `--color-bg-brand-emphasis-pressed` | `--color-bg-brand-emphasis-pressed` | `--color-bg-brand-emphasis-pressed` |
| `--color-control-blue`      | Spinners, sliders and meters | `--color-bg-brand-strong`         | `--color-bg-brand-emphasis`         | `--color-bg-brand-emphasis`         | `--color-bg-brand-emphasis`         |
| `--color-navigation-quiet`  | Navigation items             | `--color-bg-default`              | `--color-bg-muted`                  | `--color-bg-default`                | `--color-bg-muted`                  |
| `--color-on-checkbox`       | Checkboxes                   | `--color-fg-on-strong`            | `--color-fg-on-emphasis`            | `--color-fg-on-emphasis`            | `--color-fg-on-emphasis`            |
| `--color-row`               | List rows                    | `--color-bg-default`              | `--color-bg-muted`                  | `--color-bg-default`                | `--color-bg-muted`                  |
| `--color-row-hover`         | List rows                    | `--color-bg-default-hover`        | `--color-bg-muted-hover`            | `--color-bg-default-hover`          | `--color-bg-muted-hover`            |
| `--color-row-pressed`       | List rows                    | `--color-bg-default-pressed`      | `--color-bg-muted-pressed`          | `--color-bg-default-pressed`        | `--color-bg-muted-pressed`          |
| `--color-switch-on`         | Switches                     | `--color-bg-brand-strong`         | `--color-bg-brand-emphasis`         | `--color-bg-brand-emphasis`         | `--color-bg-brand-emphasis`         |
| `--color-switch-on-hover`   | Switches                     | `--color-bg-brand-strong-hover`   | `--color-bg-brand-emphasis-hover`   | `--color-bg-brand-emphasis-hover`   | `--color-bg-brand-emphasis-hover`   |
| `--color-switch-on-pressed` | Switches                     | `--color-bg-brand-strong-pressed` | `--color-bg-brand-emphasis-pressed` | `--color-bg-brand-emphasis-pressed` | `--color-bg-brand-emphasis-pressed` |
| `--color-switch-thumb-on`   | Switches                     | `--color-fg-on-strong`            | `--color-fg-on-emphasis`            | `--color-fg-on-emphasis`            | `--color-fg-on-emphasis`            |

Fixed colors, which no role replaces: write the value, or a custom property of your own that holds it.

| 0.7 custom property     | Used for              | Value                                                                          |
| ----------------------- | --------------------- | ------------------------------------------------------------------------------ |
| `--color-avatar`        | Avatars               | `#9fc1f8`                                                                      |
| `--color-avatar-figure` | Avatars               | `#347eea`                                                                      |
| `--color-canvas-dark`   | Fixed dark page color | `#1e1f21`                                                                      |
| `--color-on-avatar`     | Avatars               | `#004aa2` (light; dark), `#001d49` (light, high contrast; dark, high contrast) |
| `--color-white`         | Fixed white           | `#ffffff`                                                                      |

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
