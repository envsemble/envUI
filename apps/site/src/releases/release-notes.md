# Release notes

<!--
The highlights on the Docs' Changelog page: one entry per release of @envsemble/envui, newest
first, each with up to five highlights in plain sentences and a short list of breaking changes. Each
breaking change links to its release's entry in the full changelog below them, /docs/changelog#….
scripts/site/ReleaseNotes.ts reads and checks this file; the full changelog is packages/ui/CHANGELOG.md.

## <version> — <YYYY-MM-DD, or Upcoming>
- A highlight.
### Breaking changes
- A change, [with a link to its entry](/docs/changelog#release).
-->

## 1.0.0-prerelease.5 — 2026-11-12

- [The last prerelease](/docs/changelog#100-prerelease5--2026-11-12) before 1.0: components, parts, state attributes and tokens take the names 1.0 keeps, each kind after one grammar.
- Every component has a style sheet of its own, and code that only an option uses loads where the option is set.
- Popups give focus back as they start to close, so a key pressed during the fade is not lost.
- The website draws every page ahead of time, so the catalogue and the Docs show at once.
