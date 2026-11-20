# Customize

Give envUI another look through its styling contract: each component's part classes (`env-<component>-<part>`), state attributes (`data-*`) and color properties (`--env-<component>-<role>`), listed below. They are public and versioned; nothing else in envUI's markup or CSS is. A part marked slot holds what a prop gives it and is never styled, so style what you put in it. Build what envUI lacks from [Surface](components/surface.md), [Row](components/row.md), [Column](components/column.md), [Grid](components/grid.md) and the tokens.

## Theme settings

Change the look of the whole application first, in the theme `defineTheme` returns: `selection` (`neutral` or `accent`) and `corners` (`sharp`, `rounded` or `round`), beside `scale` and `contrast`. A nested `Theme` takes the same props for one region. [Setup](setup.md#theme-preference) shows where the theme goes.

```ts
import { defineTheme } from '@envsemble/envui/theme-bootstrap';

export const theme = defineTheme({ selection: 'accent', corners: 'round' });
```

## Color one element

Set a component's color properties on the element, through `style` or a selector that matches it, such as `.release-notes .env-alert`; they don't inherit. Hover, focus and press then lie over the container as layers of the content color. Colors set this way stay the same in every theme, so give the content 7:1 on the container.

## Recolor an area

Set the color tokens of [Colors & themes](foundations/colors.md) on a nested `Theme` or on `.env-theme`, per theme and contrast, as below; never the palette. Keep text at 4.5:1 on your colors, and 7:1 at high contrast.

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
@media (prefers-contrast: more) {
  .env-theme:not([data-env-contrast='standard']) {
    --env-color-fg-link: #0842a0;
  }
  .env-theme[data-env-theme='dark']:not([data-env-contrast='standard']) {
    --env-color-fg-link: #d3e3fd;
  }
}
```

## Cascade layers

envUI's styles sit in the `env` cascade layer, so the application's CSS outside layers wins without `!important`. Put resets in a layer before it, once, before any component's styles load:

```css
@layer reset, env, app;
```

## Components

### Accordion

- Parts: `env-accordion`, `env-accordion-content`, `env-accordion-end` (slot), `env-accordion-header`, `env-accordion-indicator`, `env-accordion-indicator-content` (slot), `env-accordion-item`, `env-accordion-label` (slot), `env-accordion-panel`, `env-accordion-trigger`
- States: `data-disabled` on `env-accordion-trigger`; `data-ending-style` on `env-accordion-panel`; `data-env-skeleton`; `data-indicator` (`end`, `none`) on `env-accordion-item`; `data-interactive` on `env-accordion-trigger`; `data-panel-open` on `env-accordion-trigger`; `data-starting-style` on `env-accordion-panel`

### Alert

- Parts: `env-alert`, `env-alert-action` (slot), `env-alert-content`, `env-alert-dismiss`, `env-alert-icon`, `env-alert-message` (slot), `env-alert-row`, `env-alert-title`
- States: `data-env-skeleton` on `env-alert`, `env-alert-message`, `env-alert-title`; `data-tone` (`danger`, `info`, `success`, `warning`)
- Color properties: `--env-alert-container`, `--env-alert-content`, `--env-alert-outline`, `--env-alert-icon`

### Avatar

- Parts: `env-avatar`, `env-avatar-badge` (slot), `env-avatar-check`, `env-avatar-fallback`, `env-avatar-fallback-content` (slot), `env-avatar-fallback-initials`, `env-avatar-fallback-person`, `env-avatar-image`, `env-avatar-person`, `env-avatar-person-background`, `env-avatar-person-figure`
- States: `data-hue` (`blush`, `butter`, `oat`, `orchid`, `periwinkle`, `powder`, `sage`, `seafoam`); `data-selected`; `data-size` (`lg`, `md`, `sm`, `xl`)
- Color properties: `--env-avatar-container`, `--env-avatar-content`
- `--env-avatar-dense`, to set: 1 on a container, such as a dense list, gives the avatars and groups in it fills at half their chroma, so their initials keep their contrast, as a table cell and a small AvatarGroup do.

### AvatarButton

- Parts: `env-avatar-button`, `env-avatar-button-tooltip`

### AvatarGroup

- Parts: `env-avatar-group`, `env-avatar-group-item`, `env-avatar-group-overflow`, `env-avatar-group-tooltip`
- States: `data-align` (`end`, `start`); `data-interactive`; `data-size` (`lg`, `md`, `sm`, `xl`); `data-spread`

### Badge

- Parts: `env-badge`, `env-badge-count-label`, `env-badge-label`, `env-badge-start` (slot)
- States: `data-count`; `data-tone` (`accent`, `danger`, `done`, `neutral`, `primary`, `success`, `warning`); `data-variant` (`outline`, `soft`, `solid`)
- Color properties: `--env-badge-container`, `--env-badge-content`, `--env-badge-outline`

### Breadcrumbs

- Parts: `env-breadcrumbs`, `env-breadcrumbs-current`, `env-breadcrumbs-item`, `env-breadcrumbs-label`, `env-breadcrumbs-link`, `env-breadcrumbs-list`, `env-breadcrumbs-separator`, `env-breadcrumbs-text`
- States: `data-nowrap`

### Button

- Parts: `env-button`, `env-button-content`, `env-button-end` (slot), `env-button-end-icon` (slot), `env-button-icon` (slot), `env-button-label` (slot), `env-button-spinner`, `env-button-start` (slot)
- States: `data-full-width`; `data-pending`; `data-row-target`; `data-size` (`lg`, `md`, `sm`); `data-tone` (`accent`, `danger`); `data-underline`; `data-variant` (`ghost`, `outline`, `primary`, `secondary`, `text`)
- Color properties: `--env-button-container`, `--env-button-content`, `--env-button-outline`, `--env-button-selected`, `--env-button-selected-content`

### ButtonGroup

- Parts: `env-button-group`
- States: `data-full-width`; `data-orientation` (`horizontal`, `vertical`)

### Calendar

- Parts: `env-calendar`, `env-calendar-day`, `env-calendar-day-content` (slot), `env-calendar-day-mark`, `env-calendar-grid`, `env-calendar-header`, `env-calendar-next`, `env-calendar-pad`, `env-calendar-previous`, `env-calendar-title`
- States: `data-date` on `env-calendar-day`

### Card

- Parts: `env-card`, `env-card-actions` (slot), `env-card-body`, `env-card-description`, `env-card-footer`, `env-card-header`, `env-card-header-end` (slot), `env-card-meta`, `env-card-title`
- States: `data-actions`; `data-background` (`page`); `data-emphasis` (`muted`) on `env-card-description`; `data-env-skeleton` on `env-card`, `env-card-description`, `env-card-header`, `env-card-meta`, `env-card-title`; `data-interactive`
- Color properties: `--env-card-container`, `--env-card-content`, `--env-card-outline`

### Checkbox

- Parts: `env-checkbox`, `env-checkbox-box`, `env-checkbox-description`, `env-checkbox-description-content` (slot), `env-checkbox-indicator`, `env-checkbox-input`, `env-checkbox-label`, `env-checkbox-label-content` (slot)
- States: `data-label-placement` (`start`)
- Color properties: `--env-checkbox-outline`, `--env-checkbox-selected`, `--env-checkbox-selected-content`

### Code

- Parts: `env-code`

### CodeBlock

- Parts: `env-code-block`, `env-code-block-copy-status`, `env-code-block-header`, `env-code-block-header-end` (slot), `env-code-block-token`
- States: `data-wrap`

### CodeDiff

- Parts: `env-code-diff`, `env-code-diff-failed`, `env-code-diff-failed-icon`

### ColorPicker

- Parts: `env-color-picker`, `env-color-picker-alpha`, `env-color-picker-area`, `env-color-picker-controls`, `env-color-picker-copy`, `env-color-picker-description`, `env-color-picker-description-content` (slot), `env-color-picker-error`, `env-color-picker-eye-dropper`, `env-color-picker-field`, `env-color-picker-field-label`, `env-color-picker-fields`, `env-color-picker-format`, `env-color-picker-hue`, `env-color-picker-input`, `env-color-picker-label`, `env-color-picker-popover`, `env-color-picker-row`, `env-color-picker-slider`, `env-color-picker-sliders`, `env-color-picker-swatch`, `env-color-picker-swatches`, `env-color-picker-thumb`, `env-color-picker-track`, `env-color-picker-values`
- States: `data-alpha` on `env-color-picker-values`; `data-channel` (`alpha`, `blue`, `brightness`, `green`, `hex`, `hue`, `lightness`, `red`, `saturation`) on `env-color-picker-alpha`, `env-color-picker-field`, `env-color-picker-hue`, `env-color-picker-slider`; `data-disabled` on `env-color-picker`, `env-color-picker-alpha`, `env-color-picker-area`, `env-color-picker-hue`, `env-color-picker-slider`; `data-dragging` on `env-color-picker-thumb`; `data-eye-dropper` on `env-color-picker-values`; `data-format` (`hex`, `hsl`, `rgb`) on `env-color-picker-row`, `env-color-picker-values`; `data-formats` (`together`) on `env-color-picker-values`; `data-invalid`; `data-readonly`; `data-selected` on `env-color-picker-swatch`; `data-translucent` on `env-color-picker-swatch`

### ColorPickerButton

- Parts: `env-color-picker-button`, `env-color-picker-button-value`
- States: `data-size` (`lg`, `md`, `sm`)
- Color properties: `--env-color-picker-button-container`

### ColorSwatch

- Parts: `env-color-swatch`, `env-color-swatch-label` (slot), `env-color-swatch-sample`, `env-color-swatch-value`
- States: `data-size` (`md`, `sm`) on `env-color-swatch`, `env-color-swatch-sample`; `data-translucent` on `env-color-swatch`, `env-color-swatch-sample`

### Combobox

- Parts: `env-combobox`, `env-combobox-chip`, `env-combobox-chip-label`, `env-combobox-chip-remove`, `env-combobox-clear`, `env-combobox-control`, `env-combobox-empty`, `env-combobox-end`, `env-combobox-group`, `env-combobox-group-label`, `env-combobox-input`, `env-combobox-item`, `env-combobox-item-indicator`, `env-combobox-label`, `env-combobox-list`, `env-combobox-popup`, `env-combobox-start`, `env-combobox-status`, `env-combobox-trigger`, `env-combobox-value-icon`
- States: `data-action-count` (`1`, `2`) on `env-combobox-control`; `data-disabled` on `env-combobox-item`; `data-popup-open` on `env-combobox-trigger`; `data-selected` on `env-combobox-item`
- Color properties: `--env-combobox-chip-container`, `--env-combobox-chip-content`

### CommandPalette

- Parts: `env-command-palette`, `env-command-palette-close`, `env-command-palette-footer`, `env-command-palette-footer-content` (slot), `env-command-palette-group`, `env-command-palette-group-label`, `env-command-palette-header`, `env-command-palette-hint`, `env-command-palette-hint-label` (slot), `env-command-palette-input`, `env-command-palette-item`, `env-command-palette-list`, `env-command-palette-positioner`, `env-command-palette-search`, `env-command-palette-search-end` (slot), `env-command-palette-search-start` (slot), `env-command-palette-status`
- States: `data-empty` on `env-command-palette-status`; `data-ending-style`; `data-starting-style`

### Composer

- Parts: `env-composer`, `env-composer-action`, `env-composer-description` (slot), `env-composer-end` (slot), `env-composer-footer`, `env-composer-header` (slot), `env-composer-input`, `env-composer-start` (slot), `env-composer-surface`
- States: `data-disabled`; `data-end`; `data-header`; `data-running`; `data-start`

### ConfirmButton

- Parts: `env-confirm-button`, `env-confirm-button-status`

### ConfirmDialog

- Parts: `env-confirm-dialog-form`

### CopyButton

- Parts: `env-copy-button`, `env-copy-button-field`, `env-copy-button-status`

### DatePicker

- Parts: `env-date-picker`, `env-date-picker-actions`, `env-date-picker-actions-end`, `env-date-picker-clear`, `env-date-picker-control`, `env-date-picker-end`, `env-date-picker-icon`, `env-date-picker-label`, `env-date-picker-native`, `env-date-picker-panes`, `env-date-picker-placeholder`, `env-date-picker-popup`, `env-date-picker-time`, `env-date-picker-time-title`, `env-date-picker-trigger`, `env-date-picker-value`
- States: `data-action-count` (`1`, `2`) on `env-date-picker-control`; `data-popup-open` on `env-date-picker-control`

### DescriptionList

- Parts: `env-description-list`, `env-description-list-item`, `env-description-list-label`, `env-description-list-value`
- States: `data-controls`; `data-layout` (`auto`, `inline`, `stacked`); `data-size` (`md`, `sm`)

### Dialog

- Parts: `env-dialog`, `env-dialog-actions`, `env-dialog-actions-start` (slot), `env-dialog-backdrop`, `env-dialog-content`, `env-dialog-description`, `env-dialog-header`, `env-dialog-header-end` (slot), `env-dialog-header-start` (slot), `env-dialog-heading`, `env-dialog-positioner`, `env-dialog-surface`, `env-dialog-title`
- States: `data-ending-style` on `env-dialog`, `env-dialog-backdrop`; `data-env-skeleton`; `data-placement` (`center`, `top`) on `env-dialog`, `env-dialog-positioner`; `data-starting-style` on `env-dialog`, `env-dialog-backdrop`; `data-tone` (`danger`, `neutral`); `data-width` (`lg`, `md`)

### Disclosure

- Parts: `env-disclosure`, `env-disclosure-indicator`, `env-disclosure-panel`, `env-disclosure-title` (slot)
- States: `data-indicator` (`end`); `data-layout` (`flow`) on `env-disclosure-panel`

### DocumentTabs

- Parts: `env-document-tabs`, `env-document-tabs-close`, `env-document-tabs-drag-image`, `env-document-tabs-end` (slot), `env-document-tabs-item`, `env-document-tabs-list`, `env-document-tabs-panel`, `env-document-tabs-panel-content` (slot), `env-document-tabs-strip`, `env-document-tabs-tab`, `env-document-tabs-tab-end` (slot), `env-document-tabs-tab-label`
- States: `data-active` on `env-document-tabs-item`; `data-drop` (`after`, `before`) on `env-document-tabs-item`; `data-first-active`; `data-moving` (`pointer`) on `env-document-tabs-item`; `data-preview` on `env-document-tabs-tab`; `data-reordering` on `env-document-tabs-list`; `data-value` on `env-document-tabs-tab`

### DropZone

- Parts: `env-drop-zone`, `env-drop-zone-content` (slot), `env-drop-zone-description`, `env-drop-zone-description-content` (slot), `env-drop-zone-icon`, `env-drop-zone-icon-content` (slot), `env-drop-zone-label`, `env-drop-zone-label-content` (slot), `env-drop-zone-target`, `env-drop-zone-text`
- States: `data-drag-over`; `data-invalid`; `data-pending`; `data-size` (`md`, `sm`)

### EmptyState

- Parts: `env-empty-state`, `env-empty-state-actions` (slot), `env-empty-state-description` (slot), `env-empty-state-heading`, `env-empty-state-icon` (slot), `env-empty-state-illustration` (slot), `env-empty-state-title` (slot)

### Field

- Parts: `env-field`, `env-field-control`, `env-field-description`, `env-field-description-content` (slot), `env-field-error`, `env-field-label`, `env-field-label-content` (slot)
- States: `data-disabled` on `env-field`, `env-field-control`; `data-invalid` on `env-field-control`; `data-size` (`lg`, `md`, `sm`) on `env-field-control`

### Graphic

- Parts: `env-graphic`, `env-graphic-image`, `env-graphic-mask`
- States: `data-aspect`; `data-fit` (`cover`); `data-size` (`fill`, `icon`, `lg`, `md`, `sm`, `text`, `xl`); `data-tint` (`text`)

### HoverCard

- Parts: `env-hover-card`
- States: `data-width` (`lg`)

### Icon

- Parts: `env-icon`, `env-icon-symbol`

### IconButton

- Parts: `env-icon-button`
- States: `data-full-width`; `data-pending`; `data-tone` (`danger`); `data-variant` (`ghost`, `outline`, `secondary`, `text`)
- Color properties: `--env-button-container`, `--env-button-content`, `--env-button-outline`, `--env-button-selected`, `--env-button-selected-content`
- `--env-icon-button-hit-area`, to set: The size of an icon button's pointer target, which a container sets for the icon buttons in it, such as the touch height under a coarse pointer; unset, the button's own box.

### Kbd

- Parts: `env-kbd`, `env-kbd-combination`, `env-kbd-part`, `env-kbd-separator`

### Link

- Parts: `env-link`
- States: `data-underline`; `data-variant` (`text`)

### List

- Parts: `env-list`, `env-list-announcer`, `env-list-description` (slot), `env-list-header`, `env-list-header-end` (slot), `env-list-item`, `env-list-item-content`, `env-list-item-control` (slot), `env-list-item-description`, `env-list-item-end` (slot), `env-list-item-extra` (slot), `env-list-item-handle`, `env-list-item-label` (slot), `env-list-item-start` (slot), `env-list-section`, `env-list-title`
- States: `data-density` (`lg`, `md`, `sm`, `xs`); `data-env-skeleton` on `env-list`, `env-list-item-description`; `data-interactive` on `env-list-item`; `data-label` on `env-list-item-handle`; `data-moving` (`keyboard`, `pointer`) on `env-list-item`; `data-placement` (`end`) on `env-list-item-handle`; `data-reorderable`; `data-reordering`; `data-selected` on `env-list-item`; `data-start` on `env-list-item`
- Color properties: `--env-list-item-container`, `--env-list-item-content`, `--env-list-item-selected`, `--env-list-item-selected-content`

### Markdown

- Parts: `env-markdown`, `env-markdown-table`

### Menu

- Parts: `env-menu`, `env-menu-choice`, `env-menu-group`, `env-menu-group-label`, `env-menu-header`, `env-menu-item`, `env-menu-item-description`, `env-menu-item-end`, `env-menu-item-indicator`, `env-menu-item-indicator-slot`, `env-menu-item-label`, `env-menu-item-shortcut`, `env-menu-item-start` (slot), `env-menu-item-text`, `env-menu-positioner`, `env-menu-separator`, `env-menu-submenu-chevron`, `env-menu-submenu-trigger`
- States: `data-checked` on `env-menu-choice`; `data-disabled` on `env-menu-item`; `data-highlighted` on `env-menu-choice`, `env-menu-item`; `data-instant` (`group`); `data-popup-open` on `env-menu-choice`, `env-menu-item`; `data-tone` (`danger`, `neutral`) on `env-menu-item`
- Color properties: `--env-menu-item-container`, `--env-menu-item-content`, `--env-menu-item-icon`

### Menubar

- Parts: `env-menubar`, `env-menubar-access-key`, `env-menubar-label`, `env-menubar-trigger`
- States: `data-access-key` on `env-menubar-trigger`; `data-access-keys-shown`; `data-disabled` on `env-menubar-trigger`; `data-popup-open` on `env-menubar-trigger`

### Message

- Parts: `env-message`, `env-message-actions` (slot), `env-message-author`, `env-message-content` (slot), `env-message-header`, `env-message-meta` (slot), `env-message-start` (slot), `env-message-status`, `env-message-text`
- States: `data-env-skeleton` on `env-message`, `env-message-author`, `env-message-header`, `env-message-meta`; `data-from` (`other`, `self`); `data-start`; `data-status` (`failed`, `sending`, `working`)

### MessageList

- Parts: `env-message-list`, `env-message-list-jump`
- States: `data-follow`

### Meter

- Parts: `env-meter`, `env-meter-header`, `env-meter-indicator`, `env-meter-label`, `env-meter-track`, `env-meter-value`
- States: `data-layout` (`inline`)

### MonthPicker

- Parts: `env-month-picker`, `env-month-picker-grid`, `env-month-picker-header`, `env-month-picker-month`, `env-month-picker-month-mark`, `env-month-picker-next`, `env-month-picker-popup`, `env-month-picker-previous`, `env-month-picker-title`, `env-month-picker-year`
- States: `data-month` on `env-month-picker-month`

### NavigationBar

- Parts: `env-navigation-bar`, `env-navigation-bar-count`, `env-navigation-bar-dot`, `env-navigation-bar-indicator`, `env-navigation-bar-item`, `env-navigation-bar-label`, `env-navigation-bar-list`, `env-navigation-bar-more`
- States: `data-background` (`default`, `page`); `data-current` on `env-navigation-bar-item`; `data-disabled` on `env-navigation-bar-item`; `data-dot` on `env-navigation-bar-count`; `data-env-skeleton`; `data-label-hidden`
- Color properties: `--env-navigation-bar-item-container`, `--env-navigation-bar-item-content`, `--env-navigation-bar-item-icon`, `--env-navigation-bar-item-selected`, `--env-navigation-bar-item-selected-content`

### NavigationDrawer

- Parts: `env-navigation-drawer`, `env-navigation-drawer-badge` (slot), `env-navigation-drawer-branch`, `env-navigation-drawer-chevron`, `env-navigation-drawer-children`, `env-navigation-drawer-count`, `env-navigation-drawer-end` (slot), `env-navigation-drawer-footer` (slot), `env-navigation-drawer-group-end` (slot), `env-navigation-drawer-group-label`, `env-navigation-drawer-group-row`, `env-navigation-drawer-header` (slot), `env-navigation-drawer-item`, `env-navigation-drawer-label`, `env-navigation-drawer-list`, `env-navigation-drawer-resize-handle`, `env-navigation-drawer-row`, `env-navigation-drawer-section`, `env-navigation-drawer-toggle`
- States: `data-background` (`default`, `page`); `data-current` on `env-navigation-drawer-item`; `data-disabled` on `env-navigation-drawer-item`; `data-dot` on `env-navigation-drawer-count`; `data-ending-style` on `env-navigation-drawer-children`; `data-env-skeleton`; `data-resizable`; `data-starting-style` on `env-navigation-drawer-children`
- Color properties: `--env-navigation-drawer-item-container`, `--env-navigation-drawer-item-content`, `--env-navigation-drawer-item-icon`, `--env-navigation-drawer-item-selected`, `--env-navigation-drawer-item-selected-content`

### NavigationRail

- Parts: `env-navigation-rail`, `env-navigation-rail-count`, `env-navigation-rail-footer` (slot), `env-navigation-rail-header` (slot), `env-navigation-rail-indicator`, `env-navigation-rail-item`, `env-navigation-rail-label`, `env-navigation-rail-list`
- States: `data-background` (`default`, `page`); `data-current` on `env-navigation-rail-item`; `data-disabled` on `env-navigation-rail-item`; `data-dot` on `env-navigation-rail-count`; `data-env-skeleton`; `data-label-hidden`
- Color properties: `--env-navigation-rail-item-container`, `--env-navigation-rail-item-content`, `--env-navigation-rail-item-icon`, `--env-navigation-rail-item-selected`, `--env-navigation-rail-item-selected-content`

### Page

- Parts: `env-page`, `env-page-content`
- States: `data-gutter` (`none`); `data-width` (`full`, `lg`, `md`, `sm`)

### PageHeader

- Parts: `env-page-header`, `env-page-header-actions` (slot), `env-page-header-breadcrumbs` (slot), `env-page-header-description` (slot), `env-page-header-heading`, `env-page-header-meta` (slot), `env-page-header-row`, `env-page-header-start` (slot), `env-page-header-title`, `env-page-header-title-line`, `env-page-header-toolbar` (slot)
- States: `data-scrolled`; `data-sticky`

### Pager

- Parts: `env-pager`, `env-pager-link`, `env-pager-link-copy`, `env-pager-link-label`, `env-pager-link-next`, `env-pager-link-previous`, `env-pager-link-title`
- States: `data-stacked`

### Pagination

- Parts: `env-pagination`, `env-pagination-button`, `env-pagination-range`
- States: `data-direction` (`next`, `previous`) on `env-pagination-button`; `data-size` (`lg`, `md`, `sm`)

### Panes

- Parts: `env-panes`, `env-panes-body`, `env-panes-header`, `env-panes-header-content` (slot), `env-panes-pane`, `env-panes-resize-handle`
- States: `data-env-layout` (`panes`); `data-env-name`; `data-sized` (`end`, `start`); `data-stack-below` (`expanded`, `large`, `medium`)

### Popover

- Parts: `env-popover`, `env-popover-title`
- States: `data-width` (`lg`)

### Progress

- Parts: `env-progress`, `env-progress-header`, `env-progress-indicator`, `env-progress-label`, `env-progress-segment`, `env-progress-track`, `env-progress-value`
- States: `data-indeterminate`; `data-segmented`

### Radio

- Parts: `env-radio`, `env-radio-control`, `env-radio-description`, `env-radio-description-content` (slot), `env-radio-input`, `env-radio-label` (slot)
- States: `data-label-placement` (`start`); `data-orientation` (`horizontal`, `vertical`)
- Color properties: `--env-radio-content`, `--env-radio-selected`

### RadioGroup

- Parts: `env-radio-group`, `env-radio-group-description`, `env-radio-group-description-content` (slot), `env-radio-group-error`, `env-radio-group-label` (slot)
- States: `data-orientation` (`horizontal`, `vertical`)

### RelativeTime

- Parts: `env-relative-time`

### ResizeHandle

- Parts: `env-resize-handle`
- States: `data-axis` (`block`, `inline`); `data-grip`; `data-resizing`

### Scaffold

- Parts: `env-scaffold`, `env-scaffold-aside`, `env-scaffold-bar`, `env-scaffold-body`, `env-scaffold-bottom-bar`, `env-scaffold-drawer`, `env-scaffold-navigation`, `env-scaffold-rail`, `env-scaffold-skip-link`, `env-scaffold-skip-links`, `env-scaffold-top-bar`
- States: `data-env-layout` (`scaffold`); `data-env-name`; `data-navigation-compact` (`bar`, `drawer`, `none`, `rail`); `data-navigation-expanded` (`bar`, `drawer`, `none`, `rail`); `data-navigation-form` (`bar`, `drawer`, `rail`) on `env-scaffold-bar`, `env-scaffold-drawer`, `env-scaffold-rail`; `data-navigation-large` (`bar`, `drawer`, `none`, `rail`); `data-navigation-medium` (`bar`, `drawer`, `none`, `rail`); `data-scroll` (`body`, `document`); `data-skip` (`navigation`) on `env-scaffold-skip-link`; `data-top-bar-span` (`body`, `full`)
- `--env-scaffold-sticky-top`, to read: How far below the window's top sticky content in the body sticks: under the top bar where the document scrolls.

### SegmentedControl

- Parts: `env-segmented-control`, `env-segmented-control-item`, `env-segmented-control-item-count`, `env-segmented-control-item-end` (slot), `env-segmented-control-item-icon` (slot), `env-segmented-control-item-label`, `env-segmented-control-thumb`
- States: `data-checked` on `env-segmented-control-item`; `data-disabled` on `env-segmented-control-item`; `data-full-width`; `data-placed` on `env-segmented-control-thumb`; `data-size` (`lg`, `md`, `sm`); `data-traveling` on `env-segmented-control-thumb`
- Color properties: `--env-segmented-control-container`, `--env-segmented-control-outline`, `--env-segmented-control-content`, `--env-segmented-control-selected`, `--env-segmented-control-selected-content`

### Select

- Parts: `env-select`, `env-select-control`, `env-select-end`, `env-select-group`, `env-select-group-label`, `env-select-icon`, `env-select-item`, `env-select-item-indicator`, `env-select-label`, `env-select-list`, `env-select-placeholder`, `env-select-popup`, `env-select-sizer`, `env-select-trigger`, `env-select-value`, `env-select-value-start` (slot)
- States: `data-disabled` on `env-select-item`; `data-highlighted` on `env-select-item`; `data-label-hidden`; `data-selected` on `env-select-item`
- Color properties: `--env-select-container`, `--env-select-content`, `--env-select-outline`

### Sheet

- Parts: `env-sheet`, `env-sheet-backdrop`, `env-sheet-body`, `env-sheet-resize-handle`, `env-sheet-viewport`
- States: `data-ending-style`; `data-env-skeleton`; `data-resizable`; `data-side` (`bottom`, `end`, `start`) on `env-sheet`, `env-sheet-viewport`; `data-starting-style`; `data-swiping`; `data-width`

### Slider

- Parts: `env-slider`, `env-slider-control`, `env-slider-header`, `env-slider-indicator`, `env-slider-label`, `env-slider-thumb`, `env-slider-track`, `env-slider-value`
- States: `data-disabled`; `data-dragging` on `env-slider-control`; `data-handle` on `env-slider-control`; `data-ruler` on `env-slider-control`; `data-ticks`
- Color properties: `--env-slider-container`, `--env-slider-indicator`, `--env-slider-content`

### Spinner

- Parts: `env-spinner`, `env-spinner-arc`, `env-spinner-label`
- States: `data-label-hidden`; `data-size` (`lg`, `md`, `sm`)
- `--env-spinner-color`, to set: The color of the spinners inside an element, such as a button’s label color; unset, the primary emphasis color.

### Surface

- Parts: `env-surface`
- States: `data-background` (`default`, `muted`, `page`, `raised`, `recessed`); `data-radius` (`full`, `none`, `sm`, `xl`)
- Color properties: `--env-surface-container`, `--env-surface-content`, `--env-surface-outline`

### Switch

- Parts: `env-switch`, `env-switch-description`, `env-switch-description-content` (slot), `env-switch-input`, `env-switch-label`, `env-switch-label-content` (slot)
- States: `data-label-placement` (`start`)
- Color properties: `--env-switch-container`, `--env-switch-content`, `--env-switch-outline`, `--env-switch-selected`, `--env-switch-selected-content`

### Table

- Parts: `env-table`, `env-table-body`, `env-table-caption`, `env-table-cell`, `env-table-cell-content` (slot), `env-table-cell-label`, `env-table-column-resize-handle`, `env-table-foot`, `env-table-head`, `env-table-header-cell`, `env-table-header-content`, `env-table-header-end` (slot), `env-table-header-label`, `env-table-region`, `env-table-row`, `env-table-sort-button`
- States: `data-align` (`end`, `start`) on `env-table-cell`, `env-table-header-cell`; `data-density` (`lg`, `md`, `sm`, `xs`); `data-fixed-layout`; `data-interactive` on `env-table-row`; `data-labelled` on `env-table-cell`; `data-narrow-layout` (`stack`) on `env-table-region`; `data-nowrap` on `env-table-cell`, `env-table-header-cell`; `data-numeric` on `env-table-cell`, `env-table-header-cell`; `data-plain` on `env-table-region`; `data-resizable` on `env-table-header-cell`; `data-resizing` on `env-table`, `env-table-column-resize-handle`; `data-sortable` on `env-table-header-cell`; `data-stacked` on `env-table-region`; `data-sticky-header` on `env-table-region`

### TableOfContents

- Parts: `env-table-of-contents`, `env-table-of-contents-body`, `env-table-of-contents-item`, `env-table-of-contents-link`, `env-table-of-contents-list`, `env-table-of-contents-wave`
- States: `data-passed` on `env-table-of-contents-link`
- `--env-table-of-contents-depth`, to read: An item's level below the top, from 1, which the component sets on each nested item and its indent reads.
- `--env-table-of-contents-room`, to read: The room the contents leave above the first link and below the last, which the reader's place runs on into: an application reads it to line the first label up with what is beside it.

### Text

- Parts: `env-text`
- States: `data-emphasis` (`default`, `muted`, `subtle`); `data-tabular-numbers`; `data-variant` (`body`, `body-sm`, `caption`, `display`, `headline`, `title`)

### TextField

- Parts: `env-text-field`, `env-text-field-control`, `env-text-field-end`, `env-text-field-end-action` (slot), `env-text-field-input`, `env-text-field-label`, `env-text-field-prefix`, `env-text-field-start` (slot), `env-text-field-suffix`
- States: `data-disabled` on `env-text-field-control`; `data-end-action` on `env-text-field-control`; `data-invalid` on `env-text-field-control`; `data-label-hidden`; `data-popup-open` on `env-text-field-control`; `data-prefix` on `env-text-field-control`; `data-rows` on `env-text-field-input`; `data-size` (`lg`, `md`, `sm`); `data-sizing` (`content`, `fixed`) on `env-text-field-input`; `data-start-icon` on `env-text-field-control`; `data-suffix` on `env-text-field-control`; `data-tall`; `data-variant` (`ghost`, `outline`) on `env-text-field-control`
- Color properties: `--env-text-field-container`, `--env-text-field-content`, `--env-text-field-outline`, `--env-text-field-indicator`

### Textarea

- Parts: `env-textarea`, `env-textarea-resize-handle`
- States: `data-resizing` on `env-textarea-resize-handle`
- Color properties: `--env-text-field-container`, `--env-text-field-content`, `--env-text-field-outline`, `--env-text-field-indicator`

### Theme

- Parts: `env-theme`
- States: `data-env-contrast` (`high`, `standard`); `data-env-corners` (`round`, `rounded`, `sharp`); `data-env-scale` (`comfortable`, `compact`, `system`); `data-env-selection` (`accent`, `neutral`); `data-env-theme` (`dark`, `light`)

### ThemeToggle

- Parts: `env-theme-toggle`

### TimePicker

- Parts: `env-time-picker`, `env-time-picker-popup`

### ToastProvider

- Parts: `env-toast`, `env-toast-action`, `env-toast-actions`, `env-toast-announcer`, `env-toast-content`, `env-toast-dismiss`, `env-toast-message`, `env-toast-queued-count`, `env-toast-status-icon`, `env-toast-theme`, `env-toast-viewport`
- States: `data-ending-style`; `data-leaving`; `data-limited`; `data-placement` (`bottom-end`, `top-center`) on `env-toast-viewport`; `data-settling` on `env-toast-viewport`; `data-starting-style`; `data-toast-id` on `env-toast`, `env-toast-queued-count`; `data-tone` (`danger`, `info`, `neutral`, `success`)
- Color properties: `--env-toast-container`, `--env-toast-content`, `--env-toast-outline`

### Toolbar

- Parts: `env-toolbar`, `env-toolbar-button`, `env-toolbar-group`, `env-toolbar-separator`, `env-toolbar-tooltip`
- States: `data-orientation` (`horizontal`, `vertical`) on `env-toolbar`, `env-toolbar-group`, `env-toolbar-separator`; `data-size` (`lg`, `md`, `sm`)

### Tooltip

- Parts: `env-tooltip`, `env-tooltip-disabled-target`, `env-tooltip-positioner`
- States: `data-ending-style`; `data-starting-style`
- Color properties: `--env-tooltip-container`, `--env-tooltip-content`, `--env-tooltip-outline`
- `--env-tooltip-opacity`, to set: How much of a tooltip's strong fill covers what is behind it.
- `--env-tooltip-shadow`, to set: The small shadow beside a tooltip; none where it is solid.

### TopBar

- Parts: `env-top-bar`, `env-top-bar-center` (slot), `env-top-bar-end` (slot), `env-top-bar-lead`, `env-top-bar-loading-bar`, `env-top-bar-middle`, `env-top-bar-start` (slot), `env-top-bar-title` (slot), `env-top-bar-title-text`
- States: `data-background` (`default`, `page`); `data-centered`; `data-loading`; `data-sticky`; `data-title-bar`

### Tree

- Parts: `env-tree`, `env-tree-chevron`, `env-tree-description`, `env-tree-end` (slot), `env-tree-group`, `env-tree-icon`, `env-tree-item`, `env-tree-label`, `env-tree-rows`
- States: `data-density` (`lg`, `md`, `sm`, `xs`); `data-ending-style` on `env-tree-group`; `data-expanded` on `env-tree-chevron`; `data-focus-visible`; `data-highlighted` on `env-tree-item`; `data-id` on `env-tree-item`; `data-starting-style` on `env-tree-group`, `env-tree-item`

### VisuallyHidden

- Parts: `env-visually-hidden`

## Shared parts

### ConnectedRows

- Parts: `env-connected-rows`, `env-connected-row`
- States: `data-density` (`lg`, `md`, `sm`, `xs`); `data-interactive` on `env-connected-row`; `data-reorderable`; `data-selected` on `env-connected-row`; `data-start` on `env-connected-row`
- Used by: List

### HoverDetail

- Parts: `env-hover-detail`
- Used by: HoverCard, RelativeTime, Tooltip

### ListRow

- Parts: `env-list-row`, `env-list-row-description`, `env-list-row-end` (slot), `env-list-row-indicator`, `env-list-row-label` (slot), `env-list-row-start` (slot), `env-list-row-text`
- States: `data-disabled`; `data-highlighted`; `data-popup-open`; `data-selected`
- Used by: Combobox, CommandPalette, Select

### LoadingBar

- Parts: `env-loading-bar`, `env-loading-bar-indicator`
- States: `data-state` (`finishing`, `running`)
- Used by: TopBar

### Overlay

- Parts: `env-overlay-theme`
- Used by: CommandPalette, ConfirmDialog, Dialog, Sheet

### PickerPopup

- Parts: `env-picker-popup`, `env-picker-popup-body`, `env-picker-popup-footer`, `env-picker-popup-footer-end`, `env-picker-popup-header` (slot)
- Used by: DatePicker, MonthPicker, TimePicker

### Popup

- Parts: `env-popup`, `env-popup-positioner`, `env-popup-theme`
- States: `data-elevation` (`1`, `2`, `3`); `data-ending-style`; `data-starting-style`; `data-width` (`lg`, `md`)
- `--env-popup-opacity`, to set: How much of a frosted popup's fill covers what is behind it.
- `--env-popup-blur`, to set: How much a frosted popup blurs what shows through it.
- `--env-popup-shadow`, to set: The soft shadow a frosted popup, the command palette and a dialog cast; none where they are solid.
- Used by: Breadcrumbs, ColorPickerButton, Combobox, CopyButton, DatePicker, HoverCard, Menu, Menubar, MonthPicker, NavigationBar, NavigationDrawer, NavigationRail, Popover, RelativeTime, SegmentedControl, Select, TimePicker, Tooltip

### Prose

- Parts: `env-prose`
- Used by: Markdown

### Skeleton

- Parts: `env-skeleton-content`, `env-skeleton-status`
- Used by: Accordion, Alert, Breadcrumbs, Card, ColorPickerButton, Combobox, ConfirmDialog, CopyButton, DatePicker, Dialog, HoverCard, List, Menu, Menubar, Message, MessageList, MonthPicker, NavigationBar, NavigationDrawer, NavigationRail, Popover, RelativeTime, SegmentedControl, Select, Sheet, Surface, Table, TimePicker, Tooltip, TopBar

### TimeList

- Parts: `env-time-list`, `env-time-list-column`, `env-time-list-row`
- States: `data-centered` on `env-time-list-row`; `data-columns`; `data-disabled` on `env-time-list-row`; `data-dragging` on `env-time-list-column`; `data-loop` on `env-time-list-column`; `data-part` (`day-period`, `hour`, `minute`) on `env-time-list-column`; `data-turning` on `env-time-list-column`; `data-value` on `env-time-list-column`, `env-time-list-row`
- Used by: DatePicker, TimePicker

## Tokens to line up with

| Token                           | Comfortable                 | Compact                     | Use                                                                                                                                                                                                                                                                  |
| ------------------------------- | --------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env-control-height`          | `2.5rem`                    | `2.25rem`                   | The height a control takes when it sets no size: md, unless a container sets it to another control height for what it holds, as a table cell does with sm.                                                                                                           |
| `--env-control-height-lg`       | `3rem`                      | `2.75rem`                   | The large control height, for a control of size lg, such as a prominent call to action.                                                                                                                                                                              |
| `--env-control-height-md`       | `2.5rem`                    | `2.25rem`                   | The medium control height, every control's default size.                                                                                                                                                                                                             |
| `--env-control-height-sm`       | `2rem`                      | `1.75rem`                   | The small control height: a control of size sm, the actions in a table cell, a title bar or a panel header.                                                                                                                                                          |
| `--env-control-height-touch`    | `2.75rem`                   | `2.75rem`                   | The height every control grows to under a coarse pointer, whatever the scale, and the width of a button: its own box is its hit area. Rows grow to it too.                                                                                                           |
| `--env-icon-size`               | `1rem`                      | `1rem`                      | The size of the icons here, which content lines up with: the control icon size, 1 rem, at the root; a component that sizes its icons, such as a button, a navigation item or a list row, sets it on its own element for the icons inside.                            |
| `--env-navigation-drawer-width` | `17.5rem`                   | `17.5rem`                   | The width a resizable NavigationDrawer starts at, 17.5 rem; on a resizable drawer, the width it has now.                                                                                                                                                             |
| `--env-navigation-rail-width`   | `5rem`                      | `5rem`                      | The width of a NavigationRail: 5 rem.                                                                                                                                                                                                                                |
| `--env-page-gutter`             | `1rem`                      | `0.75rem`                   | The space a Page keeps at its inline edges in a compact region: spacing step 4. A Page whose container is 37.5 rem or wider keeps spacing step 5, and a Page without a gutter none; inside a Page this property is the gutter it keeps, so content lines up with it. |
| `--env-page-width-lg`           | `76rem`                     | `76rem`                     | The width of a Page's column at width lg, its default: 76 rem.                                                                                                                                                                                                       |
| `--env-page-width-md`           | `60rem`                     | `60rem`                     | The width of a Page's column at width md, for reading: 60 rem.                                                                                                                                                                                                       |
| `--env-page-width-sm`           | `40rem`                     | `40rem`                     | The width of a Page's column at width sm, for a form or settings: 40 rem.                                                                                                                                                                                            |
| `--env-panes-other-min`         | `16rem`                     | `16rem`                     | The least width the other pane of Panes keeps beside the sized one: 16 rem.                                                                                                                                                                                          |
| `--env-panes-size`              | `22.5rem`                   | `22.5rem`                   | The width of the sized pane of Panes, until people resize it: 22.5 rem; on Panes, the width it has now.                                                                                                                                                              |
| `--env-sheet-width-lg`          | `44rem`                     | `44rem`                     | The width of a side Sheet at width lg, for content-heavy tasks: 44 rem.                                                                                                                                                                                              |
| `--env-sheet-width-md`          | `24rem`                     | `24rem`                     | The width of a side Sheet at width md, its default, for details and filters: 24 rem.                                                                                                                                                                                 |
| `--env-title-bar-height`        | `2.5rem`                    | `2rem`                      | A window title bar drawn by the application, which holds controls of size sm.                                                                                                                                                                                        |
| `--env-top-bar-height`          | `3.25rem`                   | `2.625rem`                  | TopBar's height: a single row that holds controls of the control height with space around them.                                                                                                                                                                      |
| `--env-viewport-gutter`         | `clamp(0.75rem, 2vw, 1rem)` | `clamp(0.75rem, 2vw, 1rem)` | The least space between the window's edge and a dialog, the command palette or rich text suggestions: 0.75 to 1 rem, with the window.                                                                                                                                |
