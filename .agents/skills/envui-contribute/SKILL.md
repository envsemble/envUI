---
name: envui-contribute
description: When envUI lacks a component, variant, prop or token that an interface needs, propose and add it to envUI upstream instead of keeping a local copy in the application.
---

# Add what envUI lacks

1. **Confirm the gap.** `search` and `plan` in several wordings, including the names other design systems use. Read the closest components' `avoidWhen` and `docs/foundations/composition.md`: an existing variant, slot or composition may already cover it.
2. **Describe the addition.** State the behavior, the states, the keyboard and screen-reader contract, and the API in envUI's vocabulary (`tone`, `variant`, `size`, as on the existing pages). Name it with established terms: WAI-ARIA and HTML first, then the major React libraries. Describe the pattern, never the product that needs it.
3. **Without authorization to change envUI,** open an issue in the envUI repository, https://github.com/envsemble/envUI/issues, with that description. Meanwhile, compose the closest envUI parts in the application with a comment linking the issue; don't copy envUI's CSS or classes.
4. **With authorization,** work in an envUI checkout and follow `docs/library-development.md`:
   - the component in its family under `packages/ui/src`, exported from its public entry, with TSDoc on every prop;
   - its page, `docs/components/<name>.md`, as `docs/component-pages.md` describes: frontmatter with summary, status, since, aliases, `useWhen` and `avoidWhen`, the template sections, and examples as files in `apps/catalogue/src/examples/<page>/`; register it in `docs/index.md`;
   - `npm run docs:props` and `npm run docs:manifest`, then commit `docs/generated/`;
   - a changeset from `npm run changeset`: `minor` for an addition;
   - `npm run check` after each change and `npm run check:affected` before committing; `npm run verify` before a release or a merge into `dev` or `main`.
5. **Adopt it.** Co-develop through `docs/local-development.md` if the application needs it before a release. Once it is released, pin that version, replace the interim composition and run `npx --no envui agents`.

For using envUI as it is, see [envui-use](../envui-use/SKILL.md).
