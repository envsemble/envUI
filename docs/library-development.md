# Extend the shared library

Read this page when a task authorizes changes inside envUI. First inspect [composition](foundations/composition.md), public slots and existing variants. Product-specific wrappers can attach business meaning while shared components continue to own appearance.

## Public API and source ownership

Keep authored components in their existing family under `packages/ui/src`, named React exports in PascalCase files, and shared styles in `src/styles`. Add public exports to `index.ts`, `content.ts` or `rich-text.ts` according to the feature. Applications use those public entries and installed declarations; avoid private component imports, private-DOM selectors and copied component CSS.

The catalogue owns routes, page grids, specimen state and token measurement. Reusable UI behavior belongs in the package. Icons and brand wrappers are generated from their existing pinned inputs.

When a shared capability is missing, identify the required behavior and reusable API. Implement a variant, slot or component when library work is within scope. Otherwise report the concrete gap and preserve functioning product behavior. Keep routing, authorization, validation, preference and persistence in the application.

## One documentation source

Edit the relevant Markdown page under `docs/`; add a focused page when a new topic needs one. Register it in [the index](index.md) beneath its existing family. Each entry has a title, relative path and one-line purpose. The index defines catalogue grouping and reading order. Page titles must match their index entries.

Update the public-API specimen under `apps/catalogue/src/previews` together with its documentation. Keep examples, behavior and contracts in the Markdown page. The build generates the catalogue's internal TypeScript data from these files and copies documentation into the package; edit the maintained Markdown, not generated files.

The two skills contain routing and workflow instructions. Move conditional component details into their owning documentation page. Improve that page when integration reveals a gap rather than adding another guide.

## Record the change

A change that people using envUI notice carries a changeset: a Markdown file in `.changeset/` that names the version bump and holds the changelog entry. Run `npm run changeset`, select `@envsemble/envui` and the bump, and write the entry as it should read in the changelog: what changed for someone using the package and, for a breaking change, how to migrate. Commit it with the change. Tests, tooling and catalogue-only changes need none.

- `major`: a breaking change, such as a removed or renamed component, prop or value.
- `minor`: a new component, prop, variant or token.
- `patch`: a fix that keeps the API.

Describe the pattern rather than the application that needed it: changesets, the changelog and this documentation name no products, and `npm test` rejects them. Releases turn the changesets into the changelog; see the README.

## Verify

Run `npm run verify` at the envUI root. It checks generated icons, types, documentation links, package and offline-catalogue builds, isolated tarball consumers, SSR and browser acceptance.

The browser suite starts or reuses the catalogue on port 8770 and the test fixture on 8766. To run it beside another checkout’s servers, choose free ports, for example `ENVUI_CATALOGUE_PORT=8772 ENVUI_FIXTURE_PORT=8767 npm run test:browser`; a reused server on the default ports would otherwise serve the other checkout’s code.

Exercise meaningful interaction changes in both themes, with keyboard focus and dismissal, native form submit/reset, narrow containers and enlarged text. Check portals, wrapping and local scrolling where affected. Inspect bundle boundaries when optional content or icon imports change.

Validate both skill folders with the available skill validator after editing them. Report changes, checks and remaining gaps.
