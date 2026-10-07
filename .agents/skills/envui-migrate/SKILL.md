---
name: envui-migrate
description: Migrate an existing React application or selected UI area to @envsemble/envui. Use when replacing another component library, duplicated design-system CSS or homegrown controls with envUI while preserving routing, forms, themes and application behavior.
---

# Migrate an interface to envUI

Use [envui-use](../envui-use/SKILL.md) for the shared API, composition and design rules. Keep those rules there; this skill owns migration work. Both skills ship together.

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

Use React 19 and inspect envUI's peers/exports. Upgrade framework dependencies only as required by the authorized migration. Select an exact envUI release, retain its lockfile and use matching bundled skills. Follow envui-use for registry access, CSS, themes and entry points.

For co-development with an authorized local envUI checkout:

1. Run `npm ci` in envUI.
2. Temporarily link `npm install <path-to-envUI>/packages/ui --install-links=false` from the application, adjusting the path.
3. Run `npm run dev:library` in envUI to build/watch normal public exports.
4. For Vite, deduplicate `react`/`react-dom` and exclude `@envsemble/envui` from optimizeDeps. Merge these settings while preserving existing plugins and configuration.
5. Use ordinary public imports. Before delivery, restore the agreed registry version and lockfile. Also validate the packaged consumer path.

Connect Theme to the current preference and first-render initialization. Scope old/new styles deliberately during coexistence. Check inherited tokens/cascade on migrated controls and vendor widgets. Retain vendor theme providers and portal styling where required.

## Migrate by responsibility

Prefer a small complete slice with shared controls and representative interactions, then expand through callers. The first slice should expose routing, forms or overlays rather than only a static button. Choose an order that fits the application; shared wrappers can reduce repetition when their contract still fits.

Inspect envui-use's relevant references before adopting these candidates:

| Existing responsibility                          | Candidate                                             |
| ------------------------------------------------ | ----------------------------------------------------- |
| Typography, panes, vertical layouts, action rows | Text, Surface, Stack, ActionGroup                     |
| Buttons, inline links, icon/connected actions    | Button, Link, IconButton, ButtonGroup                 |
| Side navigation and selected destinations        | NavigationItem with router-owned selection            |
| Content/action/clickable cards                   | Appropriate public Card composition                   |
| Fields and choices                               | Input, Textarea, Select, Checkbox, RadioGroup, Switch |
| Modal/inspector shells, notifications            | Dialog, ToastProvider/useToast                        |
| Loading and empty results                        | LoadingState, Skeleton, EmptyState                    |
| Source, Markdown, formatted editing              | Optional content or rich-text entry                   |

Port behavior explicitly instead of mechanically translating props. Preserve labels, accessible names, href/router state, callback payloads, refs, form names/reset, focus restoration and mutation timing. Check button types inside forms, pending-operation dismissal rules and draft state through dialogs/navigation.

Keep vendor dependencies with remaining consumers. WorkOS widgets can require Radix Themes as a peer even after application-owned Radix controls migrate. Inspect the installed widget manifest and behavior. Scope its CSS/theme to the widget area and adapt tokens through supported configuration or narrowly scoped existing styles.

Identify gaps early: dropdown/organization menus, avatars, tables or other features may lack a direct envUI export. Compose public primitives only when they preserve the interaction. Retain a functioning implementation for unmigrated features and report gaps; avoid incomplete imitations and silent behavior loss. Shared library additions require envUI work to be in scope.

Treat stored rich text as a data contract. Check representative documents, references, images and tables before switching editors/serializers. Preserve source editing when normalization would change the product's promise. Do not rewrite persisted content as an incidental UI migration.

## Remove obsolete implementation after replacement

Search remaining imports/callers, styles, assets, vendor peers and generated tooling before deleting dependencies, providers, resets, fonts or icon pipelines. Remove obsolete wrappers/CSS once their responsibilities are covered. Preserve application layouts and vendor styles. Update existing project instructions that point to retired UI owners.

For partial migrations, identify migrated/retained areas and concrete gaps in the task or PR. Dependency installation alone is not a completed migration. Keep guidance improvements in these skills.

## Validate and hand over

Run established application checks and production builds, including deployment dry runs when they are normal verification. Exercise affected journeys in a browser: both themes, keyboard interaction, narrow portrait/landscape containers, expanded/collapsed navigation where present, and enlarged text. Check portal focus/theme, form submit/reset/validation, links and vendor widgets.

Use meaningful existing tests; update assertions intentionally tied to replaced markup. Add focused coverage for behavior at risk. Run envUI acceptance for library additions. Confirm the final manifest/lockfile uses the intended package rather than a machine-specific link.

Report the adopted version, completed scope, checks, retained dependencies and unresolved gaps. Turn integration issues into targeted edits to envui-use or this workflow; do not add another usage or migration guide alongside them.
