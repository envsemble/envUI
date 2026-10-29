# Migrate an interface to envUI

Use the [documentation index](index.md) to find only the components involved in the migration. Public declarations define the exact API for the selected release.

## Inspect the existing application

Confirm the requested scope: one screen/component, a shared component family or the whole client. Follow project instructions, discover check commands and inspect the working tree.

Identify:

- React/React DOM versions, package manager, bundler, router, rendering mode and deployment build.
- Shared UI wrappers/callers, component-library dependencies, icon loaders, fonts, CSS entry points, tokens and resets.
- Theme initialization/persistence, provider order and modal/toast/portal roots.
- Forms, validation, controlled state, native submit/reset, pending mutations, dirty drafts and errors.
- Vendor widgets requiring their own components, CSS or peer dependencies.
- Affected user journeys and responsive states.

Inspect representative source and behavior before mapping components. Matching appearance does not establish matching semantics. Preserve application logic, data contracts, authorization and persistence unless a behavior change is requested.

For broad migrations, record a compact mapping in the task or PR: existing owner → envUI composition → behavior to retain → gaps/vendor exceptions. For narrow changes, do this directly in the implementation. Do not create another permanent migration manual.

## Choose and connect the version

Use React 19 and inspect envUI's peers/exports. Upgrade framework dependencies only as required by the authorized migration. Select an exact envUI release, retain its lockfile and read the documentation it ships. Follow [setup](setup.md) for registry access, CSS, themes and entry points.

For co-development with an authorized local envUI checkout, follow [local development](local-development.md).

Connect Theme to the current preference and first-render initialization. Scope old/new styles deliberately during coexistence. Check inherited tokens/cascade on migrated controls and vendor widgets. Retain vendor theme providers and portal styling where required.

## Upgrade from envUI 0.x to 1.0

