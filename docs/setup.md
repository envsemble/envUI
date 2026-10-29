---
components:
  - EnvUIProvider
  - useLocale
  - LinkProvider
  - PortalContainer
  - createThemeBootstrapScript
  - Theme
  - ThemePreferenceProvider
  - ThemeToggle
  - useTheme
  - useThemePreference
statuses: # Never released before 1.0, so beta until a release has used them.
  useLocale: beta
  PortalContainer: beta
exportAliases:
  EnvUIProvider:
    - i18n
    - internationalization
    - localization
    - translations
    - messages
    - locale
    - right to left
    - RTL
  useLocale:
    - current locale
  ThemeToggle:
    - theme switcher
    - dark mode toggle
    - dark mode switch
    - light and dark switch
    - switch between light and dark
  ThemePreferenceProvider:
    - theme preference
    - persisted theme
  LinkProvider:
    - router link
    - client-side navigation
  PortalContainer:
    - portal container
    - shadow root
    - iframe
    - overlay preview
aliases:
  - install
  - quick start
  - get started
  - getting started
  - agents
  - coding agents
  - AI agents
  - AGENTS.md
  - SKILL.md
  - setup skill
  - lint rules
---

# Install and set up

envUI is a package of React components and design tokens for React and React DOM 19. Install an exact version and read the docs shipped with it.

## Registry access

envUI is published to GitHub Packages for now, so npm needs its registry and a token:

