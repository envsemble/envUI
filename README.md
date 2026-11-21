<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/envUI/envui-horizontal-on-dark.svg">
  <img src="assets/brand/envUI/envui-horizontal-on-light.svg" alt="envUI" width="240">
</picture>

**A React design system for clear, accessible interfaces.**

[![Verify](https://github.com/envsemble/envUI/actions/workflows/verify.yml/badge.svg?branch=dev)](https://github.com/envsemble/envUI/actions/workflows/verify.yml)
![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript types included](https://img.shields.io/badge/TypeScript-types_included-3178c6?logo=typescript&logoColor=white)
![Node.js 22.13+ or 24+](https://img.shields.io/badge/Node.js-22.13%2B_%7C_24%2B-417e38?logo=nodedotjs&logoColor=white)
[![npm](https://img.shields.io/npm/v/@envsemble/envui?logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/@envsemble/envui)
![MIT license](https://img.shields.io/badge/license-MIT-555)

[Website](https://envui.envsemble.com) · [Docs](https://envui.envsemble.com/docs) · [Changelog](packages/ui/CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/overview-dark.png">
  <img src="assets/readme/overview-light.png" alt="The overview of the envUI website: its banner, with Get started beside the install command, over a fan of cards built with envUI: a pull request, a conversation with an assistant, a heatmap of deploys and a calendar" width="1440">
</picture>

## Get started

```bash
npm install --save-exact @envsemble/envui
```

[Install and set up](https://envui.envsemble.com/docs/setup) covers styles, theme and router. Or let a coding agent do it:

```text
Set up envUI in my app: envui.envsemble.com/SKILL.md
```

## What’s inside

- **Themes:** light, dark and high contrast, with design tokens for type, spacing and density.
- **Components:** from buttons and forms to app frames, data tables and agent conversations, with Base UI under the complex interactions.
- **Content:** Markdown, code highlighting and diffs, on entry points of their own.
- **No CDN:** the Geist fonts and Material Symbols Rounded icons ship in the package.
- **Docs in the package:** under `docs/`, so an agent reads the ones for the version it has installed.
- **Lint rules:** an [ESLint plugin and a Stylelint config](https://envui.envsemble.com/docs?section=lint-rules) that point to the envUI component or token instead of hand-built controls and raw colors.

## License

[MIT](LICENSE), for the code; the envUI name and logos remain envsemble’s. Bundled third-party assets keep their [notices](packages/ui/THIRD_PARTY_NOTICES.md) and [licenses](packages/ui/licenses/).