envUI 1.0 renames components, compound parts, classes and documentation pages, and makes a few helpers internal; nothing is exported under a 0.x name but `Row`, which is a [layout primitive](#layout-primitives) now. The codemods and the lint packages, released with envUI at the same version, do most of the work. The codemods read 0.x code and code written for 1.0.0-prerelease.0; they run in the order below, and running them all again changes nothing. Code written by hand for 1.0 can read as 0.x to them, so run them before writing new code. Commit first, as the codemods write files in place:

```sh
npx @envsemble/envui-codemods@<version> v1-names src --dry   # the files that would change, and the reports
npx @envsemble/envui-codemods@<version> v1-names src
npx @envsemble/envui-codemods@<version> v1-structure src
npx @envsemble/envui-codemods@<version> v1-render src
npx @envsemble/envui-codemods@<version> v1-stack src
npx @envsemble/envui-codemods@<version> v1-props src
npx @envsemble/envui-codemods@<version> v1-entries src
npx @envsemble/envui-codemods@<version> v1-classes src
```

Then install envUI 1.0, format, type-check and lint with the ESLint plugin:

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import envui from '@envsemble/eslint-plugin-envui';

export default defineConfig(envui.configs.recommended);
```

- `v1-names` rewrites imports and references from `@envsemble/envui` and `@envsemble/envui/theme-bootstrap`: renamed components and types (`Input` is `TextField`), namespace parts (`MenuItem` is `Menu.Item`, `<Menu>` is `<Menu.Root>`), `DirectionLink` by its literal `direction` (`Pager.Previous` or `Pager.Next`), re-exports, `defaultThemeStorageKey`, which becomes `'env-theme'`, and `<Theme theme={useTheme()}>`, which becomes `<Theme {...useTheme()}>`. Other `useTheme()` calls, imported by name or through a namespace import, become `useTheme().theme`, the color scheme they returned in 0.x, unless the file already reads them as `{ theme, contrast }`.
- `v1-structure` rewrites elements whose 1.0 form is another element or shape: ActionGroup becomes a Stack, which `v1-stack` then makes a Row or a Column, as [the vocabulary](#variants-tones-and-render) lists, ActionCard becomes a Card, as [content and display](#content-and-display) lists, ListDetail becomes list-detail Panes, as [split panes](#split-panes) lists, a `<Dialog placement="right">` a Sheet, as [overlays](#overlays-and-feedback) lists, the prerelease's CloseButton and `Button iconOnly` an IconButton, its CounterBadge a Badge with `count` and its LoadingState a Spinner with `showLabel`, as [folded components](#folded-components-and-patterns) lists. It reports the prerelease's Drawer, a Sheet now, and a LoadingState's children. AppShell, Sidebar, SplitView, SplitPane, NavList and WindowFrame are not mechanical: [the app frame](#the-app-frame), [navigation forms](#navigation-forms), [split panes](#split-panes) and [the shell](#shell-dock-editors-and-code) show them before and after.
- `v1-render` turns a literal `as` into `render`, `as="h2"` into `render={<h2 />}`, and a ternary of element names into a ternary of elements, `as={section ? 'h2' : 'h1'}` into `render={section ? <h2 /> : <h1 />}`.
- `v1-stack` rewrites Stack into the [layout primitives](#layout-primitives): `<Stack direction="row">` becomes `<Row>` and any other Stack a `<Column>`, with `gap={4}`, Stack's default, where it set none.
- `v1-props` moves the props that 1.0 removed, renamed or changed, as [scale and density](#scale-and-density) and [the vocabulary](#variants-tones-and-render) list them. A value that is a conditional of literals has each literal mapped, also in nested ternaries and beside `&&`, `||` and `??`: `tone={failed ? 'error' : 'info'}` becomes `tone={failed ? 'danger' : 'info'}`, and a value that 1.0 drops as the default becomes `undefined`, so `size={large ? 'large' : 'standard'}` on an Avatar becomes `size={large ? 'lg' : undefined}`.
- `v1-entries` imports the exports that moved to another entry point from it: ColorPicker, ColorSwatch and their props types from `@envsemble/envui/color`, as [color](#color-picker-and-swatches) lists. It moves named imports and re-exports, and reports a use through a namespace import, such as `<ui.ColorPicker>`.
- `v1-classes` renames `env-*` classes and `--env-*` custom properties in style sheets, CSS-in-JS templates (such as `` css`…` `` and `` styled.div`…` ``), class names, selector strings and test locators, turns the modifier classes that became attributes into attribute selectors, and renames the tokens' custom properties: `--color-text-muted` becomes `--env-color-fg-muted`, `--space-4` becomes `--env-space-4` and `--control-height-small` becomes `--env-control-height`, as [tokens](#tokens) lists them. It also renames the part classes of 1.0.0-prerelease.0 where the part carries on, such as `env-app-shell-header` to `env-top-bar` and `env-list-detail-back` to `env-panes-back`, and reports the rest, such as `env-sidebar-*` and `env-nav-list-*`. It renames every use, `var(--old)`, but a declaration only where the old name is the one that becomes the token: where 1.0 merges several names into one token, as it merges `--control-height`, `--control-height-small` and `--icon-button-size`, a declaration of another of them stays and is reported, since rewriting it would set the token for every component that reads it. It reports a token that 1.0 removes without one token in its place, and a 0.7 fixed color no token replaces, with what to use instead.
- `envui/no-renamed-exports` reports the 0.x names left in imports and re-exports, and also those it can follow statically through namespace imports, `require()`, `import()`, `import … = require()`, destructuring and `createElement()`, with each one's 1.0 name or what to use instead. A name read through a computed member such as `envui[name]` is not followed; the type check catches those. The recommended config also reports raw elements that envUI provides and raw colors; `@envsemble/stylelint-config-envui` does the same for style sheets.

Change by hand what the codemods report, each with its file and line:

- removed exports: `LoadingBar` and `LoadingBarProps` (TopBar's `loading` prop, or Progress), the manual `Toast` (`useToast()` inside `Toast.Provider`), `ToastProps` (`ToastNotification`), `getInitials`, `useLinkComponent`, `useSidebarCompact` (the navigation forms show their own), `PanelDockControls` and `PanelDockControlsProps` (PanelDock.Header's own controls), `BrandLogo`, `BrandLogoProps`, `EnvUILogo` and `EnvUILogoProps` (envUI ships no logos), and the `MenuDensity` and `SurfaceDensity` types (menus have one anatomy; give controls a `size` or a Theme a `scale`). ActionGroup, ActionCard, FeatureCard, Counter, and the prerelease's CounterBadge and CloseButton, are reported only where they are used other than as elements, such as passed as a value: `v1-structure` rewrites their elements; AppShell, AppShellSkeleton, SplitView, WindowFrame, TitleBar, OrganizationMenu, Stat and EmptyState are reported wherever they are used, as are 1.0.0-prerelease.0's Sidebar, SidebarTrigger, NavList, SplitPane, AccountMenu, Skeleton and viewport breakpoints, and 1.0.0-prerelease.1's SearchTrigger, as the sections below say;
- 1.0.0-prerelease.0's Drawer, which takes no `destinations`: it is Sheet now, and the name is the navigation drawer's, so rename it by hand, as [overlays](#overlays-and-feedback) says; and a LoadingState's children, which a Spinner doesn't take, as [skeletons](#skeletons) says;
- a `DirectionLink` whose `direction` is computed or spread, or that is used outside JSX;
- re-exports of namespace parts, and names destructured from a namespace import, `useTheme` among them;
- a `useTheme()` call that is returned, as by a hook that wraps it, or passed as the `value` of what may be a context provider, directly or through a variable: whether its readers expect the scheme or the object is out of the file's sight;
- each `require()` and `import()` of `@envsemble/envui`, which the codemods do not follow;
- a `variant`, `tone`, `corners` or Text `variant` whose value is an expression other than a conditional of literals, such as a variable or a lookup object, which keeps or takes its new name and may need its values mapped, and a conditional with a value that maps to two props, such as `variant={featured ? 'important' : 'secondary'}`; an `as` that is an expression other than a ternary of element names, or beside a `render`, and a converted one beside a spread;
- an ActionGroup whose `stacked` is an expression or that spreads props, and a child of a stacked one that is not a Button or that spreads props, whose width the codemod can't set;
- a modifier class in a `className`, such as `env-button-important`, which the component's props set in 1.0;
- a local that shadows a namespace or a new name: the codemod writes a second import under an alias, such as `Menu as EnvMenu`, which you may rename;
- comments the codemod drops: a `@ts-expect-error` above an import whose names change, which TypeScript would report once the 0.x name it expected an error from is gone; a disable comment of an import that is removed with nothing in its place; and comments on a removed import name that no namespace import takes the place of.

The codemods also leave class names built at run time, CSS-in-JS outside a tagged template, selectors nested in a Sass or Less rule (a DiffCount label in a nested `.env-diff-count` rule becomes `env-diff-stat-label`), mocks and `declare module` augmentations; search for the old names there. The codemods' rename map, the folder `src/maps/v1` in `@envsemble/envui-codemods`, lists every change.

**Tests.** In test files (`*.test.*`, `*.spec.*`, and files in `tests`, `__tests__`, `e2e`, `playwright` and `cypress` folders, judged by the path below the project's `package.json`), `v1-classes` renames the classes in class contexts: Playwright locators and other selectors (`locator('.env-…')`, `waitForSelector()`, `querySelector()`, `$()` and the like, and a class selector passed to any call, such as `cy.get('.env-tree-row')`), `toHaveClass('…')` and `expect(el.classList).toContain('…')` assertions, `classList` methods, `className` values, and a string that is exactly one 0.x class passed to a call that names classes, such as `findByClass(root, 'env-app-sidebar')`. Another string that is exactly a 0.x class, such as a `data-testid`, an id or an object key, may be no class: it reports and leaves it. It also reports, and leaves, a 0.x class inside a regular expression, such as `toHaveClass(/env-tree-row/)` or `assert.match(markup, /class="env-diff-count"/)`, a token's name before 1.0 in a regular expression, such as `/var(--color-text-muted)/`, a 0.x class inside a longer string, and a modifier class in an assertion, such as `env-spinner-small`, which is an attribute in 1.0: assert on the attribute, such as `toHaveAttribute('data-size', 'sm')`, or on the role and name instead.

### Renamed components, parts and pages

Components take the names other libraries and the ARIA patterns use, and compound components are namespaces of parts, `Menu.Root` and `Menu.Item`. `v1-names` renames every export below, with its props types, and `v1-classes` the classes; nothing is exported under a 0.x name but `Row`, which is a [layout primitive](#layout-primitives) now.

| 0.x                                                                                                                                                                    | 1.0                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Input`, `InputProps`                                                                                                                                                  | `TextField`, `TextFieldProps`                                                                                                                                                            |
| `Notice`, `NoticeProps`, `NoticeTone`                                                                                                                                  | `Alert`, `AlertProps`, `AlertTone`                                                                                                                                                       |
| `Counter`, `CounterProps`                                                                                                                                              | `Badge` with `count`, `BadgeProps`                                                                                                                                                       |
| `DiffCount`, `DiffCountProps`                                                                                                                                          | `DiffStat`, `DiffStatProps`                                                                                                                                                              |
| `Heatmap`, `HeatmapProps`, `HeatmapDay`, `HeatmapCell`                                                                                                                 | `CalendarHeatmap`, `CalendarHeatmapProps`, `CalendarHeatmapDay`, `CalendarHeatmapCell`                                                                                                   |
| `DateTimeField`, `DateTimeFieldProps`                                                                                                                                  | `DatePicker`, `DatePickerProps`                                                                                                                                                          |
| `DisclosureNote`, `DisclosureNoteProps`                                                                                                                                | `Disclosure`, `DisclosureProps`                                                                                                                                                          |
| `FileDropzone`, `FileDropzoneProps`                                                                                                                                    | `DropZone`, `DropZoneProps`                                                                                                                                                              |
| `OrganizationMenu`, `OrganizationMenuProps`, `OrganizationMenuOrganization`                                                                                            | Removed: the [account and organizations](patterns/account-and-organizations.md) pattern, built from Menu and Button                                                                      |
| `GroupedRows`, `GroupedRowsProps`, `Row`, `RowProps`                                                                                                                   | `List.Root`, `List.RootProps`, `List.Item`, `List.ItemProps`                                                                                                                             |
| `NavigationItem`, `NavigationItemProps`                                                                                                                                | Removed: an array of `Destination` items, passed to `Drawer`, `Rail` or `Bar`, as [navigation forms](#navigation-forms) lists                                                            |
| `Menu`, `MenuItem`, `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem`, `MenuSeparator`, `MenuHeader`, `MenuSubmenu`                                   | `Menu.Root`, `Menu.Item`, `Menu.Group`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem`, `Menu.Separator`, `Menu.Header`, `Menu.Submenu`                                        |
| `MenuProps`, `MenuItemProps`, `MenuGroupProps`, `MenuRadioGroupProps`, `MenuRadioItemProps`, `MenuCheckboxItemProps`, `MenuHeaderProps`, `MenuSubmenuProps`            | `Menu.RootProps`, `Menu.ItemProps`, `Menu.GroupProps`, `Menu.RadioGroupProps`, `Menu.RadioItemProps`, `Menu.CheckboxItemProps`, `Menu.HeaderProps`, `Menu.SubmenuProps`                  |
| `Menubar`, `MenubarProps`, `MenubarMenu`, `MenubarMenuProps`, `MenubarMenuOpenChangeDetails`                                                                           | `Menubar.Root`, `Menubar.RootProps`, `Menubar.Menu`, `Menubar.MenuProps`, `Menubar.MenuOpenChangeDetails`                                                                                |
| `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`, `TableSortDirection`                                                                    | `Table.Root`, `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell`, `Table.Cell`, `Table.SortDirection`                                                                           |
| `TableProps`, `TableHeadProps`, `TableBodyProps`, `TableRowProps`, `TableHeaderCellProps`, `TableCellProps`                                                            | `Table.RootProps`, `Table.HeadProps`, `Table.BodyProps`, `Table.RowProps`, `Table.HeaderCellProps`, `Table.CellProps`                                                                    |
| `Stat`, `StatProps`, `StatGroup`, `StatGroupProps`, `StatTrend`, `StatTrendTone`                                                                                       | Removed: the [key figures](patterns/key-figures.md) pattern, built from Surface, Grid, Text and Badge                                                                                    |
| `DirectionLinks`, `DirectionLinksProps`, `<DirectionLink direction="previous">`, `<DirectionLink direction="next">`, `DirectionLinkProps`, `DirectionLinksDestination` | `Pager.Root`, `Pager.RootProps`, `Pager.Previous`, `Pager.Next`, `Pager.LinkProps`                                                                                                       |
| `ToastProvider`, `ToastProviderProps`                                                                                                                                  | `Toast.Provider`, `Toast.ProviderProps`                                                                                                                                                  |
| `AppShell`, `AppShellProps`, `PanelDock`, `SplitView`, `ClickableCard`, `InfoChip` and the other types                                                                 | As [the app frame](#the-app-frame), [the shell](#shell-dock-editors-and-code), [split panes](#split-panes), [content and display](#content-and-display) and the other sections list them |
| `env-notice`, `env-counter`, `env-heatmap`, `env-date-time-field`, `env-file-dropzone`                                                                                 | `env-alert`, `.env-badge[data-count]`, `env-calendar-heatmap`, `env-date-picker`, `env-drop-zone`, with their parts: `env-notice-title` is `env-alert-title`                             |
| `env-disclosure-note`, `env-disclosure-content`                                                                                                                        | `env-disclosure`, `env-disclosure-panel`                                                                                                                                                 |
| `env-grouped-rows`, `env-row`                                                                                                                                          | `env-list`, `env-list-item`                                                                                                                                                              |
| `env-direction-links`, `env-direction-link`                                                                                                                            | `env-pager`, `env-pager-link`                                                                                                                                                            |

The documentation pages are named after their component, in the singular: `notices` is `alert`, `badges` and `chips` are `badge`, `buttons` is `button`, `heatmap` is `calendar-heatmap`, `cards` is `card`, `date-time-field` is `date-picker`, `dialogs` is `dialog`, `disclosures` is `disclosure`, `file-dropzone` is `drop-zone`, `keyboard` is `kbd`, `rows` is `list`, `messages` is `message`, `meters` is `meter`, `navigation` is `drawer`, `direction-links` is `pager`, `split-view` is `panes`, `layout` is `column`, `stats` is `stat`, `tables` is `table`, `fields` is `text-field` and `toasts` is `toast`, under `docs/components/` and the catalogue's `components/` routes. The pages of 1.0.0-prerelease.0's removed components open their successors: `app-shell` is `scaffold`, `sidebar` and `nav-list` are `drawer`, `split-pane` and `list-detail` are `panes` and `stack` is `column`. `loading` and `skeleton` are the [loading pattern](patterns/loading.md), `account-menu` is the [account and organizations](patterns/account-and-organizations.md) pattern, and `window-frame` the [app frame](patterns/app-frame.md) pattern.

### The app frame

AppShell, its parts and Sidebar are gone, with SidebarTrigger, useAppShell, useSidebar and readAppShellCookie: an app frame is an arrangement every application makes its own, so envUI gives its pieces and a [pattern](patterns/app-frame.md) rather than a component. [Scaffold](components/scaffold.md) is the invisible structure: a top bar region, the navigation and a body that scrolls. It shows one navigation form at a time by its own width, the navigation Bar at the bottom of a compact window, the Rail at the start of a medium one and the Drawer from expanded, each with the same destinations. [TopBar](components/top-bar.md) is the bar at the top. No codemod rewrites an app frame: `v1-names` reports each of these names where it is used, and the rest is by hand.

Before, a 0.x AppShell and the AppShell of 1.0.0-prerelease.0:

```tsx
// 0.x
<AppShell
  brand={<Mark />}
  title="Northwind"
  actions={<AccountMenu … />}
  navigation={items}
  navigationLabel="Primary"
  storageKey="app.frame"
>
  {page}
</AppShell>

// 1.0.0-prerelease.0
<AppShell.Root persist="app.frame">
  <AppShell.SkipLinks />
  <Sidebar.Root label="Primary" collapsible="rail">
    <Sidebar.Header>
      <SidebarTrigger mark={<Mark />} />
    </Sidebar.Header>
    <Sidebar.Content>
      <NavList.Root>{items}</NavList.Root>
    </Sidebar.Content>
  </Sidebar.Root>
  <AppShell.Header end={account}>Northwind</AppShell.Header>
  <AppShell.Main>{page}</AppShell.Main>
</AppShell.Root>
```

Now:

```tsx
<Scaffold
  topBar={<TopBar title="Northwind" actions={account} />}
  navigation={{
    bar: <Bar destinations={destinations} />,
    rail: <Rail destinations={destinations} />,
    drawer: <Drawer destinations={destinations} />,
  }}
>
  {page}
</Scaffold>
```

| Before                                                                  | Now                                                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `AppShell.Root`, `AppShell.Main`                                        | `Scaffold`, whose children are the body, the `main` landmark (`bodyId`, `bodyRef`)                     |
| `AppShell.SkipLinks`                                                    | Built in: Skip to content and Skip to navigation                                                       |
| `AppShell.Header`, 0.x `title`, `actions`, `brand`, `context`           | `topBar={<TopBar start={…} title={…} actions={…} />}`                                                  |
| `headerSpan="full"`, 0.x `topbar="full"`                                | `topBarSpan="full"`                                                                                    |
| `titleBar`                                                              | `<TopBar titleBar>` in a Scaffold with `topBarSpan="full"`                                             |
| `loading`, `loadingLabel`                                               | On TopBar                                                                                              |
| `scroll="document"`, `scroll="main"`                                    | `scroll="document"`, the default, or `scroll="body"`; sticky content reads `--env-scaffold-sticky-top` |
| `Sidebar.Root` with a NavList, collapsing to a rail, a drawer on phones | `navigation={{ bar, rail, drawer }}`, the forms by window class; `forms` changes them                  |
| `breakpoint`, `dockAt`, the 40, 48, 64 and 80 rem breakpoints           | The window classes of the Scaffold's own width: 37.5, 52.5 and 75 rem                                  |
| `persist`, `readAppShellCookie`, `shortcut`, `sidebarOpen`              | None: a form never collapses, so there is no state to keep                                             |
| `AppShell.Aside`, an end Sidebar                                        | A supporting pane of [Panes](#split-panes) in the body                                                 |
| `useAppShell().getScrollElement()`                                      | The document, or `bodyRef` with `scroll="body"`                                                        |
| `env-app-shell`, `-header`, `-header-title`, `-main`, `-skip-links`     | `env-scaffold`, `env-top-bar`, `env-top-bar-title`, `env-scaffold-body`, `env-scaffold-skip-links`     |

- **The exports that go**: `AppShell` with its parts and `AppShellProps`, `AppShellSkeleton` and `AppShellSkeletonProps`, `Sidebar` with its parts, `SidebarTrigger` and `SidebarTriggerProps`, `useSidebar`, `useAppShell`, `readAppShellCookie`, and the types `AppShellState`, `PerSide`, `PersistOptions`, `SidebarSide`, `SidebarSnapshot`, `FrameStateProps`, `SidebarChangeReason`, `AppShellContextValue` and `SidebarApi`. `v1-names` reports each one where it is used.
- **Scrolling**: the document scrolls by default, with the top bar, the bar and the rail or drawer kept in view, and sticky content in the body under the top bar at `--env-scaffold-sticky-top`. `scroll="body"` scrolls the body alone, for a preview, an embedded frame or a window with its own title bar; read and restore its scroll position on `bodyRef`.
- **AccountMenu** is gone, with AccountMenu.ThemeSubmenu and AccountMenu.OrganizationSubmenu; the [account and organizations](patterns/account-and-organizations.md) pattern builds it from Menu, AvatarButton and Avatar, with a `Menu.Submenu` around a ThemeRadioGroup for the theme. `v1-names` reports it, and `v1-classes` its `env-account-menu-*` classes:

  ```tsx
  // Before
  <AccountMenu.Root name="Ada Lovelace" description="ada@example.com">
    <AccountMenu.ThemeSubmenu value={theme} onValueChange={setTheme} />
    <Menu.Item>Sign out</Menu.Item>
  </AccountMenu.Root>;

  // 1.0
  <Menu.Root
    aria-label="Account"
    trigger={<AvatarButton name="Ada Lovelace" description="ada@example.com" />}
  >
    <Menu.Header>
      <Avatar name="Ada Lovelace" />
    </Menu.Header>
    <Menu.Submenu label="Theme">
      <ThemeRadioGroup />
    </Menu.Submenu>
    <Menu.Item>Sign out</Menu.Item>
  </Menu.Root>;
  ```

- **PageHeader's sticky height**: a sticky PageHeader sticks under the Scaffold's top bar, or at the top of a body that scrolls, and still publishes `--env-page-header-block-size` on its Page; what takes focus in its Page keeps clear of it by a scroll margin. Put content that should stay in view under it in its `toolbar`.
- **Page**: its gutter follows the window class of the region it sits in, 1 rem in a compact one and 1.5 rem from medium, where it grew with the viewport from 1 to 2 rem.
- **Classes and tokens**: `v1-classes` renames the prerelease's `env-app-shell-header`, `-header-start`, `-header-title`, `-header-end`, `-main`, `-loading-bar` and `-skip-links` to `env-top-bar`, `env-top-bar-start`, `env-top-bar-title`, `env-top-bar-actions`, `env-scaffold-body`, `env-top-bar-loading-bar` and `env-scaffold-skip-links`, and reports `env-app-shell` itself and Sidebar's `env-sidebar-*`. `--env-app-shell-header-height` is `--env-top-bar-height`, which it rewrites; the frame's own custom properties have no counterpart, as [tokens](#tokens) lists.

### Navigation forms

NavList and NavList.Skeleton are gone. An application's destinations are one array, which it passes to the navigation form that suits the window: Bar on compact windows, Rail on medium ones and Drawer from expanded, all three on [Drawer's page](components/drawer.md); Scaffold shows one per window class. 0.x's NavigationItem, which 1.0.0-prerelease.0 named NavList.Item, is gone with it. The prerelease's Drawer, the panel that slides over the page, is [Sheet](#overlays-and-feedback).

| Before                                                  | 1.0                                                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `<nav><NavList.Root>…</NavList.Root></nav>`             | `<Drawer destinations={destinations} />`, a `nav` landmark named Main or `aria-label`         |
| `<NavList.Item href icon selected>Label</NavList.Item>` | `{ label: 'Label', icon, href, current }` in `destinations`                                   |
| A NavList.Item without `href`, with `onClick`           | `{ label, icon, onSelect }`                                                                   |
| `end={<CounterBadge value={12} />}`                     | `count: 12`, named as "Inbox, 12 new"                                                         |
| `<NavList.Group label="Folders">`                       | `group: 'Folders'` on each of its destinations, next to each other                            |
| `iconOnly`, a sidebar's rail                            | `<Rail destinations={destinations} />`                                                        |
| NavList.Skeleton                                        | `skeleton` on the Drawer, Rail or Bar: its labels are bars and its icons filled shapes        |
| A NavList.Item as a tab of Tabs                         | A Button, such as `variant="ghost"` with `startIcon`                                          |
| `messages.navList.itemCount`, `itemEnd`                 | `messages.navigation.itemCount`; end content other than a count has no place in a destination |
| `.env-nav-list-item`, `[data-selected]`                 | `.env-drawer-item`, `.env-rail-item`, `.env-bar-item`, with `[data-current]`                  |

Before and after:

```tsx
// 1.0.0-prerelease.0
<NavList.Root>
  <NavList.Item href="/inbox" icon={<Inbox />} selected end={<CounterBadge value={12} />}>
    Inbox
  </NavList.Item>
</NavList.Root>;

// 1.0
const destinations: Destination[] = [
  { label: 'Inbox', icon: <Inbox />, href: '/inbox', current: true, count: 12 },
];
<Drawer destinations={destinations} />;
```

No codemod rewrites a NavList: its items are elements, and a destination is data, so turning one into the other is not mechanical. `v1-names` reports NavList, NavigationItem and NavigationItemProps, and `v1-classes` the `env-navigation-*` and `env-nav-list-*` classes. Write the array once, and pass it to each form the application shows.

### Shell, dock, editors and code

TitleBar and WindowFrame are gone: a window that draws its own title bar is a Scaffold with a `<TopBar titleBar>` across its whole width, as the [app frame](patterns/app-frame.md) pattern shows for an installed app's window. PanelDock is a namespace; the editors take the field vocabulary. `v1-names` renames the exports and reports TitleBar and WindowFrame, `v1-props` moves the literal props and values, and `v1-classes` renames the classes:

| Before                                                                                                                                   | 1.0                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<TitleBar start end>{title}</TitleBar>`, `TitleBarProps`                                                                                | `<TopBar titleBar start={start} title={title} actions={end} />`, `TopBarProps`                                                                                       |
| `<WindowFrame titleBar={bar} scrollRef={ref}>…</WindowFrame>`                                                                            | `<Scaffold topBarSpan="full" topBar={bar} bodyRef={ref}>…</Scaffold>`                                                                                                |
| `<WindowFrame.Root>` with `<WindowFrame.TitleBar>` and `<WindowFrame.Content ref={ref}>` (1.0.0-prerelease.0)                            | `<Scaffold topBarSpan="full" topBar={<TopBar titleBar … />} bodyRef={ref}>…</Scaffold>`                                                                              |
| `env-window-frame-title-bar`, `-title-bar-start`, `-title-bar-center`, `-title-bar-end`, `env-window-frame-content` (1.0.0-prerelease.0) | `env-top-bar`, `env-top-bar-start`, `env-top-bar-title`, `env-top-bar-actions`, `env-scaffold-body`, which `v1-classes` writes; it reports `env-window-frame` itself |
| `PanelDock`, `PanelDockHeader`, `PanelDockProps`, `PanelDockHeaderProps`                                                                 | `PanelDock.Root`, `PanelDock.Header`, `PanelDock.RootProps`, `PanelDock.HeaderProps`                                                                                 |
| PanelDock.Header `controls={null}`                                                                                                       | `controls={false}`                                                                                                                                                   |
| PanelDock.Root `showLabel`, which names a tab's button                                                                                   | `openLabel`                                                                                                                                                          |
| RichTextEditor `hint`                                                                                                                    | `description`                                                                                                                                                        |
| RichTextEditor `variant`: `outlined`, `plain`, `quiet`                                                                                   | `outline`, `underline`, `ghost`                                                                                                                                      |
| `env-title-bar*`, `--env-title-bar-start`, `--env-title-bar-end`                                                                         | `.env-top-bar[data-title-bar]`, `--env-top-bar-title-bar-start`, `-end`; `--env-title-bar-height` keeps its name                                                     |
| `env-panel-dock-chip*`                                                                                                                   | `env-panel-dock-tab*`                                                                                                                                                |
| `env-code-copy-status`                                                                                                                   | `env-code-block-copy-status`                                                                                                                                         |
| Code `appearance`: `dark`, `subtle`                                                                                                      | Removed in 0.7, with the subtle inline code: inline code takes the code theme of the app theme                                                                       |
| Markdown `inlineCode`: `dark`, `subtle`                                                                                                  | Removed in 0.7, as Code's `appearance`                                                                                                                               |
| CodeBlock `theme`: `light`, `dark`                                                                                                       | Removed in 0.7: a code block takes the code theme of the app theme, `github-light-default` or `github-dark-dimmed`                                                   |
| `env-code-subtle`                                                                                                                        | Removed: Code has one look                                                                                                                                           |
| `env-markdown-toolbar`, `env-markdown-editor-status`                                                                                     | `env-editor-toolbar`, `env-editor-status`                                                                                                                            |

Change by hand what the codemods report or can't see:

- **WindowFrame, `WindowFrameProps`, TitleBar and `TitleBarProps`** are gone, and `v1-names` reports them where they are used: build the window frame from a Scaffold and a TopBar, as the table shows.
- **PanelDockControls** is internal. Drop a `controls={<PanelDockControls …/>}`, which `v1-props` reports, and name the window controls through EnvUIProvider's `messages.panelDock` (`minimize`, `maximize`, `restore`, `close`), which also names the list of tabs and a tab's buttons.
- **Buttons in a title bar or a panel header** that set no variant are ghost, at the small height in a title bar. An icon-only `variant="text"` button there took the quiet icon color from the container and shows the link color now: drop its variant.
- **`[data-chips]`** on PanelDock's root is `[data-tabs]`, which `v1-classes` reports but doesn't rename.
- **`env-markdown` on rich text**: RichText's root and RichTextEditor's document no longer carry it; select them by `env-prose`, their shared typography, or by `env-rich-text` and `env-rich-text-document`. Markdown keeps `env-markdown` beside `env-prose`.
- **RichTextEditor `quiet`**, which drew as outlined, is `ghost` now, the field's quiet look: choose `outline` to keep the border.
- **A RichTextEditor `variant`** that is an expression, which `v1-props` reports.
- **Code's `appearance`, Markdown's `inlineCode` and CodeBlock's `theme`**: `v1-props` deletes each literal one and reports one whose value is an expression, such as `inlineCode={inlineCode}` in a wrapper of the application's own; delete it, and the wrapper's own prop with it. envUI chooses the code theme, so code that relied on the dark look in the light theme now shows `github-light-default`. `v1-classes` reports a style for `env-code-subtle`.

Words that were English and fixed are messages now: CodeBlock's and CodeDiff's, Markdown's table and task names, MarkdownEditor's toolbar, tabs, preview and status, RichTextEditor's toolbar, suggestions and status, the editors' commands and link dialog, and PanelDock's window controls. Set them through EnvUIProvider's `messages`; PanelDock's `minimizedLabel`, `openLabel` (0.x's `showLabel`), `closeLabel` and `resizeLabel` still override its own for one dock. The editors' toolbar buttons show their names in tooltips instead of native titles.

### Window classes and container queries

envUI responds to containers only, at window classes: compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem, which `windowClasses` and the `--env-window-class-*` tokens hold. The outermost theme boundary, the themed document root or the Theme around the application, is the `env-window` container that window-class queries measure:

| Before                                                                                    | 1.0                                                                                         |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `@media (width >= 48rem)` in an application's style sheet                                 | `@container env-window (width >= 52.5rem)`, or another window class, over a compact default |
| PageHeader's actions below 32 rem                                                         | Below 37.5 rem of their own width, compact                                                  |
| DatePicker's time beside the calendar from a 32 rem viewport                              | From a medium `env-window`                                                                  |
| `breakpoints`, `Breakpoint`, `breakpointQuery`, `--env-breakpoint-*` (1.0.0-prerelease.0) | `windowClasses`, `WindowClass`, `--env-window-class-medium`, `-expanded` and `-large`       |
| `useBreakpoint`, `useMediaQuery`, `MediaQueryOptions` (1.0.0-prerelease.0)                | A container query in a style sheet; Scaffold and Panes switch their own arrangement         |

The prerelease's hooks decided layout in script after the first paint; CSS decides it now, at the window class of the region the content sits in, so `layout.at()` can check it at any width. `v1-names` reports the hooks and `v1-classes` the tokens:

```tsx
// 1.0.0-prerelease.0
const wide = useBreakpoint('md');
<Stack direction={wide ? 'row' : 'column'} gap={4}>
  {fields}
</Stack>;

// 1.0: a Grid of one column, two from a medium window
<Grid className="profile-fields" gap={4}>
  {fields}
</Grid>;
```

```css
.profile-fields {
  grid-template-columns: minmax(0, 1fr);
}
@container env-window (width >= 37.5rem) {
  .profile-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

A region becomes a window of its own with `<Box container="env-window">`. The outermost boundary takes the whole width its parent gives it (`inline-size: 100%`), as a size container can't take its content's; override it with a class of your own where it shouldn't. A nested Theme is no container. Media queries that are not about width, such as `pointer`, `forced-colors` and `prefers-reduced-motion`, stay.

### Layout primitives

Stack is gone: Row, Column, Grid and Box lay content out, thin wrappers over flex and grid that size to their content and never paint. `v1-stack` rewrites each Stack:

| Before                                                | Now                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `<Stack direction="row" wrap align="center" gap={4}>` | `<Row wrap align="center" gap={4}>`                                                                           |
| `<Stack gap={3}>`, `<Stack direction="column">`       | `<Column gap={3}>`                                                                                            |
| `<Stack>`, whose gap was 1 rem by default             | `<Column gap={4}>`: Row and Column have no gap of their own                                                   |
| `wrap` on a column                                    | Dropped: a Column has no `wrap`                                                                               |
| `StackProps`                                          | `RowProps` or `ColumnProps`                                                                                   |
| Columns or a grid in the application's CSS            | `<Grid columns={3}>`, `<Grid columns="minmax(0, 2fr) minmax(0, 1fr)">` or `<Grid columns={{ min: '14rem' }}>` |
| A `div` for an inset or a size container              | `<Box padding={4}>`, `<Box container="summary">`                                                              |

- Each primitive renders `data-env-layout` (`box`, `row`, `column` or `grid`) on its root and `name` as `data-env-name`, and no class: the `env-stack` class is gone. Its options are attributes, such as `data-gap="4"` and `data-align="center"`, which its style sheet reads with no specificity, so a component's part class or any class of the application overrides them. Select `[data-env-layout='row']` where a style sheet selected `.env-stack[data-direction='row']`.
- `gap` and `padding` take the numbered steps of the spacing scale, 0 to 9; `align` and `justify` take Stack's values. A Stack's `direction` that is an expression stays and is reported: write a Row or a Column for each value.
- A primitive is a size container only with `container`, which names it: `<Box container="summary">` is `container: summary / inline-size`.
- `Row` and `RowProps` were 0.x's list row, which is `List.Item` in 1.0, and are the layout primitive now. `v1-names` still renames them where a file reads as 0.x code, so run it before `v1-stack`; it keeps the Row of a file that imports Column, Grid or Box, gives a Row `gap`, `wrap`, `justify` or `padding`, as `v1-stack` writes it, or uses Row only as elements without a spread and without the list row's `title`, which it required, `detail`, `action` or `interactive`, also as `ui.Row` through a namespace import. `envui/no-renamed-exports` no longer reports them.
- envUI's own components lay their parts out with Row, Column and Grid too, and Row and Column zero the block margins of their direct children, and Row the inline ones. Content of yours placed directly in such a part, such as a `<p>` passed to List.Item, Alert's `action`, Message's actions or Card's header, loses its default margins: give it a class with the margin you want, or wrap it. Parts that were grids, such as Message, Popover and Field, keep their children's margins.
- The documentation's Stack page is the [Column](components/column.md) page, beside [Row](components/row.md), [Grid](components/grid.md) and [Box](components/box.md).

### Split panes

SplitView (0.6), and SplitPane and ListDetail (1.0.0-prerelease.0), are gone: [Panes](components/panes.md) is one scaffold for two panes side by side, after Material's pane patterns, with two behaviors in less room: `supporting`, where the side pane becomes a sheet over the main one, and `list-detail`, where one pane shows at a time with a back button. CSS decides which arrangement shows, from the Panes' own width at a window class, so nothing measures it. `v1-structure` rewrites ListDetail:

| Before                                                         | Now                                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `<ListDetail.Root detailShown={d} onBack={f} backLabel="All">` | `<Panes.Root behavior="list-detail" open={d} onOpenChange={f} backLabel="All">`                         |
| `ListDetail.List`, `ListDetail.Detail`                         | `Panes.List`, `Panes.Detail`                                                                            |
| ListDetail's handle, always there                              | `<Panes.Divider label="Resize project list" />` between the list and the detail, where it should resize |
| `stackBelow="44rem"`                                           | `splitAt`: `medium` (37.5 rem), `expanded` (52.5 rem, the default) or `large` (75 rem)                  |
| `defaultListSize`, `minListSize`, `maxListSize` in %           | `defaultSize`, `minSize`, `maxSize` in rem: 22.5, 16 and 40 by default                                  |
| `resizeLabel`                                                  | `label` on Panes.Divider                                                                                |
| SplitPane, SplitView: two panes and a handle                   | By hand: `behavior="supporting"`, `Panes.Main`, an optional `Panes.Divider` and `Panes.Supporting`      |
| `onStackedChange`                                              | None: CSS decides; open the supporting pane from a button in the main pane                              |
| `.env-split-pane`, `-pane`, `-handle`; `.env-list-detail*`     | `.env-panes`, `.env-panes-main` and the other panes, `.env-panes-divider`, `.env-panes-back`            |

Before and after, a document with its details beside it:

```tsx
// Before
<SplitPane.Root defaultSize={70} stackBelow="44rem">
  <SplitPane.Pane label="Document">{document}</SplitPane.Pane>
  <SplitPane.ResizeHandle label="Resize details" />
  <SplitPane.Pane label="Details">{details}</SplitPane.Pane>
</SplitPane.Root>;

// Now: in less room the details are a sheet the button opens.
const [open, setOpen] = useState(false);
<Panes.Root behavior="supporting" open={open} onOpenChange={setOpen} defaultSize={20}>
  <Panes.Main label="Document">
    <Button onClick={() => setOpen(true)}>Details</Button>
    {document}
  </Panes.Main>
  <Panes.Divider label="Resize details" />
  <Panes.Supporting label="Details">{details}</Panes.Supporting>
</Panes.Root>;
```

- `size` and `onSizeChange` are the resized pane's width in rem, the supporting pane or the list, and `onSizeChange` receives `{ committed }`; `persist` keeps the width as before, under a new value, so a stored percentage is read as rem once: clear it, or use another key.
- The exports that go: `SplitView` and `SplitViewProps`, `SplitPane` and `ListDetail`, each with its parts; `v1-names` reports SplitView, SplitPane and ListDetail where they are used.
- A vertical split pane has no counterpart: lay two regions out one under the other with a Column, each with its own height.
- In style sheets, `v1-classes` renames `.env-split-view`, `.env-split-pane` and `.env-list-detail` to `.env-panes`, their dividers to `.env-panes-divider` and ListDetail's parts to `.env-panes-list`, `-detail` and `-back`, and reports a generic pane, which is `.env-panes-main`, `-supporting`, `-list` or `-detail` now, the probe SplitPane measured and the states Panes no longer sets, such as `[data-stacked]` and `[data-detail-shown]`: Panes sets `data-behavior`, `data-split-at` and `data-open`.

### Variants, tones and render

Buttons take a `variant` for their emphasis and a `tone` for their meaning, and Text and Surface take the words the rest of envUI uses. `v1-props` moves each literal value, `v1-render` each literal `as` and `v1-structure` each ActionGroup:

| 0.x                                                                                                          | 1.0                                                         |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `variant="important"` on Button, IconButton, ConfirmButton, CopyButton, DialogClose, ThemeToggle, Pagination | `variant="primary" tone="accent"`                           |
| `variant="destructive"`                                                                                      | `variant="primary" tone="danger"`                           |
| `variant="outlined"`, `variant="quiet"`                                                                      | `variant="outline"`, `variant="ghost"`                      |
| Text `tone`: `primary`, `muted`, `quiet`                                                                     | `emphasis`: `default`, `muted`, `subtle`                    |
| Text `variant`: `page-heading`, `section-heading`, `supporting`                                              | `headline`, `title`, `body-sm`                              |
| Surface `tone`: `pane`, `row`, `canvas`, `alternate`                                                         | `background`: `default`, `muted`, `page`, `raised`          |
| Surface `corners`: `surface`, `standard`, `pill`, `none`                                                     | `radius`: `xl`, `sm`, `full`, `none`                        |
| `as="h2"` on Text, Stack and Surface                                                                         | `render={<h2 />}`                                           |
| `<ActionGroup align="end">`                                                                                  | `<Row wrap align="center" gap={4} justify="end">`           |
| `<ActionGroup stacked>`                                                                                      | `<Column gap={2}>` with `fullWidth` on each labelled Button |
| `TextTone`, `SurfaceTone`, `SurfaceCorners`                                                                  | `TextEmphasis`, `SurfaceBackground`, `SurfaceRadius`        |
| `ActionGroup`, `ActionGroupProps`, `StackElement`, `TextElement`                                             | Removed: `Row`, `Column` and `render`                       |

In style sheets the modifier classes become attributes on the component's root class, which `v1-classes` writes with the specificity they had: `.env-button-important` is `.env-button:where([data-variant='primary'][data-tone='accent'])`, `.env-text-tone-muted` `.env-text:where([data-emphasis='muted'])`, `.env-surface-row` `.env-surface:where([data-background='muted'])` and `.env-skeleton-highlight` `.env-skeleton:where([data-emphasis='default'])`. The same holds for every modifier class: Button's `env-button-primary`, `env-button-important`, `env-button-destructive`, `env-button-secondary`, `env-button-outlined`, `env-button-text`, `env-button-quiet` and `env-button-underlined` are `[data-variant]`, `[data-tone]` and `[data-underline]` on `.env-button`; Text's `env-text-{variant}`, such as `env-text-caption`, and `env-text-tone-{tone}` are `[data-variant]` and `[data-emphasis]` on `.env-text`; Surface's `env-surface-{tone}` and `env-surface-corners-{corners}` are `[data-background]` and `[data-radius]` on `.env-surface`; and Skeleton's `env-skeleton-{tone}` is `[data-emphasis]`. The icon wrapper `env-symbol` is `env-icon`. A button without a `variant` takes its container's, such as ghost in a Toolbar.

A `variant` typed as a union of variants, such as `variant={pressed ? 'primary' : 'secondary'}` or a prop typed `'primary' | 'secondary'`, type-checks with the tones that every variant in it takes: neutral beside secondary, danger too beside outline, ghost and text, and accent only on primary.

`render` changes which element the component renders, so the `ref` of Surface, the layout primitives and Text takes the element `render` makes: a ref to it, such as `useRef<HTMLElement>(null)` with `render={<section />}`, or `useRef<HTMLDivElement>(null)` with `render={<div />}` on Text, type-checks, as a ref to the default element, a div or a paragraph, does. `SurfaceProps`, `RowProps`, `ColumnProps` and `TextProps` keep the default element's ref, so a wrapper that forwards `TextProps['ref']` to a `<p>` still type-checks; a wrapper that renders another element names it, as in `SurfaceProps<HTMLElement>`.

### Scale and density

1.0 sizes an interface on two axes: an app scale, `comfortable` or `compact`, set with `scale` on a Theme, and a row density on data components. Every control takes a `size`, `sm`, `md` or `lg`, with the same height for every control of that size; see [Spacing & density](foundations/spacing.md). The per-component density props go, and `v1-props` moves them where the meaning carries over:

| 0.x                                                                | 1.0                                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `density="compact"` on Select                                      | `size="sm"`                                                             |
| `density="compact"` on Combobox and DatePicker                     | `size="sm" showLabel={false}`                                           |
| `density="standard"` on Combobox and DatePicker                    | `variant="floating"`, the tall field; without it, the control height    |
| `compact` on TextField                                             | `showLabel={false}`; the field takes the control height                 |
| `compact={false}` on TextField or SearchField                      | `variant="floating"`                                                    |
| `density` on Table.Root: `compact`, `standard`                     | `density="sm"`, `"md"` (the default)                                    |
| `density` on Tree: `compact`, `standard`                           | `"sm"` (the default), `density="md"`                                    |
| `size="compact"` on Tabs, SegmentedControl, Pagination, CopyButton | `size="sm"`                                                             |
| `compact` on DropZone                                              | `size="sm"`                                                             |
| `density` on Surface, Menu.Root, ContextMenu, Menubar.Menu         | Removed: give controls `size="sm"`, or set `scale="compact"` on a Theme |

The codemod reports each use it can't move, such as a value that is an expression. Fields now take the control height by default, menus and the popups of Select and Combobox have one anatomy at the scale's row height, and controls in table cells take the small height; check screens that relied on the 3.5 rem field. In style sheets, `v1-classes` rewrites the uses of `--control-height-small` and `--icon-button-size`, `var(--control-height-small)`, to `var(--env-control-height)`, and `--control-height-compact` to `--env-control-height-sm`, and reports `--scale`, which is gone. 1.0 has one control height where 0.x had three names, so it rewrites a declaration of `--control-height` and reports, and leaves, a declaration of `--control-height-small` or `--icon-button-size`: rewritten, `.toolbar { --control-height: 30px; --control-height-small: 24px; }` would declare `--env-control-height` twice and make every control 24 px, and `:root { --icon-button-size: 40px }` would resize every control. Remove those declarations, or set `--env-control-height` where you mean every control. A region that re-pointed the control heights to look compact, such as `.compact-controls { --control-height: var(--control-height-compact); --control-height-small: var(--control-height-compact); }`, keeps the look with `--env-control-height: var(--env-control-height-sm)` alone, so delete the reported line; `<Theme scale="compact">` around the region is the 1.0 way to make it compact.

### Fields and choice controls

Fields take a `description` under them and the field variants, and choice controls the words the rest of envUI uses. `v1-props` moves each literal prop and value, `v1-names` the types and `v1-classes` the classes:

| 0.x                                                                                                           | 1.0                                                                                          |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `hint` on TextField, SearchField, Textarea, Select, Combobox, DatePicker, ColorPicker, Slider, MarkdownEditor | `description`                                                                                |
| Field `variant`: `outlined`, `quiet` (`floating` stays)                                                       | `outline`, `ghost`                                                                           |
| Field `variant`: `plain`, and 1.0.0-prerelease.1's `underline`                                                | Removed: the default outline, so the codemod drops the prop and reports it                   |
| Select `variant="outlined"`                                                                                   | `variant="outline"`                                                                          |
| Select `options`, `SelectOption`                                                                              | `items`, `SelectItem`                                                                        |
| DatePicker `withTime`                                                                                         | `granularity="minute"`; without it, `"day"`, the default                                     |
| DatePicker `doneLabel`, `messages.datePicker.done`                                                            | Removed: the calendar has no Done button and closes as a date-only one does                  |
| Slider `onValueCommit`                                                                                        | `onValueCommitted`                                                                           |
| DropZone `onFiles`, `onReject`                                                                                | `onDropAccepted`, `onDropRejected`                                                           |
| RadioGroup `variant`: `inline`, `rows`                                                                        | `orientation`: `horizontal`, `vertical`                                                      |
| Radio `detail`                                                                                                | `description`                                                                                |
| A Combobox option's `leading`, in `items`                                                                     | `start`, as on List.Item                                                                     |
| `env-text-input`, `env-text-field-well`, `env-form-field`, `env-field-hint`                                   | `env-text-field-input`, `env-text-field-control`, `env-field`, `env-field-description`       |
| `env-dropdown-trigger`, `-options`, `-list`, `-option`, `-option-check` (Select)                              | `env-select-trigger`, `-popup`, `-list`, `-item`, `-item-indicator`                          |
| `env-dropdown-options`, `env-dropdown-list` inside `env-combobox`                                             | `env-combobox-popup`, `env-combobox-list`                                                    |
| `env-combobox-well`, `-option`, `-check`                                                                      | `env-combobox-control`, `-item`, `-item-indicator`                                           |
| `env-date-time-well`                                                                                          | `env-date-picker-control`                                                                    |
| `env-checkbox-control`, `env-checkbox-mark`, `env-switch-control`                                             | `env-checkbox-input`, `env-checkbox-indicator`, `env-switch-input`                           |
| `env-radio-options`, `env-radio-control`, `env-radio-detail`                                                  | `env-radio-group`, `env-radio-input`, `env-radio-description`                                |
| `env-radio-inline`, `env-radio-option`                                                                        | `.env-radio-group[data-orientation='horizontal']`, `.env-radio[data-orientation='vertical']` |

Change by hand what the codemods can't see:

- **`className` and `style` style the root.** On TextField, SearchField, Textarea, Select, Combobox, DatePicker, Checkbox, Switch and Radio they reach the field's or the control's root, the element with `env-field` or the label around a choice, and on MarkdownEditor its root, `env-markdown-editor`, instead of the native control. `ref` and the other native props still reach the input, textarea or trigger, so form libraries keep registering them. A style meant for the input selects it through the root's class, such as `.my-field .env-text-field-input`. `v1-props` reports each `className` and `style` on these components without changing them.
- **`env-choice-control`** was the root of Checkbox, Switch and an inline Radio alike; it is `env-checkbox`, `env-switch` or `env-radio` now, by the control. `v1-classes` leaves it as it is, since only the markup around it tells which; rename it by hand.
- **The underline field is gone.** TextField, SearchField, Textarea, MarkdownEditor and RichTextEditor have no `underline` variant, which 1.0.0-prerelease.1 had (and 0.x as `plain`): `v1-props` drops `variant="underline"` and `variant="plain"`, so the field takes the default outline, and reports each. A field whose variant comes from a variable keeps it; TypeScript points at an `underline` there. CSS that selected `.env-text-field-control[data-variant='underline']` selects nothing now.
- **ColorPicker** comes from its own entry point now, on React Aria: [color](#color-picker-and-swatches) lists what changes.
- **A Combobox option's `leading`** is `start`. `v1-props` renames it in an array written in `items`, also in a group's `items`, and reports `items` it can't read, such as a variable; TypeScript points at the rest.
- **DropZone** is named by its label and its description together, as its visible text is; a test that found it by its label alone matches the start of the name.

### Color picker and swatches

ColorPicker and ColorSwatch move to their own entry point, `@envsemble/envui/color`, rebuilt on React Aria's color hooks, with ColorPickerButton, a button that opens a picker in a popover. Like the content and diff entries, it uses libraries that envUI doesn't list as dependencies, so an application that imports it installs them, as [setup](setup.md#public-entry-points) lists:

```sh
npm install @react-aria/color@^3.2.1 @react-stately/color@^3.10.1 @react-aria/i18n@^3.13.1
```

`v1-props` moves ColorPicker's props while it is imported from `@envsemble/envui`, then `v1-entries` moves the imports:

| Before                                                                | After                                                                                                                                                                  |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `import { ColorPicker, ColorSwatch } from '@envsemble/envui'`         | `import { ColorPicker, ColorSwatch } from '@envsemble/envui/color'`, with `ColorPickerProps` and `ColorSwatchProps`                                                    |
| ColorPicker `variant`                                                 | Removed: the fields are one compact control                                                                                                                            |
| ColorPicker `ref`, the HEX field                                      | The picker's root; a form takes the color from `name`, through a hidden input                                                                                          |
| `onValueChange(value)`, a `#rrggbb` string                            | `onValueChange(value, color)`: the string in `valueFormat`, `#rrggbb` by default, and React Aria's `Color`                                                             |
| `value`, `defaultValue`: six hex digits                               | A CSS color string, hex, `rgb()` or `hsl()`, or a `Color`                                                                                                              |
| HEX field, named "<label> HEX", committed as six digits are typed     | Fields for the format the menu shows, hex, RGB or HSL, each with its letter, such as R, and named Hex, Red, Hue and so on; typing commits on Enter and as focus leaves |
| Area and hue named "<label> saturation and brightness", "<label> hue" | The area named "<label>, Color picker", the sliders Hue and Alpha, from React Aria in the EnvUIProvider's locale                                                       |
| ColorSwatch: a round sample, always hidden from assistive technology  | A rounded square; alone, an image named by its color, such as dark purple; with `format` or `label`, its value and name beside it                                      |

Change by hand:

- **TextField's props.** The old picker took TextField's props and passed most of them to its HEX field; the new one is a group of React Aria's fields, and its other props go to its root element. `v1-props` reports the common ones:
  - `required` is gone, not replaced: the picker always holds a color, as a form reset restores its `defaultValue`, so a required check could never fail. Where a color must be chosen, keep "no color yet" in your own state, such as a Checkbox for a custom color, and validate it with the form.
  - `size` is gone: the fields take the control height of the scale; set `scale="compact"` on a Theme around the picker for small ones.
  - `autoComplete`, `inputMode`, `spellCheck`, `startIcon`, `endAction`, `prefix` and `suffix` are gone with the HEX field: remove them.
  - `autoFocus` is gone: focus the first field from an effect, `ref.current?.querySelector('input')?.focus()`, where focus belongs there.
  - `onFocus`, `onBlur`, `onKeyDown` and the other event handlers are on the root: they run for each of the picker's controls, also as focus moves between them, so compare `event.relatedTarget` with `event.currentTarget.contains()` to tell focus entering or leaving the picker. Read the color from `onValueChange` rather than from the event's target.
  - `id`, `aria-*` and `data-*` are on the root group, which `label` names; `name`, `form`, `disabled`, `readOnly`, `description`, `error` and `showLabel` stay.
- **The messages.** EnvUIProvider's `messages.colorPicker` holds `format`, `formatButton`, `hex`, `rgb`, `hsl`, `hexField`, `redShort` to `alphaShort`, `copy`, `eyeDropper`, `swatches` and `button` now. `description`, `invalid`, `hexLabel`, `restored`, `hue`, `area` and `areaValue` are gone: React Aria names the channels and the area, and describes their values, in the provider's locale, and a draft that is no color returns to the color as focus leaves.
- **Tests** that found the HEX field by "<label> HEX" find the picker by its label, `getByRole('group', { name: 'Accent color' })`, and the field inside it by its name, Hex, then press Enter, or move focus, to commit what they typed.
- **The parts.** `env-color-picker-plane`, `-saturation`, `-saturation-slider`, `-saturation-thumb`, `-hue-control`, `-hue-thumb`, `-hue-track` and `-status` are gone. The area is `env-color-picker-area` with its `env-color-picker-thumb`, each slider `env-color-picker-slider` (`env-color-picker-hue` and `env-color-picker-alpha`) with its `env-color-picker-track` and thumb, and the fields `env-color-picker-fields`. A ColorSwatch's color is `env-color-swatch-sample`, inside `env-color-swatch` where it has a label or a value.
- **A swatch button.** A Popover around a ColorPicker, opened by a Button with a ColorSwatch, is ColorPickerButton now, which keeps the button's name and value in step with the color.
- **`formats` from 1.0.0-prerelease.2.** There, two or more `formats` limited the format menu to them; from 1.0.0-prerelease.3 they show at once, each format's fields on a row of its own, with no menu. Check each ColorPicker and ColorPickerButton with two or more `formats`: keep them to show those formats together, or remove `formats` to keep one format at a time with the menu, which then offers hex, RGB and HSL. A menu of only some formats is gone; to offer one format, pass it alone, such as `formats={['hex']}`. No codemod changes `formats`, since either choice is a change of design.

### Navigation and collections

`v1-props`, `v1-structure` and `v1-names` make these changes; `v1-classes` renames the classes below.

| 0.x                                                             | 1.0                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `trailing` on Menu.Item                                         | `end`                                                                                      |
| Tree `selectedId`, `onOpen`, `TreeOpenOptions`                  | `value`, `onAction`, `TreeActionOptions`                                                   |
| A TreeItem's `detail` and `trailing`                            | `description` and `end`                                                                    |
| Table.HeaderCell `onSort`                                       | `onSortChange`, called with the order pressing asks for                                    |
| List.Item `title`, `detail`                                     | `label`, `description`                                                                     |
| `<List.Root contrast>`                                          | `<Surface background="muted" padding={3}><List.Root></Surface>`: rows take the raised fill |
| `.env-tab`, `.env-tab-panel`                                    | `.env-tabs-tab`, `.env-tabs-panel`                                                         |
| `.env-document-tab`, `-label`, `-close`                         | `.env-document-tabs-tab`, `-tab-label`, `.env-document-tabs-close`                         |
| `.env-breadcrumb`, `.env-breadcrumb-link` and the other parts   | `.env-breadcrumbs-item`, `.env-breadcrumbs-link` and the other parts                       |
| `.env-tree-row`, `.env-tree-detail`, `.env-tree-trailing`       | `.env-tree-item`, `.env-tree-description`, `.env-tree-end`                                 |
| `--env-tree-row-height`                                         | `--env-tree-item-height`; the `--env-tree-row-padding-block-*` tokens keep their names     |
| `.env-menu-theme`, the theme around a Menu's or Menubar's popup | `.env-popup-theme`, which every popup shares                                               |
| `.env-menu-item-trailing`                                       | `.env-menu-item-end`                                                                       |

Change by hand:

- the fields of the data these components take, which are not props: a TreeItem's `detail` and `trailing`; TypeScript reports each one;
- a `contrast` on List.Root whose value is an expression, which `v1-structure` reports;
- a style for DocumentTabs' tab fill or close button: each tab and its close button sit side by side in an `env-document-tabs-item`, which carries the fill, the active indicator and `data-active`, while the tab, `env-document-tabs-tab`, carries `data-tab-id` and `data-preview`, so a selector such as `.env-document-tabs-tab:hover .env-document-tabs-close`, which `v1-classes` reports, matches nothing: write `.env-document-tabs-item:hover .env-document-tabs-close`; the close button is out of the tab order and hidden from assistive technology, and Delete, Backspace or the tab's context menu closes a tab from the keyboard;
- a style for the 0.7 contrast pane, `.env-contrast-row-pane`, which has no class in 1.0: style the Surface around the list;
- a zero-argument `onSort` handler keeps working as `onSortChange`; take the order from its argument instead of toggling it yourself;
- a style for a stacked Table: a Table with `narrowLayout="stack"` stacks its rows through a container query on its region, which is the `env-table` container, instead of measuring it, so the first paint is already stacked. Style stacked rows in that query rather than through `data-stacked`, which is only set once script runs; the region's `37.5em` is its `stackBelow`. The probe it measured, `env-table-stack-probe`, is gone, and `v1-classes` reports it. A stacking region fills the width its context gives it, so give it a width where it sits in a row that sizes to its content.

  ```css
  /* Before, with regionClassName="orders" */
  .orders[data-stacked] .env-table-cell-label {
    font-weight: var(--env-font-weight-semibold);
  }
  /* 1.0 */
  @container env-table (width < 37.5em) {
    .orders .env-table-cell-label {
      font-weight: var(--env-font-weight-semibold);
    }
  }
  ```

Menu.Item with `href` closes the menu as it is followed, and a disabled one renders no link. The strings of DocumentTabs, Breadcrumbs, Pagination, Pager, Table and Tree come from EnvUIProvider's `messages`; their `*Label` props still override them for one component.

Hairlines separate the items of one list, across the full width, and no longer divide regions. Menu.Separator (`env-menu-separator`) spans the menu edge to edge, with no inset from its sides; a style that inset it, such as a margin on the class, now pulls it in again. Markdown rules and table rows keep their lines. DocumentTabs' bar has no base line and the command palette's footer no line above it. A sticky PageHeader and a docked panel's header take the muted fill, `--env-color-bg-muted`, instead of a line once content scrolls beneath them. Panes.Divider (`env-panes-divider`) is the gap between the panes, with a grip of three dots in it and no line: give each pane a Surface so they stand apart across it. Toolbar.Separator keeps its line. No class, prop or token changes: where an application needs a line, draw it with its own `border` on the part's class.

### Overlays and feedback

Status tones say `danger` where 0.x said `error`, popups and dialogs take a `width` of `md` or `lg`, and a panel at the edge of the window is a Sheet. `v1-structure` turns each literal `<Dialog placement="right">` into a Sheet, `v1-props` moves the literal values and `useToast().show({ … })` objects, and `v1-classes` the classes:

| 0.x                                                                                                                            | 1.0                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alert `tone="error"`                                                                                                           | `tone="danger"`                                                                                                                                                                                      |
| `useToast().show({ variant })`: `neutral`, `success`, `info`, `error`                                                          | `tone`: `neutral`, `success`, `info`, `danger`                                                                                                                                                       |
| `ToastVariant`                                                                                                                 | `ToastTone`                                                                                                                                                                                          |
| Toast `placement` and Toast.Provider `defaultPlacement`: `bottom-right`                                                        | `bottom-end`, which is the left in right-to-left text                                                                                                                                                |
| `<Dialog placement="right">`                                                                                                   | `<Sheet side="end">`, with the same title, content, actions and focus props                                                                                                                          |
| Dialog `size`: `standard`, `wide`                                                                                              | `width`: `md` (the default), `lg`                                                                                                                                                                    |
| Popover and HoverCard `width`: `standard`, `wide`                                                                              | `md` (the default), `lg`                                                                                                                                                                             |
| Spinner `size`: `small`, `standard`, `large`                                                                                   | `sm`, `md` (the default), `lg`                                                                                                                                                                       |
| CommandPalette `query`, `onQueryChange`, `onSelect`, `closeOnSelect`                                                           | `inputValue`, `onInputValueChange`, `onAction`, `closeOnAction`                                                                                                                                      |
| `CommandPaletteSelectOptions`                                                                                                  | `CommandPaletteActionOptions`                                                                                                                                                                        |
| `CommandPaletteItem` `detail`, `trailing`                                                                                      | `description`, `end`                                                                                                                                                                                 |
| The manual `Toast` and `ToastProps`                                                                                            | Removed: `useToast()` inside `Toast.Provider`, and `ToastNotification`                                                                                                                               |
| `env-modal-pane`                                                                                                               | `env-dialog-popup`; a Sheet's surface is `env-sheet-popup`, and both are `env-dialog-surface`                                                                                                        |
| `env-bar` and its parts, such as `env-bar-track`                                                                               | `env-meter` and its parts; a Progress's are `env-progress*`. `env-bar` is the navigation Bar in 1.0, so the codemod renames 0.x's `env-bar` alone and leaves the Bar's parts, such as `env-bar-item` |
| `env-empty-copy`, `env-empty-state-error`, `env-empty-state-center`                                                            | `env-empty-state-description`, `[data-tone='danger']`, `[data-align='center']`                                                                                                                       |
| `env-toast-{variant}`, `env-toast-viewport-{placement}`                                                                        | `.env-toast[data-tone]`, `.env-toast-viewport[data-placement]`                                                                                                                                       |
| `env-spinner-{size}`                                                                                                           | `.env-spinner[data-size]`                                                                                                                                                                            |
| `env-popover-theme`, `env-popover-positioner`, `env-tooltip-theme`, `env-tooltip-positioner` on Popover, HoverCard and Tooltip | `env-popup-theme`, `env-popup-positioner`; HoverCard's surface is `env-hover-card`                                                                                                                   |

The panel at the edge of the window was Drawer in 1.0.0-prerelease.0; it is Sheet now, with the same props, and `side="bottom"` for a bottom sheet. 0.x had no Drawer, and the name is the [navigation drawer's](#navigation-forms) now, so no codemod renames it: `v1-structure` reports each Drawer without `destinations`, and `v1-classes` each `env-drawer-popup`, `env-drawer-viewport` and `env-drawer-backdrop`, which are `env-sheet-popup`, `env-sheet-viewport` and `env-sheet-backdrop`. Rename them, and `DrawerProps`, by hand:

```tsx
// 1.0.0-prerelease.0
<Drawer title="Filters" trigger={<Button>Filters</Button>} side="end">
  {filters}
</Drawer>;

// 1.0
<Sheet title="Filters" trigger={<Button>Filters</Button>} side="end">
  {filters}
</Sheet>;
```

Popover and HoverCard size to their content, from 12 rem up to their `width`, which is a maximum now rather than a fixed width (`md` 20 rem, `lg` 28 rem). Menus, tooltips, popovers, hover cards and the pickers' popups are never wider than the room beside their trigger. To keep a fixed width, set `inline-size` through `className`:

```css
.rename-popover {
  inline-size: 28rem;
}
```

Change these by hand where the codemods report them:

- a Dialog `placement` that is an expression; a `placement="right"` Dialog becomes a Sheet only when the value is a literal;
- a `show()` argument that isn't an object literal, such as a variable holding the notification, whose `variant` becomes `tone`;
- the fields of `CommandPaletteItem` objects, `detail` and `trailing`, which the codemods can't tell apart from other objects; the type checker reports them where the array is typed;
- an `env-bar` selector of a Progress, which the codemods rename to `env-meter`: rename it to `env-progress`;
- selectors on `[data-tone='error']` of Alert or a toast, which are `[data-tone='danger']`.

Behaviour that changes without a rename:

- A danger toast is an alert as it appears and is never hidden behind the count of older notifications; the other notices are read by a polite status beside the regions, which are named Notifications and Top notifications where they were Bottom right notifications and Top center notifications.
- A Sheet's close button is an IconButton with a cross, named Close in the provider's language, where the side panel's was an icon button named by `closeLabel`; `closeLabel` still names it. Focus starts on the first element in the sheet that takes Tab, such as that button, as it did in the side panel.
- `onOpenChange` of Dialog, Sheet, Popover and HoverCard receives the reason as its second argument, such as `escape-key`; a handler that takes one argument is unaffected.
- A disabled control inside a Tooltip is reached by its wrapper, which takes its role and name and `aria-disabled`.
- A Tooltip passes its native props and `ref` on to its control, so it can be the `trigger` of a Menu.Root, Popover, Dialog, Sheet or ConfirmDialog, and goes to their trigger when it wraps one. Untyped 0.x code that gave a Tooltip `className`, `style`, data attributes or handlers had them dropped; in 1.0 they reach the control, so remove them or move a popup class to `popupClassName`, which adds a class to the tooltip's popup. It stays closed while the control's menu or popover is open. Around a HoverCard, or as its trigger, it shows no tooltip.
- CommandPalette's options take ListRow's anatomy, with the description under the label, and its result count is announced.

### Content and display

The Card family is one Card, InfoChip is a Badge, sizes and slots take the 1.0 words, and envUI ships no logos. `v1-names` renames the exports, `v1-structure` rewrites ActionCard and Card's `as` and reports FeatureCard, `v1-props` moves the literal values and `v1-classes` the classes:

| 0.x                                                                                               | 1.0                                                                                                                         |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `<ClickableCard href>`, `<Card as="button" onClick>`, `<ClickableCard onClick>`                   | `<Card href>`, `<Card onClick>`: a card with `onClick` is a native button                                                   |
| `<Card as="article">`                                                                             | `<Card render={<article />}>`                                                                                               |
| `<ActionCard title meta actions>`                                                                 | `<Card render={<article />} title meta actions>`                                                                            |
| `<FeatureCard icon title description action>`                                                     | Card's [feature card](components/card.md#feature-card): a Card holding a Row with the icon, a Column of Text and the Button |
| Card `heading`                                                                                    | `title`, as on Dialog; `headingLevel` still sets its level                                                                  |
| Card `tone`: `row`, `pane`, `canvas`                                                              | `background`: `muted` (the default), `default`, `page`                                                                      |
| Card `layout`: `content`, `action`, and `feature` and `icon` (1.0.0-prerelease.0)                 | Removed: `actions` gives the action strip, and the feature layout is Card's [feature card](components/card.md#feature-card) |
| `ClickableCardProps`, `ActionCardProps`, `FeatureCardProps`                                       | `CardProps`                                                                                                                 |
| `env-clickable-card`, `env-action-card`                                                           | `.env-card[data-interactive]`, `.env-card[data-actions]`                                                                    |
| `env-action-card-heading`, `-meta`, `-body`, `-actions`                                           | `env-card-header`, `-meta`, `-body`, `-footer`                                                                              |
| `<InfoChip>`, `InfoChipProps`, `env-info-chip`                                                    | `<Badge>`, a neutral soft pill; `BadgeProps`; `env-badge`                                                                   |
| Badge `variant="subtle"`                                                                          | `soft`, the default                                                                                                         |
| Avatar and AvatarGroup `size`: `small`, `standard`, `large`, `display`                            | `sm`, `md` (the default), `lg`, `xl`; `env-avatar-{size}` is `.env-avatar[data-size]`                                       |
| Avatar `label`, which named it as an image                                                        | `named`                                                                                                                     |
| Avatar `hue` and `data-hue`: `blue`, `teal`, `green`, `amber`, `red`, `violet`, `purple`, `slate` | `powder`, `seafoam`, `sage`, `butter`, `blush`, `periwinkle`, `orchid`, `oat`; `v1-props` rewrites a literal `hue`          |
| AvatarButton `size`: `small`, `standard`, `large`; `detail`                                       | `sm`, `md`, `lg`; `description`                                                                                             |
| AnimatedNumber `format`                                                                           | `formatValue`, as on Slider and CalendarHeatmap                                                                             |
| SegmentedControl `options`, `SegmentedControlOption`                                              | `items`, `SegmentedControlItem`                                                                                             |
| `env-segment`, `env-segment-label`, `env-segment-count`                                           | `env-segmented-control-item`, `-item-label`, `-item-count`                                                                  |
| `BrandLogo`, `EnvUILogo` and their props types                                                    | Removed: keep your artwork in the application, as an SVG file or a component that draws it with `Icon`                      |

Change these by hand where the codemods report them, or where they can't see them:

- a native `title` on a 0.x content Card, the tooltip of its element: `title` is the card's heading in 1.0, and the native attribute is not a prop of a card, so `v1-props`, which renames `heading` to `title`, leaves it to you: move the tooltip to an element inside the card;
- a Card `as` that is an expression; a ClickableCard without `href` or `onClick`, such as a submit button, which is a content card in 1.0: give it `onClick`, or put a Button inside;
- a style for `env-card-content`, which 0.7 put on a card without actions and on an action card's body, and which `v1-classes` reports: style `.env-card:not([data-actions])` for the card, or `.env-card-body` for the body of a card with actions;
- a Card with `layout="action"`, or an ActionCard, without `actions`, which the codemods report: actions alone give a 1.0 card its action strip, so pass the actions it should show;
- a Card `tone`, Badge `variant` or Avatar `size` whose value is an expression, which takes its new name and may need its values mapped;
- a link or button card named with `aria-label` or `aria-labelledby` that leaves out part of its visible text: let its content name it;
- a native `onToggle` on Disclosure, which `v1-props` reports: use `onOpenChange(open)`, with `open` or `defaultOpen`;
- `BrandLogo` and `EnvUILogo`, which the codemod reports and leaves in place;
- `formatLabel` and `formatMore` on AvatarGroup, `formatLabel` on Rating and DiffStat, `statusLabel` on Message, `nowLabel` on RelativeTime and `lessLabel` and `moreLabel` on CalendarHeatmap that only translated the English text: set the strings once with `messages` on EnvUIProvider instead; the props still override them for one instance.

Behaviour that changes without a rename: a link card's accessible name is its text; Card takes `headingLevel` and `description`; Rating's number, DiffStat's and AvatarGroup's counts, AnimatedNumber and CalendarHeatmap's months, weekdays, dates and values follow EnvUIProvider's `locale`; buttons in Message's `actions` without a variant are small ghost buttons; an unchosen segment's count is muted text at 4.5:1 instead of 80% opacity; CopyButton takes `write`, a clipboard writer of the application's own.

### Skeletons

Skeleton is gone: a component that paints a container, such as Surface, Card, List.Root and List.Item, Table.Root, Alert, Message, TopBar, Drawer, Rail, Bar, Dialog, Sheet, Popover, HoverCard, Menu.Root or Panes.Supporting, takes `skeleton` and shows itself, and everything inside it, as a skeleton. The page renders its normal components over placeholder items while they load, so it has no separate loading version. `v1-names` reports each `Skeleton` and `SkeletonProps`, and `v1-classes` each `env-skeleton` and `env-skeleton-highlight`:

| Before                                                    | Now                                                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `<LoadingState label="…">` around `<Skeleton>` blocks     | The component itself, `<List.Root skeleton={!items}>`, over `items ?? placeholders<Item>(3)` |
| `<Skeleton width="40%" height="1.25rem" />` for a heading | The heading, `<Text variant="title">{item?.name}</Text>`: missing text is a bar              |
| `NavList.Skeleton`                                        | `<Drawer skeleton>`, `<Rail skeleton>` or `<Bar skeleton>` over its destinations             |
| `<LoadingState>` for loading with no known shape          | `<Spinner label="…" showLabel />`, a spinner with its label beside it                        |
| `.env-skeleton` in a style sheet                          | `[data-env-skeleton]`, on the skeleton's root, and what is inside it                         |

- A skeleton's root is a busy region, `aria-busy`, which assistive technology hears once, and its content, in an inert wrapper without a box of its own, can't be focused or read until it loads. A list, which holds no wrapper, is inert as a whole, with a visually hidden status beside it that says what is loading; a table holds its wrapper inside its scroll region. Turning `skeleton` on or off renders the content anew.
- Text becomes bars and icons, media and controls filled shapes of their size, with a soft highlight that sweeps across them in step across the page, and still with a reduced-motion preference. Give media an aspect ratio so it holds its place.
- `placeholders<Item>(count)` returns stand-in items with an `id` each and every other field of `Item` possibly undefined, as the type says, and `isPlaceholder(item)` tells one apart; `useSkeleton()` tells a component of the application's own that it is inside a skeleton.
- LoadingState is gone: a [Spinner](components/spinner.md) with `showLabel` shows a spinner with its `label`, as [folded components](#folded-components-and-patterns) says, and takes no children.
- The documentation's Skeleton page is the [Loading](patterns/loading.md) pattern.

### Folded components and patterns

A few components of 1.0.0-prerelease.0 fold into others, and a few become patterns: arrangements that applications arrange differently, which the documentation shows how to build from envUI's components instead of shipping them. `v1-structure` rewrites the mechanical ones, `v1-names` reports the others where they are used, and `v1-classes` reports their classes:

| 1.0.0-prerelease.0                                                                       | 1.0                                                                                                                               |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `<CloseButton onClick={close} />`                                                        | `<IconButton variant="ghost" icon={<Close />} aria-label="Close" onClick={close} />`, `Close` from `@envsemble/envui/icons/Close` |
| `<Button iconOnly icon={<Settings />} aria-label="…">`                                   | `<IconButton icon={<Settings />} aria-label="…">`: IconButton is the one icon-only button                                         |
| `CloseButtonProps`, `env-close-button`                                                   | `IconButtonProps`, `env-icon-button`                                                                                              |
| `<CounterBadge value={12} />`, 0.x's `<Counter value={12} />`                            | `<Badge count={12} />`: a Badge with `count` is a compact count                                                                   |
| `<CounterBadge value={2} tone="accent" />`                                               | `<Badge count={2} tone="accent" variant="solid" />`                                                                               |
| `CounterBadgeProps`, `env-counter-badge`, `env-counter-badge-label`                      | `BadgeProps`, `.env-badge[data-count]`, `env-badge-count-label`                                                                   |
| `--env-counter-badge-fg`, `-bg`, `-border`, which a control set for the counts inside it | `--env-badge-count-fg`, `-bg`, `-border`                                                                                          |
| `<LoadingState label="Loading projects" />`                                              | `<Spinner label="Loading projects" showLabel />`: a status line, marked busy, with the spinner and its label                      |
| `<LoadingState />`                                                                       | `<Spinner showLabel />`, which says Loading in the provider's language                                                            |
| `LoadingStateProps`, `env-loading-state`, `env-loading-state-label`                      | `SpinnerProps`, `.env-spinner[data-show-label]`, `env-spinner-label`                                                              |

- Under a coarse pointer, CloseButton's hit area reached the touch size also where its container drew it smaller, as in a chip or a tab. An IconButton does that where its container sets `--env-icon-button-hit-area: var(--env-control-height-touch)` on it or around it: set it for your own small close buttons. A full-size one reaches the touch size by itself.
- CloseButton was named Close in EnvUIProvider's language, from `messages.common.close`, which no component reads any more and is gone. `v1-structure` writes `aria-label="Close"` where a CloseButton had no name of its own, and reports it: translate it as the application translates its own strings. The CloseButton page is the Button page's close and remove section (`close-button` is `button`).
- A Spinner with `showLabel` is LoadingState as it was: a status region marked busy, whose label is read as the status. It renders a `span`, `.env-spinner[data-show-label]`, where LoadingState rendered a `div` Row with `data-env-layout="row"`: a ref typed `HTMLDivElement` takes `HTMLSpanElement`, and CSS aimed at that `div` or its layout attributes needs updating. `v1-structure` rewrites a LoadingState without children and reports the children of one that has them, the skeleton blocks of 1.0.0-prerelease.0, which belong in the component itself with `skeleton`.
- Stat is gone, with Stat.Root, Stat.Group and their types: a figure has no behavior of its own, so the [key figures](patterns/key-figures.md) pattern builds it from a muted Text label, a headline Text figure in tabular digits and a Badge that says the trend in words, in its tone and with a trending icon; a Surface with `role="group"` around a Grid of even columns holds a few. `v1-names` reports Stat and its types where they are used, and `v1-classes` the `env-stat-*` classes: rebuild each one as a feature card.
- EmptyState is gone, with `EmptyStateProps`: it carried no behavior, so the [empty states](patterns/empty-states.md) pattern builds one from a Column with an icon, a Text heading, a Text sentence and a Button. Give the heading the level the page's outline needs, such as `render={<h4 />}` under a section's `h3`, where EmptyState took `headingLevel`; centre the column, with a 2.5 rem icon, where `align="center"` did; and show a failure as an Alert with `tone="danger"` and `announce`, where `tone="danger"` gave the state the alert role. `v1-names` reports it where it is used, and `v1-classes` the `env-empty-state-*` classes.
- OrganizationSwitcher is gone, with `OrganizationSwitcherProps`, `OrganizationSwitcherItem`, the prerelease's `OrganizationSwitcherOrganization` and `messages.organizationSwitcher`, and so is 0.x's OrganizationMenu: the [account and organizations](patterns/account-and-organizations.md) pattern builds it from a Menu.Root whose trigger is a secondary Button that names the active organization, a Menu.RadioGroup of Menu.RadioItems with the person's role as each `description`, and a Menu.Item that creates one; before the first organization, the create action is a Button of its own. `v1-names` reports it where it is used, and `v1-classes` the `env-organization-switcher-*` and `env-organization-menu-*` classes.
- SearchTrigger, from 1.0.0-prerelease.1, is gone, with `SearchTriggerProps`, its classes `env-search-trigger`, `env-search-trigger-label`, `env-search-trigger-shortcut` and `env-search-trigger-tooltip`, and `messages.searchTrigger`: the [button that opens a CommandPalette](components/command-palette.md#opening-it-the-button-and-the-shortcut) is built from a secondary Button with the Search icon, its label and the shortcut's keys in Button's new `end` slot, or from a ghost IconButton in a Tooltip. The trigger no longer presses itself on its shortcut: listen for ⌘K or Ctrl+K once, at the application's root, and open the same search, as CommandPalette's page shows. `useModifierKey()` gives the platform's modifier, `Meta` or `Control`, and its key cap, ⌘ or Ctrl, as the removed SearchTrigger chose it: Ctrl on the server and while hydrating, then ⌘ on Apple platforms, so server-rendered markup hydrates. `v1-names` reports SearchTrigger where it is used, and `v1-classes` its classes:

  ```tsx
  // Before
  <SearchTrigger fullWidth onClick={openSearch} />;
  <SearchTrigger iconOnly onClick={openSearch} />;

  // 1.0, with const modifier = useModifierKey() in the component
  <Button
    variant="secondary"
    fullWidth
    startIcon={<Search />}
    end={<Kbd keys={[modifier.label, 'K']} aria-hidden />}
    aria-keyshortcuts={`${modifier.key}+K`}
    onClick={openSearch}
  >
    Search
  </Button>;
  <Tooltip content="Search" side="bottom">
    <IconButton variant="ghost" icon={<Search />} aria-label="Search" onClick={openSearch} />
  </Tooltip>;
  ```

- Card's feature layout is gone, with `layout`, which is `stack` alone otherwise, its `icon`, `data-layout`, `env-card-layout` and `env-card-icon`, and so is 0.x's FeatureCard: Card's [feature card](components/card.md#feature-card) is a Card holding a Row with the icon in muted Text, a Column with a headline Text heading and a Text sentence, and the Button that starts the feature, which moves below the text in a narrow card. `v1-props` drops `layout="stack"` and reports `layout="feature"` and `icon`, `v1-structure` reports FeatureCard, and `v1-classes` the classes and `[data-layout]`: rebuild each one as a feature card. A card with actions is `.env-card[data-actions]`.
- A Badge with `count` takes `tone` and `variant` as any badge does, so the accent count of a CounterBadge, a filled pill, is `tone="accent" variant="solid"`, which `v1-structure` writes; it reports a `tone` that is an expression. Its `aria-label`, such as 12 unread, is read in place of the number, as CounterBadge's was.
- Without a `variant`, `Button iconOnly` was a primary button outside a container that gives one, and IconButton is secondary: `v1-structure` reports each one it rewrites without a variant, so add `variant="primary"` where it should stay primary, and each that sets `fullWidth`, `underline` or a `tone` without a `variant`, which IconButton doesn't take. It reports an `iconOnly` that is an expression and leaves it.

### useTheme returns the theme, its contrast and its scale

`useTheme()` returns `{ theme, contrast, scale }` instead of the color scheme alone. Read the scheme as `const { theme } = useTheme()`. An application's own portal that re-themed with `<Theme theme={useTheme()}>` takes all three with `<Theme {...useTheme()}>`, so it keeps a high contrast or a `standard` opt-out and the compact scale too; `v1-names` makes that change, turns other calls into `useTheme().theme` unless the file already reads them as `{ theme, contrast }`, and reports those whose value is returned or passed to a context. In JavaScript, `theme={useTheme()}` would render `data-env-theme="[object Object]"`, so in development Theme warns about a `theme` that is not `light` or `dark`.

### Part names and component tokens

A component's part classes, `env-<component>-<part>` such as `.env-card-header`, and its state attributes, `data-*` such as `[data-tone='danger']`, are public and versioned: an application's CSS may target them, and a release that renames or removes one is a major release with a note here. `docs/generated/parts.json` lists every component's parts and states. So are its color properties, `--env-<component>-<role>` such as `--env-button-container`, which set its colors on one instance ([Customize and extend](customizing.md)). The other custom properties a component declares for itself, its component tokens such as `--env-card-padding` or `--env-badge-fill`, are private and may change in any release: set the system tokens instead.

```css
/* Before: a component token */
.release-card {
  --env-card-padding: 1.5rem;
}
/* 1.0: the part, with a system token */
.release-card .env-card-body {
  padding: var(--env-space-5);
}
```

The `no-private-classes` rules are gone from the ESLint plugin and the Stylelint config, since the classes they reported are public. ESLint and Stylelint report a rule they don't know, so delete it from any configuration or disable comment that names it:

```js
// Before
rules: { 'envui/no-private-classes': 'off' }
// 1.0: nothing to configure
```

### Color properties and state layers

1.0.0-prerelease.2 gives each component public color properties, `--env-<component>-<role>` with the roles container, content, outline, icon, selected, selected-content and indicator, which override its colors on one instance; envUI's own colors don't change. Set one through `style` or a selector that matches the instance: the properties don't inherit, so one set on a wrapper colors nothing inside it. Once a container or content color is set, the component's hover, focus and press are state layers of the content color over the container. A few component tokens of prerelease.1 became color properties, and the codemods' `v1-classes` renames them; the toast's hover and pressed tokens are gone, and `v1-classes` reports them:

| prerelease.1                           | prerelease.2                                   |
| -------------------------------------- | ---------------------------------------------- |
| `--env-list-item-fill`                 | `--env-list-item-container`                    |
| `--env-alert-tint`, `--env-alert-edge` | `--env-alert-container`, `--env-alert-outline` |
| `--env-alert-tone`                     | `--env-alert-icon`                             |
| `--env-toast-fill`, `--env-toast-edge` | `--env-toast-container`, `--env-toast-outline` |
| `--env-toast-fill-hover`, `-pressed`   | Gone: set the container alone                  |

The old tokens inherited, and the color properties don't: a token set on a wrapper, such as `.my-alert { --env-alert-tint: … }` around an Alert, reached the component inside it, while its color property set there colors nothing. Set it on the component itself, through a selector that ends at it, such as `.my-alert .env-alert`, or its `className` or `style`. `v1-classes` reports each declaration of an old token in a rule whose selector doesn't end at the component's class; a selector that matches the component through a class of your own, such as `.my-alert` passed as the Alert's `className`, is reported too and needs no change. It can't tell where a style object or a `setProperty` call sets one on a wrapper element: check those by hand.

`--env-badge-outline`, a private border shorthand in prerelease.1, such as `0.0625rem solid <color>`, is the badge's outline color now: write `--env-badge-outline: <color>` rather than a border, since a shorthand is an invalid color and leaves the badge with no edge. A stylesheet that recolored one component's states by its own rules can set its container and content instead: the states follow.

### Templates and agent tools

The templates are gone from the documentation: the app frame, index, details, settings, dashboard, sign-in and error pages, and their screens. The [app frame](patterns/app-frame.md) is a pattern now, and the other patterns cover the rest.

The prereleases' agent tooling is gone too: the `envui` command with its `agents` index and `mcp` server, the envui-use, envui-migrate and envui-contribute skills, the `envui` plugin with its marketplaces, and `manifest.json`, `llms.txt` and `llms-full.txt` at the package root. Agents read the documentation the package ships, led there by a few lines in `AGENTS.md`, and the [setup skill](agent-tooling.md) the site hosts sets a project up. Remove what a project kept:

| Kept from a prerelease                                                                                               | What to do                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| The `envui` MCP server, in `.mcp.json`, Codex's `[mcp_servers.envui]` or another client's configuration              | Remove it, such as with `claude mcp remove envui` or `codex mcp remove envui`.                                             |
| The index `envui agents` wrote between `<!-- BEGIN envui -->` and `<!-- END envui -->` in `AGENTS.md` or `CLAUDE.md` | Replace it with [the pointer](agent-tooling.md#the-agentsmd-pointer), between the same markers.                            |
| `npx --no envui agents --check` in CI or a script                                                                    | Remove it: the pointer names no version, so it never goes stale.                                                           |
| The envui-use, envui-migrate and envui-contribute folders in `.agents/skills` or `.claude/skills`                    | Delete them.                                                                                                               |
| The plugin `envui@envui` and the `envui` marketplace in Claude Code or Codex                                         | Uninstall the plugin and remove the marketplace, such as from Claude Code's `/plugin`.                                     |
| Code that reads `manifest.json`, `llms.txt` or `llms-full.txt` from the package                                      | Read `docs/index.md` and the pages, `docs/generated/props.json` and `docs/generated/parts.json`, or the type declarations. |

The setup skill does this too: paste `Set up envUI in my app: envui.envsemble.com/SKILL.md` into the agent, and it removes the server and the skills it finds and replaces the index with the pointer.

### Cascade layers

envUI's style sheet puts every rule in a cascade layer of `env`: `env.reset`, `env.tokens`, `env.base`, `env.components` and `env.utilities`. CSS outside cascade layers now overrides it whatever its specificity, which is what lets an application restyle a component without `!important`. It also means that rules which used to lose to envUI's more specific selectors now win, so check the application's own CSS:

- **Resets and element styles.** A global or element rule outside layers, such as `* { margin: 0 }`, `button { background: none; border: 0 }` or `h2 { font-size: 1.5rem }`, now restyles envUI's components too. So does a preflight that a utility framework adds outside layers. Put resets and element base styles in a layer declared before `env`, and the application's own component styles after it:

  ```css
  @layer reset, env, app;
  @layer reset {
    * {
      margin: 0;
    }
    button {
      background: none;
      border: 0;
    }
  }
  ```

  Declare the order before any style sheet that uses the layers, envUI's included, so a library whose layers load first takes its place in that order too. A framework that brings layers of its own, such as `base`, `components` and `utilities`, takes its place in the same statement: its base layer, with its preflight, before `env`, and its components and utilities after it, so they can restyle envUI's:

  ```css
  @layer reset, base, env, components, utilities, app;
  ```

- **Token overrides.** A token set on `.env-theme` outside layers now wins over every theme's value: a color set there applies in dark and at high contrast as well, and can break the contrast every theme is checked for. Override a token per theme and contrast, with the selectors the themes use, in this order:

  ```css
  .env-theme {
    --env-color-fg-link: #0b57d0;
  }
  .env-theme[data-env-theme='dark'] {
    --env-color-fg-link: #a8c7fa;
  }
  .env-theme[data-env-contrast='high'] {
    --env-color-fg-link: #0842a0;
  }
  .env-theme[data-env-theme='dark'][data-env-contrast='high'] {
    --env-color-fg-link: #d3e3fd;
  }
  /* Under the system's prefers-contrast: more, high contrast applies to a boundary that sets no
     data-env-contrast too, unless it opts out with 'standard'. */
  @media (prefers-contrast: more) {
    .env-theme:not([data-env-contrast='standard']) {
      --env-color-fg-link: #0842a0;
    }
    .env-theme[data-env-theme='dark']:not([data-env-contrast='standard']) {
      --env-color-fg-link: #d3e3fd;
    }
  }
  ```

- **Styles come with the components.** Each component's module imports its own style sheet, so a bundler loads the CSS of the components the application uses. Remove the `@envsemble/envui/styles.css` import when you use a bundler; keep it, and only it, without one. Loading both loads the styles twice. Declare the application's layer order in a style sheet imported before any component, as [setup](setup.md#styles-come-with-the-components) describes.
- **`!important`.** An important declaration in a cascade layer beats every important declaration outside layers. envUI declares nothing `!important`, so an `!important` in the application's style sheets wins over envUI as any of its rules does.

### Tokens

Every token is a custom property with the `--env-` prefix in 1.0, and colors are named by semantic role, `--env-color-{bg|fg|border}-{role}[-{emphasis}][-{state}]` (see [colors](foundations/colors.md)). The 0.7 alias tokens are removed, each for the token that replaces it; a few names change beyond the prefix, such as the old corner scale, which is the radius scale now; and the unused ones and the state values that the hover and pressed color tokens replace are removed. `v1-classes` rewrites every use of a name below in style sheets and scripts, and a declaration of a token's own name, so a style sheet that themes envUI by setting `--color-fg-link` then sets `--env-color-fg-link`. Where several names below become one token, a declaration of any other of them, such as an alias's `--color-link: …` or `--control-height-small: …`, stays and is reported: rewritten, it would set the token for every component that reads it, or declare it twice in one block. Decide by hand whether the application means the token, and set it or delete the line. Check a renamed declaration of an application property that happens to share an old token's name, such as `--space-4`. The `tokens` section of the codemods' rename map lists the same entries.

A style sheet that themes envUI through its tokens needs a look for [cascade layers](#cascade-layers) too. A removed name that a style only reads, such as `--member-identity-gap` in a vendor widget's styles, reads nothing in 1.0, so its fallback or nothing applies: `v1-classes` reports it, and the application declares the value it wants as a custom property of its own.

envUI draws no elevation shadows in 1.0: toasts and tooltips separate by their fill and a clearly visible edge, sheets by their fill and the scrim, and popups and dialogs by their fill and one soft shadow, `--env-popup-shadow`; where they are solid, at high contrast, their level's edge, `--env-elevation-{level}-border`, returns. The elevation shadows, `--elevation-{0…3}-shadow` and `--env-elevation-{0…3}-shadow`, are removed, and `v1-classes` reports each use: delete the `box-shadow`, and give a floating layer of your own the level's edge instead. Focus rings and other rings drawn with `box-shadow` are not shadows and stay.

The avatar hues are renamed and their fills are pastel now, with initials and a figure in a deep shade of the same hue rather than white: `--env-color-avatar-bg-teal` is `--env-color-avatar-bg-seafoam`, and so on. `v1-classes` renames a declaration of the old fill, but a fill the application set there for its own color now sits under the hue's deep foreground, so set `--env-color-avatar-fg-{hue}` and `--env-color-avatar-figure-{hue}` beside it, such as `--env-color-avatar-fg-seafoam`, to a color that keeps 4.5:1 on that fill.

<!-- token-migration:start: npm run tokens:build writes this list from packages/ui/src/generated/token-migration.json. Change the tokens, not the list. -->

Renamed beyond the prefix:

| Before 1.0                             | 1.0                                           | Note                                                                                                                                                                                                                                                           |
| -------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--avatar-group-ring`                  | `--env-avatar-group-ring`                     | In 0.x, the ring color an application set for an avatar group on a fill that was not an envUI surface.                                                                                                                                                         |
| `--body-font-weight`                   | `--env-font-weight-body`                      | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--color-bg-accent-emphasis`           | `--env-color-bg-primary-solid`                | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-accent-muted`              | `--env-color-bg-primary-muted`                | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-accent-subtle-hover`       | `--env-color-bg-primary-subtle-hover`         | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-accent-subtle-pressed`     | `--env-color-bg-primary-subtle-pressed`       | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-brand-emphasis`            | `--env-color-bg-primary-emphasis`             | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-brand-emphasis-hover`      | `--env-color-bg-primary-emphasis-hover`       | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-brand-emphasis-pressed`    | `--env-color-bg-primary-emphasis-pressed`     | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-brand-muted`               | `--env-color-bg-primary-muted`                | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-brand-strong`              | `--env-color-bg-primary-strong`               | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-brand-strong-hover`        | `--env-color-bg-primary-strong-hover`         | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-brand-strong-pressed`      | `--env-color-bg-primary-strong-pressed`       | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-important-strong`          | `--env-color-bg-accent-strong`                | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-important-strong-hover`    | `--env-color-bg-accent-strong-hover`          | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-important-strong-pressed`  | `--env-color-bg-accent-strong-pressed`        | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-bg-overlay`                   | `--env-color-bg-backdrop`                     | The layer behind a modal is the backdrop, as Base UI and the Colors page name it.                                                                                                                                                                              |
| `--color-bg-overlay-muted`             | `--env-color-bg-backdrop-muted`               | The layer behind a modal is the backdrop, as Base UI and the Colors page name it.                                                                                                                                                                              |
| `--color-bg-page-muted`                | `--env-color-bg-inset`                        | Named for its role: a background that leans back toward the page inside a fill.                                                                                                                                                                                |
| `--color-border-accent`                | `--env-color-border-primary-emphasis`         | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge.                                                                                                                                                         |
| `--color-border-accent-emphasis`       | `--env-color-border-primary`                  | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.                                                                                                                                                            |
| `--color-border-accent-hover`          | `--env-color-border-primary-emphasis-hover`   | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge.                                                                                                                                                         |
| `--color-border-accent-muted`          | `--env-color-border-primary-muted`            | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-border-accent-pressed`        | `--env-color-border-primary-emphasis-pressed` | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge.                                                                                                                                                         |
| `--color-border-danger`                | `--env-color-border-danger-emphasis`          | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge.                                                                                                                                                         |
| `--color-border-danger-emphasis`       | `--env-color-border-danger`                   | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.                                                                                                                                                            |
| `--color-border-danger-hover`          | `--env-color-border-danger-emphasis-hover`    | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge.                                                                                                                                                         |
| `--color-border-danger-pressed`        | `--env-color-border-danger-emphasis-pressed`  | The solid edge is the tone’s emphasis now, as a solid fill is; the plain name is its translucent edge.                                                                                                                                                         |
| `--color-border-done-emphasis`         | `--env-color-border-done`                     | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.                                                                                                                                                            |
| `--color-border-neutral-emphasis`      | `--env-color-border-neutral`                  | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.                                                                                                                                                            |
| `--color-border-pressed`               | `--env-color-border-muted-pressed`            | 0.7 defined it, but envUI didn't read it; the muted border's pressed state is the role it named.                                                                                                                                                               |
| `--color-border-success-emphasis`      | `--env-color-border-success`                  | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.                                                                                                                                                            |
| `--color-border-translucent`           | `--env-color-border-media`                    | Named for its role: the inner edge of content of any color, such as images and color areas.                                                                                                                                                                    |
| `--color-border-warning-emphasis`      | `--env-color-border-warning`                  | The translucent edge is the tone’s plain border now, between its muted edge and its solid emphasis.                                                                                                                                                            |
| `--color-control-blue-hover`           | `--env-color-bg-primary-strong-hover`         | 0.7 defined it, but envUI didn't read it; the brand's strong fill is the role it named.                                                                                                                                                                        |
| `--color-control-blue-pressed`         | `--env-color-bg-primary-strong-pressed`       | 0.7 defined it, but envUI didn't read it; the brand's strong fill is the role it named.                                                                                                                                                                        |
| `--color-control-text`                 | `--env-color-fg-control`                      | A synonym of the control text color, which envUI didn't read.                                                                                                                                                                                                  |
| `--color-fg-accent`                    | `--env-color-fg-primary`                      | The blue roles are primary, and the purple of accent actions is accent.                                                                                                                                                                                        |
| `--color-fill-hover`                   | `--env-color-bg-neutral-muted-hover`          | 0.7 defined it, but envUI didn't read it; the neutral muted fill is the role it named.                                                                                                                                                                         |
| `--color-fill-pressed`                 | `--env-color-bg-neutral-muted-pressed`        | 0.7 defined it, but envUI didn't read it; the neutral muted fill is the role it named.                                                                                                                                                                         |
| `--color-neutral-fill`                 | `--env-color-bg-neutral-strong`               | 0.7 defined it, but envUI didn't read it; the neutral strong fill is the role it named.                                                                                                                                                                        |
| `--color-surface-base`                 | `--env-color-bg-raised`                       | 0.7 defined it, but envUI didn't read it; the raised surface is the role it named.                                                                                                                                                                             |
| `--color-surface-raised`               | `--env-color-bg-raised`                       | 0.7 defined it, but envUI didn't read it; the raised surface is the role it named.                                                                                                                                                                             |
| `--color-text-subtle`                  | `--env-color-fg-muted`                        | A synonym of the muted text color, which envUI didn't read.                                                                                                                                                                                                    |
| `--control-height-compact`             | `--env-control-height-sm`                     | The small control height. For a compact app or region, set scale="compact" on its Theme instead.                                                                                                                                                               |
| `--control-height-small`               | `--env-control-height`                        | It always equalled --control-height, which every control reads now.                                                                                                                                                                                            |
| `--env-alert-edge`                     | `--env-alert-outline`                         | An alert's edge is the public color property --env-alert-outline.                                                                                                                                                                                              |
| `--env-alert-tint`                     | `--env-alert-container`                       | An alert's tint is the public color property --env-alert-container, set on the alert.                                                                                                                                                                          |
| `--env-alert-tone`                     | `--env-alert-icon`                            | An alert's icon color, which its dismiss button takes too, is the public color property --env-alert-icon.                                                                                                                                                      |
| `--env-app-shell-header-height`        | `--env-top-bar-height`                        | AppShell is gone; TopBar's height.                                                                                                                                                                                                                             |
| `--env-body-font-weight`               | `--env-font-weight-body`                      | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-checkbox-icon`                  | `--env-checkbox-selected-content`             | The check mark's color is the selected-content role, as on every component.                                                                                                                                                                                    |
| `--env-color-avatar-bg`                | `--env-color-bg-avatar`                       | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-amber`          | `--env-color-bg-avatar-butter`                | The avatar hues are named for their colors: amber is butter. Its fill now takes initials and a figure in a deep shade of the hue, so a fill an application sets here also sets --env-color-avatar-fg-butter and --env-color-avatar-figure-butter.              |
| `--env-color-avatar-bg-blush`          | `--env-color-bg-avatar-blush`                 | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-butter`         | `--env-color-bg-avatar-butter`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-green`          | `--env-color-bg-avatar-sage`                  | The avatar hues are named for their colors: green is sage. Its fill now takes initials and a figure in a deep shade of the hue, so a fill an application sets here also sets --env-color-avatar-fg-sage and --env-color-avatar-figure-sage.                    |
| `--env-color-avatar-bg-oat`            | `--env-color-bg-avatar-oat`                   | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-orchid`         | `--env-color-bg-avatar-orchid`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-periwinkle`     | `--env-color-bg-avatar-periwinkle`            | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-powder`         | `--env-color-bg-avatar-powder`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-purple`         | `--env-color-bg-avatar-orchid`                | The avatar hues are named for their colors: purple is orchid. Its fill now takes initials and a figure in a deep shade of the hue, so a fill an application sets here also sets --env-color-avatar-fg-orchid and --env-color-avatar-figure-orchid.             |
| `--env-color-avatar-bg-red`            | `--env-color-bg-avatar-blush`                 | The avatar hues are named for their colors: red is blush. Its fill now takes initials and a figure in a deep shade of the hue, so a fill an application sets here also sets --env-color-avatar-fg-blush and --env-color-avatar-figure-blush.                   |
| `--env-color-avatar-bg-sage`           | `--env-color-bg-avatar-sage`                  | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-seafoam`        | `--env-color-bg-avatar-seafoam`               | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-bg-slate`          | `--env-color-bg-avatar-oat`                   | The avatar hues are named for their colors: slate is oat. Its fill now takes initials and a figure in a deep shade of the hue, so a fill an application sets here also sets --env-color-avatar-fg-oat and --env-color-avatar-figure-oat.                       |
| `--env-color-avatar-bg-teal`           | `--env-color-bg-avatar-seafoam`               | The avatar hues are named for their colors: teal is seafoam. Its fill now takes initials and a figure in a deep shade of the hue, so a fill an application sets here also sets --env-color-avatar-fg-seafoam and --env-color-avatar-figure-seafoam.            |
| `--env-color-avatar-bg-violet`         | `--env-color-bg-avatar-periwinkle`            | The avatar hues are named for their colors: violet is periwinkle. Its fill now takes initials and a figure in a deep shade of the hue, so a fill an application sets here also sets --env-color-avatar-fg-periwinkle and --env-color-avatar-figure-periwinkle. |
| `--env-color-avatar-fg`                | `--env-color-fg-avatar`                       | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-blush`          | `--env-color-fg-avatar-blush`                 | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-butter`         | `--env-color-fg-avatar-butter`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-oat`            | `--env-color-fg-avatar-oat`                   | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-orchid`         | `--env-color-fg-avatar-orchid`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-periwinkle`     | `--env-color-fg-avatar-periwinkle`            | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-powder`         | `--env-color-fg-avatar-powder`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-sage`           | `--env-color-fg-avatar-sage`                  | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-fg-seafoam`        | `--env-color-fg-avatar-seafoam`               | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure`            | `--env-color-fg-avatar-figure`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-blush`      | `--env-color-fg-avatar-figure-blush`          | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-butter`     | `--env-color-fg-avatar-figure-butter`         | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-oat`        | `--env-color-fg-avatar-figure-oat`            | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-orchid`     | `--env-color-fg-avatar-figure-orchid`         | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-periwinkle` | `--env-color-fg-avatar-figure-periwinkle`     | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-powder`     | `--env-color-fg-avatar-figure-powder`         | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-sage`       | `--env-color-fg-avatar-figure-sage`           | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-avatar-figure-seafoam`    | `--env-color-fg-avatar-figure-seafoam`        | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-bg-overlay`               | `--env-color-bg-backdrop`                     | The layer behind a modal is the backdrop, as Base UI and the Colors page name it.                                                                                                                                                                              |
| `--env-color-bg-overlay-muted`         | `--env-color-bg-backdrop-muted`               | The layer behind a modal is the backdrop, as Base UI and the Colors page name it.                                                                                                                                                                              |
| `--env-color-fg-link-on-tint`          | `--env-color-fg-link-on-muted`                | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-fg-link-on-tint-hover`    | `--env-color-fg-link-on-muted-hover`          | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-fg-link-on-tint-pressed`  | `--env-color-fg-link-on-muted-pressed`        | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-list-item-bg`             | `--env-color-bg-list-item`                    | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-list-item-bg-hover`       | `--env-color-bg-list-item-hover`              | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-list-item-bg-pressed`     | `--env-color-bg-list-item-pressed`            | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-color-rating-star`              | `--env-color-fg-rating-star`                  | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-counter-badge-height`           | `--env-badge-count-height`                    | Color tokens follow one grammar, --env-color-{bg\|fg\|border}-{role}: a component that names a color is its role.                                                                                                                                              |
| `--env-font-size-body-small`           | `--env-font-size-body-sm`                     | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-font-size-heading`              | `--env-font-size-headline`                    | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-font-size-heading-small`        | `--env-font-size-title`                       | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-font-size-label-small`          | `--env-font-size-label-sm`                    | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-list-item-fill`                 | `--env-list-item-container`                   | A row's fill is the public color property --env-list-item-container, set on the row.                                                                                                                                                                           |
| `--env-motion-ease-standard`           | `--env-motion-ease`                           | The standard easing is --env-motion-ease; the alias, the same curve, is gone.                                                                                                                                                                                  |
| `--env-toast-edge`                     | `--env-toast-outline`                         | A toast's edge is the public color property --env-toast-outline.                                                                                                                                                                                               |
| `--env-toast-fill`                     | `--env-toast-container`                       | A toast's fill is the public color property --env-toast-container, set on the toast.                                                                                                                                                                           |
| `--env-topbar-height`                  | `--env-top-bar-height`                        | TopBar's height.                                                                                                                                                                                                                                               |
| `--env-type-body-small`                | `--env-type-body-sm`                          | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-body-small-font-family`    | `--env-type-body-sm-font-family`              | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-body-small-font-size`      | `--env-type-body-sm-font-size`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-body-small-font-weight`    | `--env-type-body-sm-font-weight`              | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-body-small-letter-spacing` | `--env-type-body-sm-letter-spacing`           | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-body-small-line-height`    | `--env-type-body-sm-line-height`              | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h1`                        | `--env-type-headline`                         | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h1-font-family`            | `--env-type-headline-font-family`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h1-font-size`              | `--env-type-headline-font-size`               | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h1-font-weight`            | `--env-type-headline-font-weight`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h1-letter-spacing`         | `--env-type-headline-letter-spacing`          | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h1-line-height`            | `--env-type-headline-line-height`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h2`                        | `--env-type-title`                            | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h2-font-family`            | `--env-type-title-font-family`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h2-font-size`              | `--env-type-title-font-size`                  | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h2-font-weight`            | `--env-type-title-font-weight`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h2-letter-spacing`         | `--env-type-title-letter-spacing`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-type-h2-line-height`            | `--env-type-title-line-height`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--env-window-frame-title-bar-end`     | `--env-top-bar-title-bar-end`                 | WindowFrame is gone: a TopBar with titleBar keeps clear of the window's controls at the end.                                                                                                                                                                   |
| `--env-window-frame-title-bar-start`   | `--env-top-bar-title-bar-start`               | WindowFrame is gone: a TopBar with titleBar keeps clear of the window's controls at the start.                                                                                                                                                                 |
| `--env-z-overlay`                      | `--env-z-backdrop`                            | The layer behind a modal is the backdrop, as Base UI and the Colors page name it.                                                                                                                                                                              |
| `--env-z-peek`                         | `--env-z-supporting-pane`                     | The stacking levels say what they hold: popups, and a supporting pane over its main pane.                                                                                                                                                                      |
| `--env-z-popover`                      | `--env-z-popup`                               | The stacking levels say what they hold: popups, and a supporting pane over its main pane.                                                                                                                                                                      |
| `--font-family-code`                   | `--env-code-font-family`                      |                                                                                                                                                                                                                                                                |
| `--font-size-body-small`               | `--env-font-size-body-sm`                     | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--font-size-code`                     | `--env-code-font-size`                        |                                                                                                                                                                                                                                                                |
| `--font-size-heading`                  | `--env-font-size-headline`                    | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--font-size-heading-small`            | `--env-font-size-title`                       | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--font-size-label-small`              | `--env-font-size-label-sm`                    | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--icon-button-size`                   | `--env-control-height`                        | An icon button is as tall as the other controls of its size.                                                                                                                                                                                                   |
| `--line-height-body`                   | `--env-line-height-body`                      | The body line height an application may set; envUI reads it with a fallback of 1.4.                                                                                                                                                                            |
| `--md-sys-shape-corner-extra-large`    | `--env-radius-xl`                             | The old corner scale is the radius scale now.                                                                                                                                                                                                                  |
| `--md-sys-shape-corner-extra-small`    | `--env-radius-xs`                             | The old corner scale is the radius scale now.                                                                                                                                                                                                                  |
| `--md-sys-shape-corner-full`           | `--env-radius-full`                           | The old corner scale is the radius scale now.                                                                                                                                                                                                                  |
| `--md-sys-shape-corner-large`          | `--env-radius-lg`                             | The old corner scale is the radius scale now.                                                                                                                                                                                                                  |
| `--md-sys-shape-corner-medium`         | `--env-radius-md`                             | The old corner scale is the radius scale now.                                                                                                                                                                                                                  |
| `--md-sys-shape-corner-none`           | `--env-radius-none`                           | The old corner scale is the radius scale now.                                                                                                                                                                                                                  |
| `--md-sys-shape-corner-small`          | `--env-radius-sm`                             | The old corner scale is the radius scale now.                                                                                                                                                                                                                  |
| `--motion-ease-standard`               | `--env-motion-ease`                           | The standard easing is --env-motion-ease; the alias, the same curve, is gone.                                                                                                                                                                                  |
| `--radius-large`                       | `--env-radius-lg`                             | One radius scale: the large corner is its lg step.                                                                                                                                                                                                             |
| `--radius-standard`                    | `--env-radius-sm`                             | One radius scale: the standard corner is its sm step.                                                                                                                                                                                                          |
| `--topbar-height`                      | `--env-top-bar-height`                        | TopBar's height.                                                                                                                                                                                                                                               |
| `--type-body-small`                    | `--env-type-body-sm`                          | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-body-small-font-family`        | `--env-type-body-sm-font-family`              | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-body-small-font-size`          | `--env-type-body-sm-font-size`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-body-small-font-weight`        | `--env-type-body-sm-font-weight`              | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-body-small-letter-spacing`     | `--env-type-body-sm-letter-spacing`           | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-body-small-line-height`        | `--env-type-body-sm-line-height`              | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h1`                            | `--env-type-headline`                         | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h1-font-family`                | `--env-type-headline-font-family`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h1-font-size`                  | `--env-type-headline-font-size`               | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h1-font-weight`                | `--env-type-headline-font-weight`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h1-letter-spacing`             | `--env-type-headline-letter-spacing`          | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h1-line-height`                | `--env-type-headline-line-height`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h2`                            | `--env-type-title`                            | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h2-font-family`                | `--env-type-title-font-family`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h2-font-size`                  | `--env-type-title-font-size`                  | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h2-font-weight`                | `--env-type-title-font-weight`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h2-letter-spacing`             | `--env-type-title-letter-spacing`             | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--type-h2-line-height`                | `--env-type-title-line-height`                | Typography tokens take the names of Text's variants, and sm as every other scale does.                                                                                                                                                                         |
| `--viewport-gutter`                    | `--env-viewport-gutter`                       |                                                                                                                                                                                                                                                                |

The 0.7 aliases, removed, each with the token that replaces it:

| 0.7 custom property                     | 1.0                                       | Used for                           |
| --------------------------------------- | ----------------------------------------- | ---------------------------------- |
| `--color-accent`                        | `--env-color-bg-accent-strong`            | Important buttons                  |
| `--color-accent-hover`                  | `--env-color-bg-accent-strong-hover`      | Important buttons                  |
| `--color-accent-pressed`                | `--env-color-bg-accent-strong-pressed`    | Important buttons                  |
| `--color-action-strip`                  | `--env-color-bg-default`                  | The action strip of a card         |
| `--color-avatar`                        | `--env-color-bg-avatar`                   | Avatars                            |
| `--color-avatar-figure`                 | `--env-color-fg-avatar-figure`            | Avatars                            |
| `--color-border-hover`                  | `--env-color-border-muted-hover`          |                                    |
| `--color-border-strong`                 | `--env-color-border-muted`                |                                    |
| `--color-calendar-selected`             | `--env-color-bg-primary-emphasis`         | Calendars                          |
| `--color-calendar-today`                | `--env-color-border-primary-emphasis`     | Calendars                          |
| `--color-canvas`                        | `--env-color-bg-page`                     |                                    |
| `--color-checkbox`                      | `--env-color-bg-primary-emphasis`         | Checkboxes                         |
| `--color-checkbox-border`               | `--env-color-fg-muted`                    | Checkboxes                         |
| `--color-checkbox-hover`                | `--env-color-bg-primary-emphasis-hover`   | Checkboxes                         |
| `--color-checkbox-pressed`              | `--env-color-bg-primary-emphasis-pressed` | Checkboxes                         |
| `--color-checkbox-ring-hover`           | `--env-color-fg-muted-hover`              | Checkboxes                         |
| `--color-checkbox-ring-pressed`         | `--env-color-fg-muted-pressed`            | Checkboxes                         |
| `--color-checkbox-text`                 | `--env-color-fg-default`                  | Checkboxes                         |
| `--color-chip`                          | `--env-color-bg-neutral-muted`            | Chips                              |
| `--color-chip-text`                     | `--env-color-fg-primary`                  | Chips                              |
| `--color-control-blue`                  | `--env-color-bg-primary-emphasis`         | Spinners, sliders and meters       |
| `--color-destructive-action`            | `--env-color-bg-danger-strong`            | Destructive buttons                |
| `--color-destructive-action-hover`      | `--env-color-bg-danger-strong-hover`      | Destructive buttons                |
| `--color-destructive-action-pressed`    | `--env-color-bg-danger-strong-pressed`    | Destructive buttons                |
| `--color-dialog`                        | `--env-color-bg-raised`                   |                                    |
| `--color-dialog-overlay`                | `--env-color-bg-backdrop`                 |                                    |
| `--color-direction-link`                | `--env-color-bg-raised`                   | Pager links                        |
| `--color-direction-link-border`         | `--env-color-border-muted`                | Pager links                        |
| `--color-direction-link-border-hover`   | `--env-color-border-muted-hover`          | Pager links                        |
| `--color-direction-link-border-pressed` | `--env-color-border-muted-pressed`        | Pager links                        |
| `--color-direction-link-icon`           | `--env-color-fg-primary`                  | Pager links                        |
| `--color-direction-link-label`          | `--env-color-fg-muted`                    | Pager links                        |
| `--color-direction-link-text`           | `--env-color-fg-default`                  | Pager links                        |
| `--color-disabled-text`                 | `--env-color-fg-muted`                    |                                    |
| `--color-disclosure-text`               | `--env-color-fg-muted`                    | Disclosure summaries               |
| `--color-field`                         | `--env-color-bg-field`                    |                                    |
| `--color-field-active`                  | `--env-color-border-primary-emphasis`     | Fields                             |
| `--color-field-border`                  | `--env-color-border-default`              | Fields                             |
| `--color-field-error`                   | `--env-color-fg-danger`                   | Fields                             |
| `--color-field-hint`                    | `--env-color-fg-muted`                    | Fields                             |
| `--color-field-label`                   | `--env-color-fg-muted`                    | Fields                             |
| `--color-field-placeholder`             | `--env-color-fg-muted`                    | Fields                             |
| `--color-field-text`                    | `--env-color-fg-default`                  | Fields                             |
| `--color-fill`                          | `--env-color-bg-neutral-muted`            |                                    |
| `--color-focus-ring`                    | `--env-color-border-focus`                |                                    |
| `--color-icon`                          | `--env-color-fg-muted`                    |                                    |
| `--color-link`                          | `--env-color-fg-link`                     |                                    |
| `--color-link-hover`                    | `--env-color-fg-link-hover`               |                                    |
| `--color-link-pressed`                  | `--env-color-fg-link-pressed`             |                                    |
| `--color-markdown-border`               | `--env-color-border-muted`                | Markdown                           |
| `--color-menu-row`                      | `--env-color-bg-popup`                    | Menu rows                          |
| `--color-navigation-hover`              | `--env-color-bg-selected-hover`           | Navigation items                   |
| `--color-navigation-icon`               | `--env-color-fg-muted`                    | Navigation items                   |
| `--color-navigation-pressed`            | `--env-color-bg-selected-pressed`         | Navigation items                   |
| `--color-navigation-quiet`              | `--env-color-bg-list-item`                | Navigation items                   |
| `--color-navigation-quiet-hover`        | `--env-color-bg-navigation-hover`         | Navigation items                   |
| `--color-navigation-quiet-pressed`      | `--env-color-bg-navigation-pressed`       | Navigation items                   |
| `--color-navigation-selected`           | `--env-color-bg-selected`                 | Navigation items                   |
| `--color-navigation-text`               | `--env-color-fg-control`                  | Navigation items                   |
| `--color-on-accent`                     | `--env-color-fg-on-strong`                | Important buttons                  |
| `--color-on-avatar`                     | `--env-color-fg-avatar`                   | Avatars                            |
| `--color-on-calendar-selected`          | `--env-color-fg-on-emphasis`              | Calendars                          |
| `--color-on-checkbox`                   | `--env-color-fg-on-emphasis`              | Checkboxes                         |
| `--color-on-destructive-action`         | `--env-color-fg-on-strong`                | Destructive buttons                |
| `--color-on-navigation-selected`        | `--env-color-fg-on-selected`              | Navigation items                   |
| `--color-on-primary-action`             | `--env-color-fg-on-emphasis`              | Primary buttons                    |
| `--color-on-secondary-action`           | `--env-color-fg-control`                  | Secondary buttons                  |
| `--color-on-select-selected`            | `--env-color-fg-on-selected`              | Select options                     |
| `--color-on-subtle-action`              | `--env-color-fg-primary`                  | Outlined buttons                   |
| `--color-on-toast`                      | `--env-color-fg-on-strong`                | Toasts and tooltips                |
| `--color-on-tone`                       | `--env-color-fg-on-emphasis`              |                                    |
| `--color-outlined-focus`                | `--env-color-border-focus`                | Outlined buttons                   |
| `--color-pane`                          | `--env-color-bg-default`                  |                                    |
| `--color-popup`                         | `--env-color-bg-popup`                    |                                    |
| `--color-popup-border`                  | `--env-elevation-2-border`                | Popups                             |
| `--color-primary-action`                | `--env-color-bg-primary-emphasis`         | Primary buttons                    |
| `--color-primary-action-hover`          | `--env-color-bg-primary-emphasis-hover`   | Primary buttons                    |
| `--color-primary-action-pressed`        | `--env-color-bg-primary-emphasis-pressed` | Primary buttons                    |
| `--color-quiet-label-hover`             | `--env-color-fg-muted-hover`              | Disclosure summaries               |
| `--color-quiet-label-pressed`           | `--env-color-fg-muted-pressed`            | Disclosure summaries               |
| `--color-radio`                         | `--env-color-bg-primary-emphasis`         | Radios                             |
| `--color-radio-detail`                  | `--env-color-fg-muted`                    | Radios                             |
| `--color-radio-hover`                   | `--env-color-bg-primary-emphasis-hover`   | Radios                             |
| `--color-radio-pressed`                 | `--env-color-bg-primary-emphasis-pressed` | Radios                             |
| `--color-radio-row`                     | `--env-color-bg-muted`                    | Radio rows                         |
| `--color-radio-row-hover`               | `--env-color-bg-muted-hover`              | Radio rows                         |
| `--color-radio-row-pressed`             | `--env-color-bg-muted-pressed`            | Radio rows                         |
| `--color-radio-text`                    | `--env-color-fg-default`                  | Radios                             |
| `--color-row`                           | `--env-color-bg-list-item`                | List rows                          |
| `--color-row-alternate`                 | `--env-color-bg-raised`                   | List rows on a contrasting surface |
| `--color-row-detail`                    | `--env-color-fg-muted`                    | List rows                          |
| `--color-row-hover`                     | `--env-color-bg-list-item-hover`          | List rows                          |
| `--color-row-pressed`                   | `--env-color-bg-list-item-pressed`        | List rows                          |
| `--color-row-selected-hover`            | `--env-color-bg-selected-hover`           | Tree and table rows                |
| `--color-row-selected-pressed`          | `--env-color-bg-selected-pressed`         | Tree and table rows                |
| `--color-row-text`                      | `--env-color-fg-default`                  | List rows                          |
| `--color-secondary-action`              | `--env-color-bg-neutral-muted`            | Secondary buttons                  |
| `--color-secondary-action-hover`        | `--env-color-bg-neutral-muted-hover`      | Secondary buttons                  |
| `--color-secondary-action-pressed`      | `--env-color-bg-neutral-muted-pressed`    | Secondary buttons                  |
| `--color-select-option`                 | `--env-color-bg-popup`                    | Select options                     |
| `--color-select-option-hover`           | `--env-color-bg-popup-hover`              | Select options                     |
| `--color-select-option-pressed`         | `--env-color-bg-popup-pressed`            | Select options                     |
| `--color-select-option-text`            | `--env-color-fg-control`                  | Select options                     |
| `--color-select-selected`               | `--env-color-bg-selected`                 | Select options                     |
| `--color-select-selected-hover`         | `--env-color-bg-selected-hover`           | Select options                     |
| `--color-select-selected-pressed`       | `--env-color-bg-selected-pressed`         | Select options                     |
| `--color-skeleton-base`                 | `--env-color-bg-neutral-muted`            | Skeletons                          |
| `--color-skeleton-highlight`            | `--env-color-bg-neutral-muted-hover`      | Skeletons                          |
| `--color-state-layer`                   | `--env-color-fg-default`                  |                                    |
| `--color-state-layer-hover`             | `--env-color-bg-neutral-subtle-hover`     |                                    |
| `--color-state-layer-pressed`           | `--env-color-bg-neutral-subtle-pressed`   |                                    |
| `--color-subtle-action`                 | `--env-color-bg-raised`                   | Outlined buttons                   |
| `--color-subtle-action-border`          | `--env-color-border-default`              | Outlined buttons                   |
| `--color-subtle-action-border-hover`    | `--env-color-border-default-hover`        | Outlined buttons                   |
| `--color-subtle-action-border-pressed`  | `--env-color-border-default-pressed`      | Outlined buttons                   |
| `--color-subtle-action-hover`           | `--env-color-bg-raised-hover`             | Outlined buttons                   |
| `--color-subtle-action-pressed`         | `--env-color-bg-raised-pressed`           | Outlined buttons                   |
| `--color-surface`                       | `--env-color-bg-raised`                   |                                    |
| `--color-surface-muted`                 | `--env-color-bg-muted`                    |                                    |
| `--color-switch-off`                    | `--env-color-bg-neutral-muted`            | Switches                           |
| `--color-switch-off-hover`              | `--env-color-bg-neutral-muted-hover`      | Switches                           |
| `--color-switch-off-pressed`            | `--env-color-bg-neutral-muted-pressed`    | Switches                           |
| `--color-switch-on`                     | `--env-color-bg-primary-emphasis`         | Switches                           |
| `--color-switch-on-hover`               | `--env-color-bg-primary-emphasis-hover`   | Switches                           |
| `--color-switch-on-pressed`             | `--env-color-bg-primary-emphasis-pressed` | Switches                           |
| `--color-switch-text`                   | `--env-color-fg-default`                  | Switches                           |
| `--color-switch-thumb`                  | `--env-color-fg-control`                  | Switches                           |
| `--color-switch-thumb-on`               | `--env-color-fg-on-emphasis`              | Switches                           |
| `--color-text-muted`                    | `--env-color-fg-muted`                    |                                    |
| `--color-text-primary`                  | `--env-color-fg-default`                  |                                    |
| `--color-text-quiet`                    | `--env-color-fg-muted`                    |                                    |
| `--color-text-strong`                   | `--env-color-fg-control`                  |                                    |
| `--color-toast-error`                   | `--env-color-bg-danger-strong`            | Toasts                             |
| `--color-toast-info`                    | `--env-color-bg-info-strong`              | Toasts                             |
| `--color-toast-neutral`                 | `--env-color-bg-neutral-strong`           | Toasts and tooltips                |
| `--color-toast-success`                 | `--env-color-bg-success-strong`           | Toasts                             |
| `--color-tone-accent`                   | `--env-color-fg-primary`                  |                                    |
| `--color-tone-danger`                   | `--env-color-fg-danger`                   |                                    |
| `--color-tone-done`                     | `--env-color-fg-done`                     |                                    |
| `--color-tone-neutral`                  | `--env-color-fg-muted`                    |                                    |
| `--color-tone-success`                  | `--env-color-fg-success`                  |                                    |
| `--color-tone-warning`                  | `--env-color-fg-warning`                  |                                    |

Aliases whose replacement is not the 0.7 role, or whose value changed, so a style that relied on them needs a look:

| 0.7 custom property         | 1.0                                       | What changed                                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-avatar`            | `--env-color-bg-avatar`                   | A system token named for avatars now.                                                                                                                                                                                                                                                                                                 |
| `--color-avatar-figure`     | `--env-color-fg-avatar-figure`            | A system token named for avatars now.                                                                                                                                                                                                                                                                                                 |
| `--color-checkbox`          | `--env-color-bg-primary-emphasis`         | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-checkbox-hover`    | `--env-color-bg-primary-emphasis-hover`   | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-checkbox-pressed`  | `--env-color-bg-primary-emphasis-pressed` | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-control-blue`      | `--env-color-bg-primary-emphasis`         | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-dialog-overlay`    | `--env-color-bg-backdrop`                 | 0.7's was opaque, #1f1f1f (hsl(0 0% 12.157%) in both themes), and the dialog backdrop made it 55% opaque with --state-dialog-overlay-opacity, which is removed. The role is the backdrop itself, 55% opaque: paint it as it is, since a style that applies its own opacity now applies it twice. For the opaque color, write #1f1f1f. |
| `--color-navigation-quiet`  | `--env-color-bg-list-item`                | The quiet navigation item’s rest, which envUI no longer reads; list items have the same fill.                                                                                                                                                                                                                                         |
| `--color-on-avatar`         | `--env-color-fg-avatar`                   | A system token named for avatars now.                                                                                                                                                                                                                                                                                                 |
| `--color-on-checkbox`       | `--env-color-fg-on-emphasis`              | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-row`               | `--env-color-bg-list-item`                | A system token named for list rows: the default surface in light, the muted one in dark.                                                                                                                                                                                                                                              |
| `--color-row-hover`         | `--env-color-bg-list-item-hover`          | A system token named for list rows: the default surface in light, the muted one in dark.                                                                                                                                                                                                                                              |
| `--color-row-pressed`       | `--env-color-bg-list-item-pressed`        | A system token named for list rows: the default surface in light, the muted one in dark.                                                                                                                                                                                                                                              |
| `--color-switch-on`         | `--env-color-bg-primary-emphasis`         | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-switch-on-hover`   | `--env-color-bg-primary-emphasis-hover`   | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-switch-on-pressed` | `--env-color-bg-primary-emphasis-pressed` | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |
| `--color-switch-thumb-on`   | `--env-color-fg-on-emphasis`              | Light took the brand’s strong fill, the same color as its emphasis fill there: one role in every theme now.                                                                                                                                                                                                                           |

Fixed colors, which no token replaces: write the value, or a custom property of your own that holds it.

| 0.7 custom property   | Used for              | Value     |
| --------------------- | --------------------- | --------- |
| `--color-canvas-dark` | Fixed dark page color | `#1e1f21` |
| `--color-white`       | Fixed white           | `#ffffff` |

Removed, with what to use instead:

| 0.7 custom property                   | Use instead                             | Note                                                                                                                                                                                                                                                                                                 |
| ------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--app-sticky-top`                    | —                                       | Sticky content in a Scaffold's body sticks under its top bar, --env-scaffold-sticky-top below the window's top, where the document scrolls, and at the top of the body with scroll="body". The Scaffold sets --env-scaffold-sticky-top from its top bar's height.                                    |
| `--elevation-0-shadow`                | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--elevation-1-shadow`                | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--elevation-2-shadow`                | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--elevation-3-shadow`                | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--env-app-control-height`            | —                                       | AppShell is gone: a TopBar with titleBar keeps the small control height.                                                                                                                                                                                                                             |
| `--env-app-divider`                   | —                                       | AppShell is gone, and no line sets the frame's regions apart: the navigation and the top bar fill the navigation's background, or each the page's with background="page". Panes.Divider is the gap between panes, with a grip.                                                                       |
| `--env-app-shell-block-size`          | —                                       | AppShell is gone: Scaffold fills 100dvh; give it another block-size with your own class.                                                                                                                                                                                                             |
| `--env-app-shell-header-divider`      | —                                       | AppShell is gone: a TopBar draws no divider of its own; give it a border with your own class.                                                                                                                                                                                                        |
| `--env-app-shell-loading-bar-offset`  | —                                       | AppShell is gone: TopBar's loading bar runs along its bottom edge.                                                                                                                                                                                                                                   |
| `--env-app-sticky-top`                | —                                       | Sticky content in a Scaffold's body sticks under its top bar, --env-scaffold-sticky-top below the window's top, where the document scrolls, and at the top of the body with scroll="body". The Scaffold sets --env-scaffold-sticky-top from its top bar's height.                                    |
| `--env-app-toggle-size`               | —                                       | SidebarTrigger is gone: open a navigation drawer from an IconButton, and give it a size.                                                                                                                                                                                                             |
| `--env-app-topbar-block-size`         | —                                       | TopBar is --env-top-bar-height tall; the Scaffold measures its top bar region and sets --env-scaffold-sticky-top from it.                                                                                                                                                                            |
| `--env-breakpoint-lg`                 | —                                       | The viewport breakpoints are gone: envUI responds to containers at window classes, compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem, as @container env-window (width >= 37.5rem); --env-window-class-medium, -expanded and -large hold the thresholds.             |
| `--env-breakpoint-md`                 | —                                       | The viewport breakpoints are gone: envUI responds to containers at window classes, compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem, as @container env-window (width >= 37.5rem); --env-window-class-medium, -expanded and -large hold the thresholds.             |
| `--env-breakpoint-sm`                 | —                                       | The viewport breakpoints are gone: envUI responds to containers at window classes, compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem, as @container env-window (width >= 37.5rem); --env-window-class-medium, -expanded and -large hold the thresholds.             |
| `--env-breakpoint-xl`                 | —                                       | The viewport breakpoints are gone: envUI responds to containers at window classes, compact below 37.5 rem, medium from 37.5, expanded from 52.5 and large from 75 rem, as @container env-window (width >= 37.5rem); --env-window-class-medium, -expanded and -large hold the thresholds.             |
| `--env-color-skeleton-shine`          | —                                       | Skeletons pulse rather than shimmer: they paint from the neutral fill and the text color, and no highlight remains.                                                                                                                                                                                  |
| `--env-elevation-0-shadow`            | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--env-elevation-1-shadow`            | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--env-elevation-2-shadow`            | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--env-elevation-3-shadow`            | —                                       | The elevation shadows are gone: a floating layer separates by its fill and its edge, --env-elevation-{level}-border, and a modal by its backdrop as well. Delete the box-shadow; where your own floating layer relied on it, give it the level’s edge instead.                                       |
| `--env-frame-header-block-size`       | —                                       | AppShell and WindowFrame are gone: TopBar is --env-top-bar-height tall; the Scaffold measures its top bar region and sets --env-scaffold-sticky-top from it.                                                                                                                                         |
| `--env-frame-sticky-top`              | —                                       | AppShell and WindowFrame are gone: sticky content in a Scaffold's body sticks under its top bar, --env-scaffold-sticky-top below the window's top, where the document scrolls, and at the top of the body with scroll="body". The Scaffold sets --env-scaffold-sticky-top from its top bar's height. |
| `--env-sidebar-collapsed-width`       | —                                       | Sidebar is gone: Rail, the navigation form for medium windows, has a width of its own.                                                                                                                                                                                                               |
| `--env-sidebar-content-width`         | —                                       | Sidebar is gone: the navigation forms, Bar, Rail and Drawer, size themselves.                                                                                                                                                                                                                        |
| `--env-sidebar-expanded-width`        | —                                       | AppShell and Sidebar are gone: the navigation forms, Bar, Rail and Drawer, size themselves; side content goes in a Panes supporting pane.                                                                                                                                                            |
| `--env-sidebar-inset`                 | —                                       | Sidebar is gone: the navigation forms, Bar, Rail and Drawer, keep their own insets.                                                                                                                                                                                                                  |
| `--env-sidebar-width`                 | —                                       | AppShell and Sidebar are gone: the navigation forms, Bar, Rail and Drawer, size themselves; side content goes in a Panes supporting pane.                                                                                                                                                            |
| `--env-split-pane-handle`             | —                                       | SplitPane is gone: Panes.Divider, env-panes-divider, is the divider that resizes the panes.                                                                                                                                                                                                          |
| `--env-split-pane-size`               | —                                       | SplitPane is gone: Panes takes the resized pane's size in rem, as size or defaultSize on Panes.Root.                                                                                                                                                                                                 |
| `--env-split-view-gutter`             | —                                       | SplitView is gone: Panes has no gutter; Panes.Divider has a width of its own.                                                                                                                                                                                                                        |
| `--env-split-view-size`               | —                                       | SplitView is gone: Panes takes the resized pane's size in rem, as size or defaultSize on Panes.Root.                                                                                                                                                                                                 |
| `--env-stack-gap`                     | —                                       | Stack is gone: Row and Column take gap as a step of the spacing scale, which they write as data-gap; set gap on your own class instead.                                                                                                                                                              |
| `--env-toast-fill-hover`              | —                                       | A toast's hover and press fill tokens are gone, not private: set --env-toast-container, and its dismiss button's hover and press become layers of its text color.                                                                                                                                    |
| `--env-toast-fill-pressed`            | —                                       | A toast's hover and press fill tokens are gone, not private: set --env-toast-container, and its dismiss button's hover and press become layers of its text color.                                                                                                                                    |
| `--env-window-frame-title-bar-left`   | —                                       | WindowFrame is gone: a TopBar with titleBar keeps clear of the window's controls through --env-top-bar-title-bar-start and -end.                                                                                                                                                                     |
| `--env-window-frame-title-bar-right`  | —                                       | WindowFrame is gone: a TopBar with titleBar keeps clear of the window's controls through --env-top-bar-title-bar-start and -end.                                                                                                                                                                     |
| `--member-identity-avatar-size`       | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--member-identity-copy-height`       | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--member-identity-email-line-height` | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--member-identity-email-size`        | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--member-identity-gap`               | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--member-identity-name-line-height`  | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--member-identity-name-size`         | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--scale`                             | —                                       | The multiplier is gone: components read sized tokens. Set scale="compact" on a Theme for the compact scale.                                                                                                                                                                                          |
| `--state-card-strip-weight`           | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--state-dialog-overlay-opacity`      | `--env-color-bg-backdrop`               | The backdrop is a translucent color token now.                                                                                                                                                                                                                                                       |
| `--state-fill-hover-opacity`          | `--env-color-bg-neutral-muted-hover`    | The fill's states are color tokens now.                                                                                                                                                                                                                                                              |
| `--state-fill-opacity`                | `--env-color-bg-neutral-muted`          | The neutral fill is a translucent color token; layer it over a surface rather than mixing.                                                                                                                                                                                                           |
| `--state-fill-pressed-opacity`        | `--env-color-bg-neutral-muted-pressed`  | The fill's states are color tokens now.                                                                                                                                                                                                                                                              |
| `--state-hover-lightness`             | —                                       | The runtime hover rule is gone: use the role's -hover token.                                                                                                                                                                                                                                         |
| `--state-hover-shift`                 | —                                       | The runtime hover rule is gone.                                                                                                                                                                                                                                                                      |
| `--state-layer-hover-opacity`         | `--env-color-bg-neutral-subtle-hover`   | The state layer is a color token now.                                                                                                                                                                                                                                                                |
| `--state-layer-pressed-opacity`       | `--env-color-bg-neutral-subtle-pressed` | The state layer is a color token now.                                                                                                                                                                                                                                                                |
| `--state-lightness-direction`         | —                                       | The runtime hover rule is gone: every role has hover and pressed tokens.                                                                                                                                                                                                                             |
| `--state-lightness-threshold`         | —                                       | The runtime hover rule is gone.                                                                                                                                                                                                                                                                      |
| `--state-pressed-lightness`           | —                                       | The runtime hover rule is gone: use the role's -pressed token.                                                                                                                                                                                                                                       |
| `--state-pressed-shift`               | —                                       | The runtime hover rule is gone.                                                                                                                                                                                                                                                                      |
| `--state-selected-base-weight`        | —                                       | Unused.                                                                                                                                                                                                                                                                                              |
| `--state-surface-hover-lightness`     | —                                       | The runtime hover rule is gone: use the surface's -hover token.                                                                                                                                                                                                                                      |
| `--state-surface-hover-shift`         | —                                       | The runtime hover rule is gone.                                                                                                                                                                                                                                                                      |
| `--state-surface-pressed-lightness`   | —                                       | The runtime hover rule is gone: use the surface's -pressed token.                                                                                                                                                                                                                                    |
| `--state-surface-pressed-shift`       | —                                       | The runtime hover rule is gone.                                                                                                                                                                                                                                                                      |
| `--state-tone-subtle-opacity`         | —                                       | Each tone has its tint as a color token: color.bg.{tone}.muted.                                                                                                                                                                                                                                      |
| `--surface-card-padding`              | —                                       | Internal to the 0.7 card. Set a card's padding with its padding prop.                                                                                                                                                                                                                                |
| `--toast-fill`                        | —                                       | Internal to the 0.7 toast. A toast takes its fill from its tone; restyle a toast through the component, not this property.                                                                                                                                                                           |

Every other name only takes the prefix, `--color-bg-danger-emphasis` as `--env-color-bg-danger-emphasis`: `--color-bg-danger-emphasis`, `--color-bg-danger-muted`, `--color-bg-danger-strong`, `--color-bg-danger-strong-hover`, `--color-bg-danger-strong-pressed`, `--color-bg-danger-subtle-hover`, `--color-bg-danger-subtle-pressed`, `--color-bg-default`, `--color-bg-default-hover`, `--color-bg-default-pressed`, `--color-bg-done-emphasis`, `--color-bg-done-muted`, `--color-bg-field`, `--color-bg-info-strong`, `--color-bg-info-strong-hover`, `--color-bg-info-strong-pressed`, `--color-bg-muted`, `--color-bg-muted-hover`, `--color-bg-muted-pressed`, `--color-bg-navigation-hover`, `--color-bg-navigation-pressed`, `--color-bg-neutral-emphasis`, `--color-bg-neutral-muted`, `--color-bg-neutral-muted-hover`, `--color-bg-neutral-muted-pressed`, `--color-bg-neutral-strong`, `--color-bg-neutral-strong-hover`, `--color-bg-neutral-strong-pressed`, `--color-bg-neutral-subtle`, `--color-bg-neutral-subtle-hover`, `--color-bg-neutral-subtle-pressed`, `--color-bg-page`, `--color-bg-page-hover`, `--color-bg-page-pressed`, `--color-bg-popup`, `--color-bg-popup-hover`, `--color-bg-popup-pressed`, `--color-bg-raised`, `--color-bg-raised-hover`, `--color-bg-raised-pressed`, `--color-bg-selected`, `--color-bg-selected-hover`, `--color-bg-selected-pressed`, `--color-bg-success-emphasis`, `--color-bg-success-muted`, `--color-bg-success-strong`, `--color-bg-success-strong-hover`, `--color-bg-success-strong-pressed`, `--color-bg-success-subtle-hover`, `--color-bg-success-subtle-pressed`, `--color-bg-warning-emphasis`, `--color-bg-warning-muted`, `--color-bg-warning-subtle-hover`, `--color-bg-warning-subtle-pressed`, `--color-border-danger-muted`, `--color-border-danger-strong`, `--color-border-default`, `--color-border-default-hover`, `--color-border-default-pressed`, `--color-border-focus`, `--color-border-info-strong`, `--color-border-muted`, `--color-border-muted-hover`, `--color-border-muted-pressed`, `--color-border-neutral-strong`, `--color-border-success-muted`, `--color-border-success-strong`, `--color-border-warning-muted`, `--color-fg-control`, `--color-fg-danger`, `--color-fg-default`, `--color-fg-done`, `--color-fg-link`, `--color-fg-link-hover`, `--color-fg-link-pressed`, `--color-fg-muted`, `--color-fg-muted-hover`, `--color-fg-muted-pressed`, `--color-fg-on-emphasis`, `--color-fg-on-selected`, `--color-fg-on-strong`, `--color-fg-success`, `--color-fg-warning`, `--control-border-width`, `--control-font-size`, `--control-gap`, `--control-height`, `--control-height-lg`, `--control-height-md`, `--control-height-sm`, `--control-height-touch`, `--control-icon-size`, `--control-target-min`, `--elevation-0-border`, `--elevation-1-border`, `--elevation-2-border`, `--elevation-3-border`, `--field-floating-height`, `--font-family`, `--font-size-body`, `--font-size-caption`, `--font-size-label`, `--icon-size-lg`, `--icon-size-md`, `--icon-size-sm`, `--motion-duration-fast`, `--motion-duration-medium`, `--motion-duration-slow`, `--motion-ease`, `--motion-ease-enter`, `--motion-ease-exit`, `--radius-row-inner`, `--radius-row-outer`, `--radius-row-single`, `--radius-surface`, `--row-content-height`, `--row-height`, `--row-padding-block-lg`, `--row-padding-block-md`, `--row-padding-block-sm`, `--row-padding-block-xs`, `--row-padding-inline`, `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-5`, `--space-6`, `--space-7`, `--space-8`, `--space-9`, `--state-disabled-opacity`, `--title-bar-height`, `--tree-row-padding-block-lg`, `--tree-row-padding-block-md`, `--tree-row-padding-block-sm`, `--type-body`, `--type-body-font-family`, `--type-body-font-size`, `--type-body-font-weight`, `--type-body-letter-spacing`, `--type-body-line-height`.

<!-- token-migration:end -->

## Changed during the 1.0 prereleases

The codemods rewrite 0.x names. A name that only a 1.0 prerelease had is renamed by hand, as listed here; the changelog gives each change's reason.

| In a 1.0 prerelease                                                                | Now                                                                                                                                   |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `env-bar-icon`, `env-bar-text`                                                     | `env-bar-indicator`, `env-bar-label`, as Rail names them                                                                              |
| `env-segmented-control-item-check`                                                 | `env-segmented-control-item-indicator`, as in Select and Menu                                                                         |
| `env-card-heading`, `env-month-picker-heading`, `env-date-picker-time-heading`     | `env-card-title`, `env-month-picker-title`, `env-date-picker-time-title`: `-heading` names only a column of a title and a description |
| `env-meter-heading`, `env-progress-heading`                                        | `env-meter-header`, `env-progress-header`, the row of the label and the value                                                         |
| `env-drawer-heading`                                                               | `env-drawer-group-label`, as in Menu                                                                                                  |
| `env-dialog-popup`, `env-sheet-popup`                                              | `env-dialog`, `env-sheet`: the popup is the root                                                                                      |
| `env-document-tabs` (the strip), `env-document-tabs-root`, `env-document-tabs-bar` | `env-document-tabs-list`, and `env-document-tabs` for the root, which is the bar now and takes `className`, `style` and `ref`         |
| `env-panes-scrim`                                                                  | `env-panes-backdrop`, as Dialog and Sheet name theirs                                                                                 |

## Migrate by responsibility

Prefer a small complete slice with shared controls and representative interactions, then expand through callers. The first slice should expose routing, forms or overlays rather than only a static button. Choose an order that fits the application; shared wrappers can reduce repetition when their contract still fits.

Consult the relevant [component documentation](index.md) before adopting these candidates:

| Existing responsibility                          | Candidate                                                 |
| ------------------------------------------------ | --------------------------------------------------------- |
| Typography, panes, vertical layouts, action rows | Text, Surface, Column, Row for actions, Grid              |
| Buttons, inline links, icon/connected actions    | Button, Link, IconButton, ButtonGroup                     |
| Side navigation and selected destinations        | Bar, Rail or Drawer, with router-owned `current`          |
| Content/action/clickable cards                   | Appropriate public Card composition                       |
| Fields and choices                               | TextField, Textarea, Select, Checkbox, RadioGroup, Switch |
| Modal/inspector shells, notifications            | Dialog, Toast.Provider/useToast                           |
| Loading and empty results                        | `skeleton`, Spinner with `showLabel`, empty states        |
| Source, Markdown, formatted editing              | Optional content or rich-text entry                       |

Port behavior explicitly instead of mechanically translating props. Preserve labels, accessible names, href/router state, callback payloads, refs, form names/reset, focus restoration and mutation timing. Check button types inside forms, pending-operation dismissal rules and draft state through dialogs/navigation.

Keep vendor dependencies with remaining consumers. A vendor widget can require another component library and its theme as a peer even after the application's own controls migrate. Inspect the installed widget's manifest and behavior. Scope its CSS and theme to the widget's area and adapt tokens through supported configuration or narrowly scoped existing styles.

Identify gaps early: dropdown/organization menus, avatars, tables or other features may lack a direct envUI export. Compose public primitives only when they preserve the interaction. Retain a functioning implementation for unmigrated features and report gaps; avoid incomplete imitations and silent behavior loss. Shared library additions require envUI work to be in scope.

Treat stored rich text as a data contract. Check representative documents, references, images and tables before switching editors/serializers. Preserve source editing when normalization would change the product's promise. Do not rewrite persisted content as an incidental UI migration.

## Remove obsolete implementation after replacement

Search remaining imports/callers, styles, assets, vendor peers and generated tooling before deleting dependencies, providers, resets, fonts or icon pipelines. Remove obsolete wrappers/CSS once their responsibilities are covered. Preserve application layouts and vendor styles. Update existing project instructions that point to retired UI owners.

For partial migrations, identify migrated/retained areas and concrete gaps in the task or PR. Dependency installation alone is not a completed migration. Keep guidance improvements in their relevant documentation pages.

## Validate and hand over

Run established application checks and production builds, including deployment dry runs when they are normal verification. Exercise affected journeys in a browser: both themes, keyboard interaction, narrow portrait/landscape containers, expanded/collapsed navigation where present, and enlarged text. Check portal focus/theme, form submit/reset/validation, links and vendor widgets.

Use meaningful existing tests; update assertions intentionally tied to replaced markup. Add focused coverage for behavior at risk. Run envUI acceptance for library additions. Confirm the final manifest/lockfile uses the intended package rather than a machine-specific link.

Report the adopted version, completed scope, checks, retained dependencies and unresolved gaps. Turn integration issues into targeted edits to the relevant component documentation or this workflow.