```ini
# Project .npmrc
@envsemble:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Locally, `NODE_AUTH_TOKEN` is a classic GitHub token with `read:packages`; in GitHub Actions, the repository's `GITHUB_TOKEN` with `packages: read`, once it has Read access to the package. Keep real tokens out of committed files.

## Install a release

```sh
npm install --save-exact @envsemble/envui@<version>
```

Upgrade `@envsemble/envui` and the [lint packages](#lint-rules) together, to the same exact version.

## Connect styles and theme

```tsx
import { Theme, Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export function App() {
  return (
    <Theme theme="light">
      <Button startIcon={<Add />}>Create item</Button>
    </Theme>
  );
}
```

Put the UI inside `Theme`: a theme attribute on the document alone gives no React context. The styles include Geist and sit in the `env` cascade layer: [cascade layers](customizing.md#cascade-layers) says how the application's CSS and resets take their place around it, and [colors and themes](foundations/colors.md) covers nested themes, portals and high contrast.

### Styles come with the components

Each component's module imports its own style sheet, after the base every component shares: the layer order, the tokens, the theme and the font. A bundler that loads CSS from dependencies, such as Vite, Next.js, webpack with a CSS loader or esbuild, puts in the page what the application's modules import, so the page loads the CSS of the components it uses.

- **Without a bundler**, import `@envsemble/envui/styles.css` once, in the client entry: it holds every component's styles. Don't import it as well as the components' own: the styles would load twice.
- **In Node**, as when a server renders or tests run without a bundler, the same modules load without their CSS: the package's style sheet imports resolve to an empty module under the `node` condition, and only a bundler, which sets the `module` condition, loads the CSS. Server-rendered pages get their CSS from the client bundle, or from the framework that collects it, as Next.js does.
- **Next.js** with webpack keeps only the style sheets a page uses when `experimental.optimizePackageImports` lists `@envsemble/envui`.

### Theme preference

For a whole application, `ThemePreferenceProvider` replaces the fixed `Theme`. It follows the system theme until the user picks one with `ThemeToggle`, stores that choice, applies a choice made in another window of the same origin, and themes the document root, so the page background, native controls, other libraries' portals and `<meta name="theme-color">` match.

- **Type.** The root keeps the browser's font size, so 1 rem stays the reader's. To change envUI's typeface, size or line height, set `--env-font-family`, `--env-font-size-body` and `--env-line-height-body` for `.env-theme` in a style sheet loaded after envUI's, not in a `body` rule.
- **Contrast and scale.** `contrast` is `high`, `standard` or `system`. Left out, the provider takes a surrounding `Theme`'s, and else follows `prefers-contrast: more`, keeping a `data-env-contrast` the page set on the root; `scale` does the same, else comfortable. The provider marks the contrast it writes with `data-env-contrast-source`; a page that keeps a contrast of its own on the root removes that attribute.
- **One per document.** A second provider, such as for a section with a preference of its own, passes `applyToDocument={false}`; envUI warns in development about two. Unmounted, a provider removes the contrast and scale it wrote.

```tsx
import { ThemePreferenceProvider, ThemeToggle } from '@envsemble/envui';

<ThemePreferenceProvider storageKey="app-theme">
  <ThemeToggle />
</ThemePreferenceProvider>;
```

Add the bootstrap script to the document head so a saved dark theme does not flash light while the application loads. `createThemeBootstrapScript` from `@envsemble/envui/theme-bootstrap` returns the inline script; use the same storage key as the provider:

```ts
// vite.config.ts
import { createThemeBootstrapScript } from '@envsemble/envui/theme-bootstrap';

const themeBootstrap = {
  name: 'theme-bootstrap',
  transformIndexHtml: () => [
    {
      tag: 'script',
      children: createThemeBootstrapScript({ storageKey: 'app-theme' }),
      injectTo: 'head-prepend',
    },
  ],
};
```

An application that renders `<html>` with React adds `suppressHydrationWarning` to it, since the script sets the root's attributes before React hydrates:

```tsx
<html lang="en" suppressHydrationWarning>
```

Where the application's contrast is fixed, pass it to both, `contrast: 'high'` to the script and `contrast="high"` to the provider, so the first paint has it. Where it is a setting the application stores, leave it out of the script: the provider applies it as the application starts.

## Connect your router

Destinations in envUI render native anchors: Button and Link with `href`, NavigationBar, NavigationRail and NavigationDrawer destinations, Card, Pager, Breadcrumbs and Menu.Item. Register the router's link once with `LinkProvider`, around the application, so they navigate on the client. The component gets native anchor props with a string `href`, and renders an anchor with them and the ref:

```tsx
<LinkProvider component={RouterLink}>{app}</LinkProvider>
```

Each recipe is a client module of the application's own: a `RouterLink` and a `RouterLinks` provider to render around the application.

### TanStack Router

Paths inside the application go through the router's `Link`; other addresses, such as `mailto:`, stay plain anchors. TanStack types `to` by the registered routes, so the recipe asserts the path's type, and the search reaches each route as strings, a repeated key as an array, for its `validateSearch` to parse.

```tsx recipe
import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { LinkProvider, type LinkComponentProps } from '@envsemble/envui';

function RouterLink({ href, ...props }: LinkComponentProps) {
  if (!href.startsWith('/') || href.startsWith('//')) return <a href={href} {...props} />;
  // Any origin will do: it only splits the path, the search and the hash.
  const url = new URL(href, 'https://application.invalid');
  // A key given more than once, such as ?tag=a&tag=b, keeps all its values.
  const search: Record<string, string | string[]> = {};
  for (const key of new Set(url.searchParams.keys())) {
    const values = url.searchParams.getAll(key);
    search[key] = values.length === 1 ? values[0]! : values;
  }
  return (
    <Link
      {...props}
      to={url.pathname as LinkProps['to']}
      search={search}
      hash={url.hash.slice(1) || undefined}
    />
  );
}

export function RouterLinks({ children }: { children: ReactNode }) {
  return <LinkProvider component={RouterLink}>{children}</LinkProvider>;
}
```

### React Router

React Router's `Link` renders addresses outside the application as plain anchors itself.

```tsx recipe
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { LinkProvider, type LinkComponentProps } from '@envsemble/envui';

function RouterLink({ href, ...props }: LinkComponentProps) {
  return <Link to={href} {...props} />;
}

export function RouterLinks({ children }: { children: ReactNode }) {
  return <LinkProvider component={RouterLink}>{children}</LinkProvider>;
}
```

### Next.js App Router

`next/link` takes the anchor's props and prefetches the destinations in view. The provider is a client component, so it goes in a module with `'use client'`, which the root layout renders around its children.

```tsx recipe
'use client';

import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { LinkProvider, type LinkComponentProps } from '@envsemble/envui';

function RouterLink(props: LinkComponentProps) {
  return <NextLink {...props} />;
}

export function RouterLinks({ children }: { children: ReactNode }) {
  return <LinkProvider component={RouterLink}>{children}</LinkProvider>;
}
```

### A router on the History API

A router on `history.pushState` takes a plain press on a link to one of its pages and leaves the browser the rest: modifier keys, other buttons, `target`, `download` and other origins. `navigate` is the router's own function.

```tsx recipe
import type { ReactNode } from 'react';
import { LinkProvider, type LinkComponentProps } from '@envsemble/envui';

declare function navigate(path: string): void;

function HistoryLink({ onClick, ...props }: LinkComponentProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if ((props.target && props.target !== '_self') || props.download !== undefined) return;
        const url = new URL(props.href, location.href);
        if (url.origin !== location.origin) return;
        event.preventDefault();
        navigate(url.pathname + url.search + url.hash);
      }}
    />
  );
}

