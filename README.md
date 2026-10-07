# envUI

Private React 19 component library for envsemble. Includes ESM, TypeScript declarations, scoped light/dark styles, Inter, icons and branding.

## Agent skills

- [envui-use](.agents/skills/envui-use/SKILL.md): build and modify interfaces with envUI, including component selection, composition and library extensions.
- [envui-migrate](.agents/skills/envui-migrate/SKILL.md): migrate existing React interfaces while preserving application behavior.

These skills own the implementation guidance. The visual catalogue consumes the usage skill's component references. Public TypeScript declarations define the exact API for the installed version.

The npm package includes both skills under `skills/`. Install their folders into the consuming project's `.agents/skills` using your agent's skill installer, or copy them from `node_modules/@envsemble/envui/skills`. Update both folders from the same package version when upgrading. Skill installation is explicit; npm installation does not register them automatically.

## Install

Configure private GitHub Packages access for the `@envsemble` scope, then install the chosen release:

```sh
npm install --save-exact @envsemble/envui@<version>
```

React and React DOM 19 are peer dependencies. Registry configuration, the first component and public entry points are in `envui-use`.

## Develop and verify

Requires Node.js 24 or newer. From the repository root:

```sh
npm ci
npm run dev
```

The visual catalogue opens at http://127.0.0.1:8770 and consumes the live library. `npm run dev:library` watches compiled exports for a linked external application.

```sh
npx playwright install chromium firefox webkit
npm run verify
```

Verification checks icons, types, builds, isolated package consumers and browser behavior. `npm run build` produces `packages/ui/dist` and the self-contained offline catalogue at `dist/envUI.html`.

## Release

Align the version in `packages/ui/package.json`, `apps/docs/package.json` and the lockfile; update `packages/ui/CHANGELOG.md`. After verification, review and merge, push the matching `v<version>` tag. The Release workflow publishes privately to GitHub Packages and attaches the matching offline HTML. Prereleases use `next`; ordinary releases use `latest`. Published versions are immutable. If only the HTML upload fails, recover it from the same tag without republishing the package.

Grant consuming repositories package Read access for their GitHub Actions workflows. During `0.x`, breaking changes require a new minor version and migration notes; after `1.0`, a new major version.

Third-party notices and licenses are retained in `packages/ui/THIRD_PARTY_NOTICES.md` and `packages/ui/licenses/`.
