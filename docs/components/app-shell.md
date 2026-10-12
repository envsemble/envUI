# Application shell

## React usage

```tsx
import { AppShell, NavigationItem, ThemeToggle } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Category } from '@envsemble/envui/icons/Category';

<AppShell
  brand={<img src={markUrl} alt="" />}
  context={<OrganizationSwitcher />}
  title="Products"
  actions={
    <>
      <ThemeToggle />
      <AccountMenu />
    </>
  }
  navigationLabel="Platform navigation"
  navigation={
    <>
      <NavigationItem href="/" icon={<Home />} selected={page === 'home'}>
        Home
      </NavigationItem>
      <NavigationItem href="/products" icon={<Category />} selected={page === 'products'}>
        Products
      </NavigationItem>
    </>
  }
  storageKey="app-sidebar-collapsed"
>
  <Page />
</AppShell>;
```

### Props & contracts

| Name                                             | Contract                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| brand                                            | Mark in the sidebar toggle; the toggle icon replaces it while the sidebar area is hovered                    |
| context                                          | Optional content above the sidebar, such as an organization switcher; hidden while compact                   |
| title / actions                                  | Current page name and topbar actions at the end                                                              |
| navigation / navigationLabel                     | NavigationItem elements and the accessible name of the sidebar                                               |
| storageKey                                       | Persist the collapsed preference and the sidebar width (measured, or chosen while resizable) in localStorage |
| loading / loadingLabel                           | Show a LoadingBar along the topbar's bottom edge, for example while the next page loads                      |
| defaultCollapsed / collapsed / onCollapsedChange | Uncontrolled or controlled collapsed preference on wide viewports                                            |
| dividers                                         | Separator lines between topbar, sidebar and content; true by default                                         |
| expandLabel / collapseLabel                      | Accessible names of the toggle                                                                               |
| useAppShell().closeNarrowSidebar                 | Close the overlay sidebar from content                                                                       |
| AppShellSkeleton                                 | The same frame with placeholders for the first load; pass the same storageKey and brand                      |

## Resizable sidebar with content

```tsx
import { AppShell, Tree } from '@envsemble/envui';

<AppShell
  brand={<img src={markUrl} alt="" />}
  title={document.title}
  navigationLabel="Planning"
  navigation={navigationItems}
  sidebarContent={
    <Tree
      aria-label="Files"
      items={visibleRows}
      onOpen={openFile}
      onExpandedChange={toggleFolder}
    />
  }
  resizable
  storageKey="planning-sidebar"
>
  <header className="document-header">{document.title}</header>
  <DocumentView document={document} />
</AppShell>;
```

```css
/* The document scrolls, so a header can stick below the fixed topbar. */
.document-header {
  position: sticky;
  inset-block-start: var(--topbar-height);
  z-index: 1;
  background: var(--color-canvas);
}
/* A child can fill the remaining viewport height, for example an editor with its own scrolling. */
.document-editor {
  block-size: calc(100dvh - var(--topbar-height));
}
```

### Props & contracts

| Name                                | Contract                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| sidebarContent                      | Content below the navigation; fills the remaining sidebar height and scrolls itself; hidden while compact |
| resizable                           | The sidebar edge becomes a resize handle for the expanded width                                           |
| sidebarWidth / onSidebarWidthChange | Controlled width in pixels; uncontrolled widths persist under storageKey                                  |
| sidebarMinWidth / sidebarMaxWidth   | Resize bounds in pixels; 12 rem and 32 rem by default                                                     |
| resizeLabel                         | Accessible name of the handle; Resize sidebar by default                                                  |
| AppShellSkeleton resizable          | With the same storageKey and bounds, the loading frame starts at the chosen width                         |

## Guidelines

- Expanded, the sidebar fits its widest content (the navigation or the context beside the toggle) between 12 and 20 rem. AppShell measures it while labels show; with storageKey, AppShellSkeleton starts at the same width.
- Collapsed, the sidebar is one control plus its insets wide, so the toggle and the navigation icons share a center line. NavigationItems inside a collapsed sidebar show only their icons and use their text as accessible name and title.
- A collapsed sidebar expands over the content while the pointer is over the sidebar or the area above it, while it holds keyboard focus, and while a popup opened from it, such as an organization switcher, is open. After the toggle collapses it, it stays compact until the pointer leaves. Collapsing it in any way, including an application shortcut or the collapsed prop, compacts it even while it holds focus; focus in the sidebar content, which the compact sidebar hides, is released.
- On narrow viewports (40 rem wide, or 54 rem wide and 32 rem tall) the sidebar opens over the content from the toggle and closes after navigation, on Escape and on the backdrop. The page title is hidden there.
- The application owns routing, the selected destination and the page layout inside the content area. Use LinkProvider so navigation stays on the client.
- sidebarContent sits below the navigation, which keeps its natural height and scrolls only when it alone overflows. Give the content block-size: 100% and its own scrolling, as Tree does. It shows while the sidebar is expanded, including hover expansion, and hides while compact.
- With resizable, drag the sidebar’s inline-end edge or focus it: Arrow Left and Right change the width by 16 px, 48 px with Shift, and Home and End reach the bounds. The topbar’s context column follows. Until someone resizes it, the sidebar starts at the measured width; the chosen width then replaces it and is kept across reloads. A cancelled drag keeps the width it began with. A collapsed or narrow sidebar has no handle.
- The document scrolls, not the content area, so page content can stick below the topbar with position: sticky and inset-block-start: var(--topbar-height), and a child can fill the remaining height with block-size: calc(100dvh - var(--topbar-height)).

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation items](../components/navigation.md)
- [Menus](../components/menu.md)
- [Tree](../components/tree.md)
- [Colors & themes](../foundations/colors.md)
- [Install the private package](../setup.md)
