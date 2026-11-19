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

envUI gives B2B SaaS products and AI developer tools one consistent interface: themes and components, from a button or a form to an app frame, a data table or a conversation with an agent. Its documentation is written for the people and the coding agents who build with it, and ships in the package.

[Website](https://envui.envsemble.com) · [Docs](https://envui.envsemble.com/docs) · [Changelog](packages/ui/CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/overview-dark.png">
  <img src="assets/readme/overview-light.png" alt="The overview of the envUI website: its banner, with Get started beside the install command, over a fan of cards built with envUI: a pull request, a conversation with an assistant, a heatmap of deploys and a calendar" width="1440">
</picture>

## Get started

Install it from npm with `npm install --save-exact @envsemble/envui`. [Install and set up](https://envui.envsemble.com/docs/setup) walks through the rest: styles, theme and router. A coding agent can do the setup with you from one prompt:

```text
Set up envUI in my app: envui.envsemble.com/SKILL.md
```

## What’s inside

- **Foundations:** light, dark and high-contrast themes, design tokens, typography, spacing and density.
- **Components:** actions, navigation, native form controls, selection, data display, dialogs and notifications, with Base UI under the complex interactions.
- **Content:** Markdown, code highlighting and diffs, on entry points of their own.
- **Local assets:** the Geist fonts and Material Symbols Rounded icons ship in the package, with no CDN.
- **Lint rules:** an [ESLint plugin and a Stylelint config](https://envui.envsemble.com/docs?section=lint-rules) that name the envUI component or token to use instead of hand-built controls and raw colors.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/gallery-dark.png">
  <img src="assets/readme/gallery-light.png" alt="The components gallery of the envUI website: a live tile for each component, grouped by what it is for, starting with the actions: Button, Link, Toolbar, Menu, Menubar and CommandPalette" width="1920">
</picture>

## Documentation

The [website](https://envui.envsemble.com) has two parts. The catalogue shows every foundation and component, live. The [Docs](https://envui.envsemble.com/docs) are the developer reference: setup, guides, props, part names and the changelog. The same pages ship in the package under `docs/`, so an agent reads the ones for the version it has installed.

## Contributing

To work on envUI itself, start with [CONTRIBUTING.md](CONTRIBUTING.md).

## Versions and license

A published version never changes, and each release lists its breaking changes in the changelog. Prereleases are published under the `prerelease` dist-tag, and stable releases under `latest`.

envUI is open source under the [MIT license](LICENSE). It covers the code, not the envUI name or logos, which remain envsemble's. Bundled third-party assets and dependencies keep their [notices](packages/ui/THIRD_PARTY_NOTICES.md) and [licenses](packages/ui/licenses/).
