<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/brand/envUI/envUI-lockup-white.svg">
  <img src="assets/brand/envUI/envUI-lockup-black.svg" alt="envUI" width="240">
</picture>

**The shared interface library for envsemble.**

[![CI](https://github.com/envsemble/envUI/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/envsemble/envUI/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-149eca)
![Node.js 22.13+ or 24+](https://img.shields.io/badge/Node.js-22.13%2B%20%7C%2024%2B-417e38)
![Private package](https://img.shields.io/badge/GitHub_Packages-private-6e40c9)

envUI brings consistent themes, composition and interaction to React applications: from a button or a native form to dialogs, notifications and rich text. It ships as a private ESM package with TypeScript declarations, local fonts, icons and documentation that people and coding agents read alike.

[Set up](docs/setup.md) · [Move an app to envUI](docs/migration.md) · [Changelog](packages/ui/CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/catalogue-dark.png">
  <img src="assets/readme/catalogue-light.png" alt="The Button page of the envUI catalogue, with its navigation, its examples and the page's contents" width="1440">
</picture>

## What’s inside

- **Foundations:** scoped light, dark and high-contrast themes, design tokens, Geist, typography, spacing and density, surfaces and layout primitives.
- **Everyday interactions:** actions, navigation, native form controls, selection, color picking, dialogs and toasts, with Base UI underpinning complex interactions.
- **Patterns:** forms and validation, settings, app frames, conversations and more, each composed from the components.
- **Content tools:** Markdown, code highlighting and Tiptap rich text on separate entry points.
- **Local assets:** Geist and the official Material Symbols Rounded icons, with no font or icon CDN required.
- **Dev mode:** a page's layout described and checked as text for agents, and taken apart in 3D for people, from its own entry point, `@envsemble/envui/dev`.
- **A website in two parts:** the catalogue shows each component, pattern and foundation to people, and the Docs at `/docs` are the developer reference: setup, guides, props, part names and the changelog. Each page links to its counterpart in the other part.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/readme/docs-dark.png">
  <img src="assets/readme/docs-light.png" alt="The Button page of the envUI Docs, with its navigation, its code and the page's contents" width="1440">
</picture>

## Versions and license

Published versions are immutable; breaking changes come in a new major version. Prereleases are published under their own name as the dist-tag, such as `prerelease` for `1.0.0-prerelease.4` (`npm install @envsemble/envui@prerelease`), and stable releases under `latest`.

envUI is proprietary and distributed privately. Bundled third-party assets and dependencies retain their [notices](packages/ui/THIRD_PARTY_NOTICES.md) and [licenses](packages/ui/licenses/).
