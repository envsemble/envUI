# Changesets

Each other Markdown file here is a pending changelog entry, written with `npm run changeset`, for `@envsemble/envui` or the packages released with it: the codemods, `@envsemble/envui-codemods`, and the lint packages, `@envsemble/eslint-plugin-envui` and `@envsemble/stylelint-config-envui`. The four are a fixed group in `config.json`: they always share one version. `npm run changeset:version` turns the entries into that next version and its section of each named package's `CHANGELOG.md`, such as `packages/ui/CHANGELOG.md`. `pre.json` keeps versions on the `next` prerelease line until `npx changeset pre exit`.

See "Record the change" in `docs/library-development.md` and "Releases" in `CONTRIBUTING.md`.
