---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
'@envsemble/eslint-plugin-envui': patch
---

WindowFrame and AccountMenu are patterns now, not components: they are arrangements of other components that applications arrange differently.

- WindowFrame, with WindowFrame.Root, WindowFrame.TitleBar and WindowFrame.Content, is a Scaffold with `topBarSpan="full"` and a `<TopBar titleBar>`, whose body scrolls below the title bar; its `bodyRef` is the content's ref. The window frame pattern shows it. The part classes `env-window-frame`, `env-window-frame-content`, `env-window-frame-title-bar`, `env-window-frame-title-bar-layout`, `env-window-frame-title-bar-start`, `env-window-frame-title-bar-center` and `env-window-frame-title-bar-end` go: a title bar is `.env-top-bar[data-title-bar]`, with `env-top-bar-start`, `env-top-bar-title` and `env-top-bar-actions`.
- AccountMenu, with AccountMenu.ThemeSubmenu and AccountMenu.OrganizationSubmenu, is a Menu.Root whose trigger is an AvatarButton, with a Menu.Header of the Avatar and the name, and a Menu.Submenu around a ThemeRadioGroup for the theme. The account menu pattern shows it. The part classes `env-account-menu`, `env-account-menu-header`, `env-account-menu-header-text`, `env-account-menu-header-name`, `env-account-menu-header-description`, `env-account-menu-trigger`, `env-account-menu-trigger-text`, `env-account-menu-trigger-name` and `env-account-menu-trigger-description` go, and with the trigger its `data-popup-open`, which every Menu.Root trigger still has.
- The `v1-structure` codemod no longer rewrites 0.x's WindowFrame, or SplitView, into 1.0.0-prerelease.0's parts: `v1-names` reports WindowFrame, TitleBar, SplitView and AccountMenu where they are used. `v1-classes` renames WindowFrame's parts to the TopBar's and the Scaffold's, as listed above, and reports `env-window-frame` itself, `env-window-frame-title-bar-layout` and the `env-account-menu-*` classes.

Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).
