---
name: envui-use
description: Build and modify React interfaces using @envsemble/envui. Use for envUI component selection, themes, layouts, forms, icons, feedback, content editing and shared library extensions. For a project-wide migration, also use envui-migrate.
---

# Build with envUI

Use envUI's public components and visual rules to implement the requested interface. Keep routing, product data, authorization, validation, theme preference and persistence in the application.

## Establish the available contract

Locate `@envsemble/envui` in the application's manifest and lockfile, then inspect its installed `package.json` and exports. Use the skills and TypeScript declarations bundled with that version. If these skills came from another version, obtain the matching files before relying on their examples. For an authorized local library change, inspect the checkout's public exports and source instead.

The references below are the single maintained source for component guidance and the visual catalogue. Read only the relevant files or topics. They are TypeScript data containing code examples, prop contracts and design guidance; applications do not import them.

| Task                                             | Reference                                   |
| ------------------------------------------------ | ------------------------------------------- |
| Private registry, first component                | [Setup.ts](references/Setup.ts)             |
| Theme, typography, spacing, icons, accessibility | [Foundations.ts](references/Foundations.ts) |
| Layout, surfaces, cards, connected rows          | [Layout.ts](references/Layout.ts)           |
| Buttons, icon actions, links                     | [Actions.ts](references/Actions.ts)         |
| Fields, color picker and selection               | [Forms.ts](references/Forms.ts)             |
| Navigation items, tabs, direction links          | [Navigation.ts](references/Navigation.ts)   |
| Code, Markdown and source editing                | [Content.ts](references/Content.ts)         |
| Rich text and application references             | [RichText.ts](references/RichText.ts)       |
| Dialogs, toasts, loading and empty states        | [Feedback.ts](references/Feedback.ts)       |
| Root composition and product wrappers            | [Composition.ts](references/Composition.ts) |

Read installed declarations for exact props, callbacks and union types. Do not invent exports, assume another framework's props work, or import private component files. If the package is absent, select the intended release before installation; a migration can use the local workflow in `envui-migrate`.

## Connect the package

Configure `@envsemble` registry routing and an environment-based token as shown in Setup.ts. Local developers need a classic GitHub token with `read:packages` and package access. GitHub Actions can use the consuming repository's `GITHUB_TOKEN` after package Read access is granted, with `packages: read`. Keep real tokens out of committed files.

Import `@envsemble/envui/styles.css` once in the client entry. It includes Inter and scopes styling to `.env-theme`; place UI inside `<Theme theme={theme}>`. The application supplies `light` or `dark` and owns preference/persistence. A document theme attribute alone does not provide envUI's React context. Library dialogs, selects and managed toasts retain their originating theme through portals. Give application-owned portal content an appropriate Theme boundary too.

Use public entries:

- `@envsemble/envui` for ordinary UI.
- `@envsemble/envui/icons/Name` for each official symbol the application uses.
- `@envsemble/envui/content` for Code, CodeBlock, Markdown and MarkdownEditor.
- `@envsemble/envui/rich-text` for RichTextEditor, RichText and the shared extension factory.
- `@envsemble/envui/assets/*` for exported raw assets.

Keep optional content/editor imports with the features that need them. Do not load the complete icon catalogue to select a small application subset at runtime. Custom React icons are supported; icon-only controls need accessible names.

## Compose the interface

Start with public components. Surface owns background, padding and corners; Stack owns vertical layout; ActionGroup owns related actions; Card composes surface and content layout. Use `render` on supporting components when layers should share one root. Put semantic tags on the composed root, and forward native props, className, style, children and ref from custom render components.

Use Text's shared variants and choose its semantic element independently. Applications own page grids and breakpoints. Use relative units, shared tokens, shrinkable grid/flex children and content-driven heights. Let labels/actions wrap; keep wide tables/code in local scroll regions. Ordinary actions are neutral; purple emphasis is rare. Change shared primitive styling centrally in envUI when library work is in scope.

Preserve native semantics: destinations use anchors, actions use buttons, fields keep labels and form participation. Button, Link and NavigationItem support native links. Use the router's supported adapter or native-link interception, preserving href, modified clicks, external destinations, history and accessible names. Avoid nested anchors/buttons and onClick-only destination controls.

Check actual component contracts when connecting state:

- Input/Textarea use native change events. Select/RadioGroup report values; Select can report `null`. Checkbox reports boolean selection and can display `mixed`; Switch reports boolean selection. Preserve name, form, required, disabled, readOnly and refs where supported.
- The application owns validation. Use field hint/error props and retain controlled/uncontrolled behavior and native form reset.
- Dialog owns focus and dismissal. Use its public open/onOpenChange, trigger, title, description, actions and focus props. Preserve pending-operation dismissal restrictions and restored-focus targets.
- Place ToastProvider at a stable themed application boundary and use useToast for managed notices. Use additional providers only for intentionally separate lifecycles. Durations measure visible time; persistent/action notices need deliberate dismissal.
- Keep loading, empty, failure and success states distinct. Static specimens should not announce live notifications.

Choose MarkdownEditor for literal Markdown source and RichTextEditor for formatted editing. RichText uses the matching schema. Applications supply saving, uploads, reference lookup and navigation. Preserve stable reference IDs and match custom extensions between editor/viewer. Rich-text Markdown normalizes source and supports a subset: raw HTML, merged cells and block-rich tables need explicit compatibility decisions before converting stored content.

## Handle a missing capability

Inspect composition and public slots first. Product-specific wrappers can attach business meaning while shared components own appearance. If behavior needs a reusable API/variant, identify the gap and implement it in envUI when that is within the task; otherwise report the concrete gap and preserve unrelated product behavior. Avoid private-DOM selectors, copied library CSS and parallel implementations presented as envUI components.

Inside envUI, keep authored components in their existing family under `packages/ui/src`, exports in `index.ts`, `content.ts` or `rich-text.ts`, and styles in `src/styles`. Use PascalCase files, named React exports and shared primitive composition. Update this skill's relevant reference and the public-API specimen under `apps/docs/src/previews` together; register new topics when needed. Icons/brand wrappers are generated from existing pinned inputs. The catalogue owns routes, page grids, specimen state and token measurement; reusable UI behavior belongs in the package.

## Verify

Run the consumer's applicable types/build/tests. For meaningful interaction/layout changes, use a real browser: both themes, keyboard focus/dismissal, form submit/reset/error states, narrow containers and enlarged text. Check portals, wrapping and local scrolling where affected. Inspect bundle boundaries when optional content/icon imports change.

For library changes, run `npm run verify` at the envUI root, including isolated tarball, SSR and browser acceptance. Validate both skill folders with the available skill validator after editing them. Report the adopted version, changes, checks and concrete gaps. Improve these instructions from observed integrations, keeping each rule with its owning reference instead of adding another agent guide.
