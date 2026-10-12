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
| sidebarContent                                   | The application's own content below the navigation; hidden while compact                                     |
| resizable                                        | The sidebar edge becomes a resize handle for the expanded width                                              |
| sidebarWidth / onSidebarWidthChange              | Controlled width in pixels; uncontrolled widths persist under storageKey                                     |
| sidebarMinWidth / sidebarMaxWidth                | Resize bounds in pixels; 12 rem and 32 rem by default                                                        |
| resizeLabel                                      | Accessible name of the handle; Resize sidebar by default                                                     |

## Guidelines

- Expanded, the sidebar fits its widest content (the navigation or the context beside the toggle) between 12 and 20 rem. AppShell measures it while labels show; with storageKey, AppShellSkeleton starts at the same width.
- Collapsed, the sidebar is one control plus its insets wide, so the toggle and the navigation icons share a center line. NavigationItems inside a collapsed sidebar show only their icons and use their text as accessible name and title.
- A collapsed sidebar expands over the content while the pointer is over the sidebar or the area above it, while it holds keyboard focus, and while a popup opened from it, such as an organization switcher, is open. After the toggle collapses it, it stays compact until the pointer leaves. Collapsing it in any way, including an application shortcut or the collapsed prop, compacts it even while it holds focus or the pointer, which expands it again after leaving; focus in the sidebar content, which the compact sidebar hides, is released.
- On narrow viewports (40 rem wide, or 54 rem wide and 32 rem tall) the sidebar opens over the content from the toggle and closes after navigation, on <kbd>Esc</kbd> and on the backdrop. The page title is hidden there.
- AppShell is the frame: topbar, sidebar and content area. The application owns what goes inside them: routing, the selected destination, the page layout and any content below the navigation. Use LinkProvider so navigation stays on the client.
- sidebarContent sits below the navigation, which keeps its natural height and scrolls only when it alone overflows. The content fills the remaining height, so give it block-size: 100% and its own scrolling. It shows while the sidebar is expanded, including hover expansion, and hides while compact.
- With resizable, drag the sidebar’s inline-end edge or focus it: <kbd>←</kbd> and <kbd>→</kbd> change the width by 16 px, 48 px with <kbd>Shift</kbd>, and <kbd>Home</kbd> and <kbd>End</kbd> reach the bounds. The topbar’s context column follows. Until someone resizes it, the sidebar starts at the measured width; the chosen width then replaces it and is kept across reloads. A cancelled drag keeps the width it began with. A collapsed or narrow sidebar has no handle.
- The document scrolls, not the content area. --topbar-height is the topbar's height, for content that sticks below it or fills the rest of the window.

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation items](../components/navigation.md)
- [Menus](../components/menu.md)
- [Colors & themes](../foundations/colors.md)
- [Install the private package](../setup.md)
