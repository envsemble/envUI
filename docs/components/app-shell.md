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

| Name                                             | Contract                                                                                   |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| brand                                            | Mark in the sidebar toggle; the toggle icon replaces it while the sidebar area is hovered  |
| context                                          | Optional content above the sidebar, such as an organization switcher; hidden while compact |
| title / actions                                  | Current page name and topbar actions at the end                                            |
| navigation / navigationLabel                     | NavigationItem elements and the accessible name of the sidebar                             |
| storageKey                                       | Persist the collapsed preference and the measured sidebar width in localStorage            |
| loading / loadingLabel                           | Show a LoadingBar along the topbar's bottom edge, for example while the next page loads    |
| defaultCollapsed / collapsed / onCollapsedChange | Uncontrolled or controlled collapsed preference on wide viewports                          |
| dividers                                         | Separator lines between topbar, sidebar and content; true by default                       |
| expandLabel / collapseLabel                      | Accessible names of the toggle                                                             |
| useAppShell().closeNarrowSidebar                 | Close the overlay sidebar from content                                                     |
| AppShellSkeleton                                 | The same frame with placeholders for the first load; pass the same storageKey and brand    |

## Guidelines

- Expanded, the sidebar fits its widest content (the navigation or the context beside the toggle) between 12 and 20 rem. AppShell measures it while labels show; with storageKey, AppShellSkeleton starts at the same width.
- Collapsed, the sidebar is one control plus its insets wide, so the toggle and the navigation icons share a center line. NavigationItems inside a collapsed sidebar show only their icons and use their text as accessible name and title.
- A collapsed sidebar expands over the content while the pointer is over the sidebar or the area above it, while it holds keyboard focus, and while a popup opened from it, such as an organization switcher, is open. After the toggle collapses it, it stays compact until the pointer leaves.
- On narrow viewports (40 rem wide, or 54 rem wide and 32 rem tall) the sidebar opens over the content from the toggle and closes after navigation, on Escape and on the backdrop. The page title is hidden there.
- The application owns routing, the selected destination and the page layout inside the content area. Use LinkProvider so navigation stays on the client.

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation items](../components/navigation.md)
- [Menus](../components/menu.md)
- [Colors & themes](../foundations/colors.md)
- [Install the private package](../setup.md)
