# Changesets

Each other Markdown file here is a pending changelog entry, written with `npm run changeset`, for `@envsemble/envui` or the lint packages released with it, `@envsemble/eslint-plugin-envui` and `@envsemble/stylelint-config-envui`. The three are a fixed group in `config.json`: they always share one version. `npm run changeset:version` turns the entries into that next version and its section of each named package's `CHANGELOG.md`, such as `packages/ui/CHANGELOG.md`. `pre.json` keeps versions on the `prerelease` line, such as `1.0.0-prerelease.0`, until `npx changeset pre exit`; meanwhile the entries a prerelease applied wait in `pre/`.

See "Record the change" in `docs/library-development.md` and "Releases" in `CONTRIBUTING.md`.