export function RouterLinks({ children }: { children: ReactNode }) {
  return <LinkProvider component={HistoryLink}>{children}</LinkProvider>;
}
```

## Locale, strings and direction

envUI works without setup in English, in the runtime's locale and in each element's direction. To translate or format for its people, an application wraps itself or a region in `EnvUIProvider`, here in a client component, where `t` is its translation function:

```tsx
'use client';

import { EnvUIProvider } from '@envsemble/envui';
import type { ReactNode } from 'react';

export function Localized({ children }: { children: ReactNode }) {
  return (
    <EnvUIProvider
      locale="de-CH"
      messages={{
        common: { loading: 'Wird geladen' },
        combobox: { clear: 'Leeren' },
        toast: { hidden: ({ count }) => t('notifications.hidden', { count }) },
      }}
      dir="ltr"
    >
      {children}
    </EnvUIProvider>
  );
}
```

- `locale` is the BCP 47 tag envUI formats numbers, dates and relative times in. Without it, the server and the first client render use `en-GB`, so their markup matches, and the browser's locale applies once the page has hydrated. `useLocale()` returns the provider's locale, to format in step with envUI.
- `messages` overrides envUI's built-in strings, per namespace, one per component family, such as `common`, `toast` or `pagination`. A message is a string, or a function of the values it names, so any translation library plugs in. Nested providers merge per namespace, the inner winning, and a component's own label prop, such as `closeLabel`, wins over both. `defaultMessages` from `@envsemble/envui/messages` lists every namespace and key with its English default, for extracting them.
- `dir` sets the direction for keyboard and placement logic, such as which arrow key moves forward. Without it, components read the direction at their element. It doesn't set the `dir` attribute: set that on the page or the region.

The provider is a client component: a server component can render it with string messages, but function messages, which can't cross to the client, come from a client component of the application's own, as above. The provider compares `messages` per namespace, so an inline object costs nothing while its strings and functions stay the same; define message functions once, outside the component or with `useMemo`.

## Render overlays elsewhere

Popups, menus, tooltips, dialogs, sheets and toasts render in a portal at the end of the body. `PortalContainer` renders them into another element instead, such as one in a shadow root or an iframe, where its styles reach them:

```tsx
'use client';

import { PortalContainer } from '@envsemble/envui';
import { useState, type ReactNode } from 'react';

