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
  navigationLabel="Main navigation"
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

| Name                                             | Contract                                                                                                         |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| brand                                            | Mark in the sidebar toggle; the toggle icon replaces it while the sidebar area is hovered                        |
| context                                          | Optional content beside the toggle, such as an organization switcher; in the split topbar hidden while compact   |
| title / actions                                  | Current page name and topbar actions at the end                                                                  |
| navigation / navigationLabel                     | NavigationItem elements and the accessible name of the sidebar                                                   |
| storageKey                                       | Persist the collapsed preference and the sidebar width (measured, or chosen while resizable) in localStorage     |
| loading / loadingLabel                           | Show a LoadingBar along the topbar's bottom edge, for example while the next page loads                          |
| defaultCollapsed / collapsed / onCollapsedChange | Uncontrolled or controlled collapsed preference on wide viewports                                                |
| dividers                                         | Separator lines between topbar, sidebar and content; true by default                                             |
| expandLabel / collapseLabel                      | Accessible names of the toggle                                                                                   |
| useAppShell().closeNarrowSidebar                 | Close the overlay sidebar from content                                                                           |
| useAppShell().getScrollElement                   | The element that scrolls the page content: the content area with titleBar, else the document's scrolling element |
| --app-sticky-top                                 | Where page content sticks: the topbar height while the document scrolls, 0 in a title-bar shell's content area   |
| AppShellSkeleton                                 | The same frame with placeholders for the first load; pass the same storageKey and brand                          |
| sidebarContent                                   | The application's own content below the navigation; hidden while compact                                         |
| resizable                                        | The sidebar edge becomes a resize handle for the expanded width                                                  |
| sidebarWidth / onSidebarWidthChange              | Controlled width in pixels; uncontrolled widths persist under storageKey                                         |
| sidebarMinWidth / sidebarMaxWidth                | Resize bounds in pixels; 12 rem and 32 rem by default                                                            |
| resizeLabel                                      | Accessible name of the handle; Resize sidebar by default                                                         |
| AppShellSkeleton resizable                       | With the same storageKey and bounds, the loading frame starts at the chosen width                                |
| topbar                                           | split (default): the context above the sidebar, beside the page part; full: one row across the window            |
| titleBar                                         | The topbar is the window's title bar in apps that draw their own; meant for the full topbar                      |
| AppShellSkeleton topbar / titleBar               | Match the AppShell the loading frame precedes                                                                    |

### A full-width topbar as the window title bar

```tsx
import { AppShell, Menubar, MenubarMenu, MenuItem, Select } from '@envsemble/envui';

<AppShell
  topbar="full"
  titleBar
  brand={<img src={markUrl} alt="" />}
  context={
    <>
      <Menubar aria-label="Application menu" accessKeys>
        <MenubarMenu label="File" accessKey="F">
          <MenuItem shortcut="Ctrl+N" onClick={createDocument}>
            New document
          </MenuItem>
        </MenubarMenu>
      </Menubar>
      <Select
        aria-label="Workspace"
        density="compact"
        options={workspaces}
        value={workspace}
        onValueChange={openWorkspace}
      />
    </>
  }
  title={document.title}
  actions={<AccountMenu />}
  navigationLabel="Workspace navigation"
  navigation={navigationItems}
>
  <DocumentPage />
</AppShell>;
```

### A title bar without the shell

```tsx
import { Button, Menubar, TitleBar, WindowFrame } from '@envsemble/envui';

<WindowFrame
  scrollRef={startPageScroller}
  titleBar={
    <TitleBar
      start={
        <>
          <img src={markUrl} alt="" />
          <Menubar aria-label="Application menu">{menus}</Menubar>
        </>
      }
      end={<Button variant="secondary">Share</Button>}
    >
      Quarterly report
    </TitleBar>
  }
>
  <StartPage />
</WindowFrame>;
```

