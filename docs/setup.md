---
components:
  - EnvUIProvider
  - useLocale
  - LinkProvider
  - PortalContainer
  - createThemeBootstrapScript
  - defineTheme
  - useStoredThemePreference
  - createStoredThemeBootstrapScript
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
  useStoredThemePreference:
    - persisted theme
    - remember the theme
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

envUI is React components and design tokens for React and React DOM 19. Install an exact version, with the lint packages at the same one, and read the docs shipped with it.

```sh
npm install --save-exact @envsemble/envui@{{version}}
npm install --save-dev --save-exact @envsemble/eslint-plugin-envui@{{version}} @envsemble/stylelint-config-envui@{{version}}
```

Each lint package's README says how to turn it on. The ESLint plugin's `configs.recommended` reports envUI used wrongly; `configs.strict` also holds the application to envUI's components in place of plain HTML and to the words of its [writing guide](writing.md).

## Styles

Each component imports its own style sheet, so a bundler that loads CSS from dependencies, such as Vite, Next.js or esbuild, loads only what the application uses. Without a bundler, import `@envsemble/envui/styles.css` once in the client entry instead. In Node the style imports resolve to nothing. With Next.js and webpack, list `@envsemble/envui` in `experimental.optimizePackageImports`.

## Theme

Put the interface inside `Theme`.

### Theme preference

For a whole application, `ThemePreferenceProvider` replaces the fixed `Theme`: it follows the system until people choose with `ThemeToggle`, and themes the document root. Where the choice is kept is the application's: give the provider `preference` and `onPreferenceChange` to keep it in a cookie or the user's account; without them, a choice lasts until the page reloads. Define the theme once with `defineTheme` and give it to the provider and to `createThemeBootstrapScript` in the document head, with the preference the page renders, so a dark theme doesn't flash light and the first paint has the scale and the look. An application that renders `<html>` with React adds `suppressHydrationWarning` to it.

```ts
import { defineTheme } from '@envsemble/envui/theme-bootstrap';

export const theme = defineTheme({ scale: 'compact' });
```

```tsx
import { ThemePreferenceProvider, ThemeToggle, type ThemePreference } from '@envsemble/envui';
import { theme } from './theme';

function App({
  preference,
  savePreference,
}: {
  preference: ThemePreference;
  savePreference: (preference: ThemePreference) => void;
}) {
  return (
    <ThemePreferenceProvider
      theme={theme}
      preference={preference}
      onPreferenceChange={savePreference}
    >
      <ThemeToggle />
    </ThemePreferenceProvider>
  );
}
```

```ts
import { createThemeBootstrapScript } from '@envsemble/envui/theme-bootstrap';
import { theme } from './theme';

const script = createThemeBootstrapScript(theme, { preference: 'dark' });
```

One provider themes the document; a second passes `applyToDocument={false}`. To change the typeface or size, set `--env-font-family`, `--env-font-size-body` and `--env-line-height-body` on `.env-theme` in a style sheet loaded after envUI's.

#### Keep it in the browser

`@envsemble/envui/theme-storage` keeps the preference in localStorage, for an application without a server of its own: spread what `useStoredThemePreference` returns on the provider, and put `createStoredThemeBootstrapScript` in the head in place of `createThemeBootstrapScript`, with the same storage options, such as `export const themeStorage = { storageKey: 'app-theme' }` beside `theme` in `theme.ts`, so the head's script imports them without the application. A choice made in another tab applies in every tab.

```tsx
import { ThemePreferenceProvider, ThemeToggle } from '@envsemble/envui';
import { useStoredThemePreference } from '@envsemble/envui/theme-storage';
import { theme, themeStorage } from './theme';

function App() {
  const storedTheme = useStoredThemePreference(themeStorage);
  return (
    <ThemePreferenceProvider theme={theme} {...storedTheme}>
      <ThemeToggle />
    </ThemePreferenceProvider>
  );
}
```

```ts
import { createStoredThemeBootstrapScript } from '@envsemble/envui/theme-storage';
import { theme, themeStorage } from './src/theme';

const themeBootstrap = {
  name: 'theme-bootstrap',
  transformIndexHtml: () => [
    {
      tag: 'script',
      children: createStoredThemeBootstrapScript(theme, themeStorage),
      injectTo: 'head-prepend',
    },
  ],
};
```

## Connect your router

Destinations render native anchors. Register the router's link once with `LinkProvider`; it gets the anchor's props with a string `href`.

```tsx
<LinkProvider component={RouterLink}>{app}</LinkProvider>
```

### TanStack Router

```tsx recipe
import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { LinkProvider, type LinkComponentProps } from '@envsemble/envui';

function RouterLink({ href, ...props }: LinkComponentProps) {
  if (!href.startsWith('/') || href.startsWith('//')) return <a href={href} {...props} />;
  const url = new URL(href, 'https://application.invalid');
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

envUI works in English without setup. `EnvUIProvider` sets the `locale` it formats in (`en-GB` until the page hydrates without one), `messages` that override its strings per namespace, and `dir` for keyboard and placement. `defaultMessages` from `@envsemble/envui/messages` lists every string, and `useLocale()` returns the locale. A message may be a function of its values; functions come from a client component of the application's own.

```tsx
'use client';

import { EnvUIProvider } from '@envsemble/envui';
import type { ReactNode } from 'react';

export function Localized({ children }: { children: ReactNode }) {
  return (
    <EnvUIProvider locale="de-CH" messages={{ common: { loading: 'Wird geladen' } }}>
      {children}
    </EnvUIProvider>
  );
}
```

## Render overlays elsewhere

Popups, dialogs and toasts render in a portal at the end of the body. `PortalContainer` renders them into another element, such as one in a shadow root or an iframe; `contained` keeps them inside it, without locking scroll or taking focus, for a preview. Give the container layout containment and `container-type: inline-size`.

```tsx
<PortalContainer container={layer} contained>
  {children}
</PortalContainer>
```

## Server components

Components with state, effects or context carry `'use client'`; components that only lay out markup render on the server. A server component passes them only serializable values, so event handlers and render props belong in a client component of the application's own.

## Public entry points

- `@envsemble/envui` for ordinary UI.
- `@envsemble/envui/icons/<Name>` for each icon, `Icon<Name>`.
- `@envsemble/envui/messages` for `defaultMessages`.
- `@envsemble/envui/theme-bootstrap` for `defineTheme` and `createThemeBootstrapScript`.
- `@envsemble/envui/theme-storage` for `useStoredThemePreference` and `createStoredThemeBootstrapScript`, which keep the theme preference in localStorage.
- `@envsemble/envui/assets/*` for raw assets, such as the Geist font file.

These entry points need libraries the application installs itself, at these versions or later ones of the same major:

- `@envsemble/envui/code`:

  ```sh
  npm install shiki@^4.5.0 @shikijs/langs@^4.5.0
  ```

- `@envsemble/envui/markdown`:

  ```sh
  npm install shiki@^4.5.0 @shikijs/langs@^4.5.0 react-markdown@^10.1.0 remark-gfm@^4.0.1
  ```

- `@envsemble/envui/diff`:

  ```sh
  npm install @pierre/diffs@^1.5.2 shiki@^4.5.0
  ```

- `@envsemble/envui/color`:

  ```sh
  npm install @react-aria/color@^3.2.1 @react-stately/color@^3.10.1 @react-aria/i18n@^3.13.1
  ```

## Coding agents

A coding agent can do this setup with you, following [the setup skill](https://envui.envsemble.com/SKILL.md): it shows its plan and waits for your yes, points the project's `AGENTS.md` at these docs and turns on the lint rules.