export function Preview({ children }: { children: ReactNode }) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return (
    <div style={{ position: 'relative', contain: 'layout', containerType: 'inline-size' }}>
      <PortalContainer container={layer} contained>
        {children}
      </PortalContainer>
      <div ref={setLayer} />
    </div>
  );
}
```

- `container` is the element they render into. Pass `null` while it mounts, as above: they wait for it.
- `contained` keeps them inside the container, for a preview with its overlays open, such as `defaultOpen` on a Menu.Root: nothing locks scroll, traps or takes focus, or hides the page; popups open on their own side at their content's size; and a press or <kbd>Esc</kbd> elsewhere doesn't close them.
- Give the container layout containment, as above, so dialogs, sheets and toasts sit inside it, and it or an ancestor `container-type: inline-size`, which bounds a popup's width. Make it `inert` where it is only a picture.

## React Server Components

envUI works with React Server Components, from the same entry points, which carry no directive:

- Components with state, effects, context or Base UI interactions are client components, with `'use client'`: `Theme`, `Dialog`, `Menu.Root` and its parts, `Table.Root`, the form fields, and icons that follow a selection's fill.
- Components that only lay out markup, such as `Card`, `Badge`, `Text`, `Button`, `Alert` and `List.Item`, render on the server and send no code.
- Plain functions, such as `createThemeBootstrapScript` and `formatRelativeTime`, run on the server.

A server component passes a client component only serializable values, no functions: event handlers, render props, formatting callbacks and hooks such as `useTheme` and `useToast` belong in a client component of the application's own.

## Public entry points

- `@envsemble/envui` for ordinary UI.
- `@envsemble/envui/icons/Name` for individual official symbols.
- `@envsemble/envui/content` when the feature needs code or Markdown.
- `@envsemble/envui/diff` when the feature shows code diffs.
- `@envsemble/envui/rich-text` when the feature needs formatted editing or rendering.
- `@envsemble/envui/color` when the feature chooses or shows colors: [ColorPicker, ColorPickerButton and ColorSwatch](components/color-picker.md).
- `@envsemble/envui/messages` for `defaultMessages`, envUI's English strings by namespace, for applications that extract or translate them.
- `@envsemble/envui/dev` for [dev mode](dev-mode.md), in development only: load it with a dynamic `import()` behind a development check, so production builds contain none of it.
- `@envsemble/envui/assets/*` for raw assets, such as the Geist font file.

The content, rich-text, diff and color entries need libraries that envUI doesn't list as dependencies, so an application that uses only the main entry never installs them. One that imports an entry installs its libraries, in these versions or later ones of the same major:

- `@envsemble/envui/content`:

  ```sh
  npm install shiki@^4.5.0 @shikijs/langs@^4.5.0 react-markdown@^10.1.0 remark-gfm@^4.0.1
  ```

- `@envsemble/envui/rich-text`:

  ```sh
  npm install @tiptap/core@^3.31.4 @tiptap/extension-image@^3.31.4 @tiptap/extension-list@^3.31.4 @tiptap/extension-mention@^3.31.4 @tiptap/extension-placeholder@^3.31.4 @tiptap/extension-table@^3.31.4 @tiptap/markdown@^3.31.4 @tiptap/pm@^3.31.4 @tiptap/react@^3.31.4 @tiptap/starter-kit@^3.31.4 @tiptap/static-renderer@^3.31.4 @tiptap/suggestion@^3.31.4 marked@^17.0.6 shiki@^4.5.0 @shikijs/langs@^4.5.0
  ```

- `@envsemble/envui/diff`:

  ```sh
  npm install @pierre/diffs@^1.5.2 shiki@^4.5.0
  ```

- `@envsemble/envui/color`:

  ```sh
  npm install @react-aria/color@^3.2.1 @react-stately/color@^3.10.1 @react-aria/i18n@^3.13.1
  ```

  React Aria's names of channels and colors in every language are about 57 KB of the entry's 190 KB minified; `@react-aria/optimize-locales-plugin` keeps only the application's languages.

They aren't peer dependencies, since GitHub Packages drops `peerDependenciesMeta`; a missing one fails the build where the entry is imported.

Import each icon by its own path, such as `import { Add } from '@envsemble/envui/icons/Add'`. See [icons](foundations/icons.md).

### Bundle size

The modules have no side effects, so a bundler keeps only what the application uses; Vite keeps only the parts of a namespace the application renders.

## Lint rules

[`@envsemble/eslint-plugin-envui`](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin) and [`@envsemble/stylelint-config-envui`](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config) report hand-built controls and raw colors, naming the envUI component or token to use, so people and agents see them as they edit and check. Install them at envUI's version; each one's README says how to turn it on:

```sh
npm install --save-dev --save-exact @envsemble/eslint-plugin-envui@<version> @envsemble/stylelint-config-envui@<version>
```

## Coding agents

A coding agent can do this setup with you, following [the setup skill](https://envui.envsemble.com/SKILL.md) the site hosts: it shows its plan and waits for your yes, adds a pointer to these docs to the project's `AGENTS.md` and turns on the lint rules.