| Name                     | Contract                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| TitleBar start           | Content at the inline start, such as the application mark and a Menubar                          |
| TitleBar children        | Content centered in the window, such as the document title; it truncates when space runs short   |
| TitleBar end             | Content at the inline end, such as actions; the window controls follow it                        |
| TitleBar native props    | className, style, aria attributes and other header attributes                                    |
| WindowFrame titleBar     | The title bar at the top of the window, typically a TitleBar                                     |
| WindowFrame children     | The window's content, which scrolls below the title bar                                          |
| WindowFrame scrollRef    | The element that scrolls the content, to read and restore scroll positions                       |
| WindowFrame native props | className, style, ref and other div attributes of the frame                                      |
| --title-bar-height       | 2.5 rem, 3 rem on coarse pointers: a title bar's least height, and its height outside an overlay |

## Guidelines

- Expanded, the sidebar fits its widest content between 12 and 20 rem: the navigation or the context beside the toggle, or with the full topbar the navigation or the sidebar content. AppShell measures it while labels show; with storageKey, AppShellSkeleton starts at the same width.
- Collapsed, the sidebar is one control plus its insets wide, so the toggle and the navigation icons share a center line. NavigationItems inside a collapsed sidebar show only their icons and use their text as accessible name and title.
- A collapsed sidebar expands over the content while the pointer is over the sidebar or the area above it, while it holds keyboard focus, and while a popup opened from it, such as an organization switcher, is open. After the toggle collapses it, it stays compact until the pointer leaves. Collapsing it in any way, including an application shortcut or the collapsed prop, compacts it even while it holds focus or the pointer, which expands it again after leaving; focus in the sidebar content, which the compact sidebar hides, is released.
- On narrow viewports (40 rem wide, or 54 rem wide and 32 rem tall) the sidebar opens over the content from the toggle and closes after navigation, on <kbd>Esc</kbd> and on the backdrop. The page title is hidden there.
- AppShell is the frame: topbar, sidebar and content area. The application owns what goes inside them: routing, the selected destination, the page layout and any content below the navigation. Use LinkProvider so navigation stays on the client.
- sidebarContent sits below the navigation, which keeps its natural height and scrolls only when it alone overflows. The content fills the remaining height, so give it block-size: 100% and its own scrolling. It shows while the sidebar is expanded, including hover expansion, and hides while compact.
- With resizable, drag the sidebar’s inline-end edge or focus it: <kbd>←</kbd> and <kbd>→</kbd> change the width by 16 px, 48 px with <kbd>Shift</kbd>, and <kbd>Home</kbd> and <kbd>End</kbd> reach the bounds. The topbar’s context column follows. Until someone resizes it, the sidebar starts at the measured width; the chosen width then replaces it and is kept across reloads. A cancelled drag keeps the width it began with. A collapsed or narrow sidebar has no handle.
- Without titleBar the document scrolls; with titleBar the content area scrolls below the title bar. Content that sticks uses position: sticky; inset-block-start: var(--app-sticky-top), which is the topbar height while the document scrolls and 0 in a title-bar shell's content area. useAppShell().getScrollElement() returns the element that scrolls the page content: read and restore scroll positions on it. When it is document.scrollingElement, the document scrolls and its scroll events fire at the window, so listen there; otherwise listen on the element. Without titleBar it returns the scrolling element of the shell's own document. In a title-bar shell it returns null until the content area is attached. The function changes once the shell is attached, so an effect that depends on it runs again: with the content area in a title-bar shell, and with the frame's scrolling element where the shell is rendered into a frame. Every copy of the function returns the current element, so one kept in a ref or by a listener registered once keeps working. --topbar-height is the topbar's height, for content that fills the rest of the window.
- By default the topbar is split: the context sits above the sidebar, as wide as the sidebar, and a divider separates it from the page title and actions. With topbar="full", the topbar is one row across the window instead: the toggle, the context at its natural width, the title, which truncates first, and the actions at the end. It does not follow the sidebar, so nothing in it moves while the sidebar collapses, and the context stays visible while the sidebar is compact. In a narrow window the context keeps the room it needs, as the actions stay at the end; only when even that runs out does it shrink. Use it when the context holds more than an organization switcher, such as a menubar and a context picker.
- titleBar makes the topbar the window's title bar, in installed web apps and desktop shells that draw their own title bar while the system draws the window controls over the page (the Window Controls Overlay). Such a window reports the part of its top edge that the controls leave free through the environment variables env(titlebar-area-x), env(titlebar-area-y), env(titlebar-area-width) and env(titlebar-area-height). The title bar takes that height and its hairline below, so the hairline runs under the controls too, at least --title-bar-height, and leaves room beside the controls, on whichever side they are, in addition to its own padding. In an ordinary browser window the variables are undefined, so the bar is --title-bar-height tall and spans the full width.
- Once the page is zoomed in, the window reports a smaller height in CSS pixels while its controls keep their size, so the bar never gets shorter than --title-bar-height (2.5 rem), which holds its compact controls. An application whose overlay is taller sets --title-bar-height to match it. Where the desktop shell lets the application choose the overlay's height, the application keeps it in step with the page zoom; the controls then fill the bar above its hairline.
- A title-bar shell fills the window, and its content area scrolls below the title bar instead of the document, so the window controls drawn over the title bar never cover a scrollbar. A stable scrollbar gutter keeps the layout in place as content starts or stops overflowing. As the document no longer scrolls, the keyboard scrolls the content area as it would the document: <kbd>Page Up</kbd>, <kbd>Page Down</kbd>, <kbd>Space</kbd> and <kbd>Shift</kbd>+<kbd>Space</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>↑</kbd> and <kbd>↓</kbd>. With focus in the content area, as after a click in the page, the browser scrolls it. The shell scrolls it for keys from the document and from controls outside it that leave the key alone, such as a sidebar item after it was chosen or a link with <kbd>Space</kbd>; as in the browser, quick presses add up and a held key keeps scrolling. Fields, widgets that use the keys, such as menus and trees, media controls, web components and other elements that hold focus out of sight, such as a field in a closed shadow root, and anything that scrolls itself keep their keys, and so does a document that still scrolls. With focus on the document, the browser scrolls the area the pointer last pressed in, if that area scrolls. The shell hears the keys on the window, after the page's elements and its document: a handler there that calls preventDefault keeps its key, as does a window listener added before the shell mounts. A window listener added later hears the key after the shell. Inside the content, position: fixed still places an element against the window: a full-window view, such as a canvas shown on its own, is a fixed element with a z-index of 30 or more, which covers the topbar and the sidebar. Draggable regions ignore stacking, though: where such a view covers the title bar, presses there still drag the window. Keep the view below the bar, from inset-block-start: var(--topbar-height), or give it app-region: no-drag.
- The application turns the overlay on, for example with display_override and window-controls-overlay in a web app manifest, or with its desktop shell's option for a hidden title bar with overlaid window controls. envUI only reads the variables.
- Empty space in a title bar drags the window (app-region: drag) and its text cannot be selected. Buttons, links, fields, menubars, menu items and other focusable elements stay clickable (app-region: no-drag); give any other interactive element in the bar app-region: no-drag too.
- Controls in a title bar take the compact control height, as in a compact Surface, and the toggle shrinks to match while keeping the navigation icons' center line. Icon-only text buttons, such as back and forward arrows, take the quiet icon color of the window controls beside them instead of the link blue. --topbar-height follows the title bar's height, so the sidebar and the content area line up with it.
- TitleBar is the same title bar without the shell, for a start page or a simple window: content at the start, centered and at the end. It is a normal block. Put it in a WindowFrame, which fills the window with the title bar on top and the content scrolling below it, with a stable gutter and the same keyboard scrolling as a title-bar shell. Avoid a sticky or fixed TitleBar above a scrolling document: the document's scrollbar would run under the window controls.

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation items](../components/navigation.md)
- [Menus](../components/menu.md)
- [Menubar](../components/menubar.md)
- [Colors & themes](../foundations/colors.md)
- [Install the private package](../setup.md)
