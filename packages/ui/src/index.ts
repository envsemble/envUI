// The main entry point, one heading per family folder (tests/library/rules/ComponentFolders.test.ts maps
// each page category to its folder).

// foundations/: theme, text, icons, window classes, the provider and the skeleton every family takes.
export * from './foundations/Theme.js';
export * from './foundations/Text.js';
export * from './foundations/windowClasses.js';
export * from './foundations/useContainerSize.js';
export * from './foundations/EnvUIProvider.js';
export * from './foundations/PortalContainer.js';
export { placeholders, isPlaceholder, type Placeholder } from './foundations/placeholders.js';
export { useSkeleton } from './foundations/SkeletonScope.js';
export * from './foundations/Icon.js';
export * from './foundations/ThemePreference.js';
export * from './foundations/ThemeToggle.js';
export {
  createThemeBootstrapScript,
  type ThemeBootstrapOptions,
  type ThemePreference,
} from './foundations/themeBootstrap.js';
export * from './foundations/ThemeMenuRadioGroup.js';
export type { HeadingLevel } from './foundations/headingLevel.js';

// actions/ (Actions): buttons, links, menus and the controls that act at once.
export * from './actions/Button.js';
export * as Toolbar from './actions/Toolbar.js';
export * from './actions/Link.js';
export * from './actions/ButtonGroup.js';
export * from './actions/ConfirmButton.js';
export * from './actions/CopyButton.js';
export * as Menu from './actions/menu/Menu.js';
export * from './actions/ContextMenu.js';
export * as Menubar from './actions/Menubar.js';
export * from './actions/CommandPalette.js';

// forms/ (Forms & selection): text, choices, pickers and the drop zone.
export * as Field from './forms/Field.js';
export * from './forms/TextField.js';
export * from './forms/Textarea.js';
export * from './forms/Checkbox.js';
export * from './forms/Switch.js';
export * from './forms/Radio.js';
export * from './forms/SegmentedControl.js';
export * from './forms/Select.js';
export * from './forms/Combobox.js';
// calendarActiveDay stays internal: DatePicker's popup opens on the calendar's active day.
export { Calendar, type CalendarProps, type Weekday } from './forms/Calendar.js';
export * from './forms/DatePicker.js';
export * from './forms/TimePicker.js';
export * from './forms/MonthPicker.js';
export * from './forms/Slider.js';
export * from './forms/DropZone.js';
export * from './forms/SearchField.js';

// navigation/ (Navigation): bars, rails, drawers, tabs, trees and the ways around a page.
export * from './navigation/NavigationBar.js';
export * from './navigation/NavigationRail.js';
export * from './navigation/NavigationDrawer.js';
export type { Destination, NavigationDrawerDestination } from './navigation/destinations.js';
export type { NavigationBackground } from './navigation/navigationBackground.js';
export * as Pager from './navigation/Pager.js';
export * from './navigation/Tabs.js';
export {
  LinkProvider,
  type LinkProviderProps,
  type LinkComponentProps,
} from './foundations/LinkProvider.js';
export * from './navigation/Tree.js';
export * from './navigation/DocumentTabs.js';
export * from './navigation/Breadcrumbs.js';
export * from './navigation/TableOfContents.js';
export * from './navigation/Pagination.js';

// data-display/ (Data display): lists, tables, badges, avatars, meters and the values they show.
export * as List from './data-display/List.js';
export * from './data-display/Badge.js';
export * from './data-display/DiffStat.js';
export * as Table from './data-display/Table.js';
export * from './data-display/Avatar.js';
export * from './data-display/AvatarButton.js';
export * from './data-display/AvatarGroup.js';
export * from './data-display/Graphic.js';
export * from './data-display/AnimatedNumber.js';
export * from './data-display/RelativeTime.js';
// Plain functions that a server component calls come from modules that are not client modules.
export {
  formatRelativeTime,
  type RelativeTimeOptions,
  type RelativeTimeValue,
} from './data-display/formatRelativeTime.js';
export * from './data-display/Rating.js';
export * as DescriptionList from './data-display/DescriptionList.js';
export * from './data-display/CalendarHeatmap.js';
export * from './data-display/Meter.js';

// content/ (Text & content): disclosures, keys, messages and the composer.
export * from './content/Disclosure.js';
export * as Accordion from './content/Accordion.js';
export * from './content/Kbd.js';
export * from './content/useModifierKey.js';
export * from './content/Message.js';
export * from './content/Composer.js';

// feedback/ (Feedback): alerts, progress and toasts.
export * from './feedback/Alert.js';
export * from './feedback/Spinner.js';
export * from './feedback/Progress.js';
export { ToastProvider, type ToastProviderProps } from './feedback/toast/ToastProvider.js';
export { useToast } from './feedback/toast/useToast.js';
export type {
  ToastTone,
  ToastPlacement,
  ToastAction,
  ToastNotification,
  ToastManager,
} from './feedback/toast/toastTypes.js';

// overlays/ (Overlays): dialogs, sheets, popovers, hover cards and tooltips.
export * from './overlays/Dialog.js';
export * from './overlays/ConfirmDialog.js';
export * from './overlays/Sheet.js';
export * from './overlays/Popover.js';
export * from './overlays/HoverCard.js';
export * from './overlays/Tooltip.js';

// layout/ (App frame & layout): the application frame, surfaces, panes, pages and cards.
export * from './layout/Layout.js';
export * from './layout/Surface.js';
export * from './layout/Scaffold.js';
export * from './layout/TopBar.js';
export * as Panes from './layout/Panes.js';
export { readPanesWidth } from './layout/panesSize.js';
// What every resize callback receives, Panes', Sheet's and NavigationDrawer's alike.
export type { ResizeDetails } from './internal/resize/resizeDetails.js';
export * as PanelDock from './layout/panel-dock/PanelDock.js';
export type { PanelDockMode, PanelDockPanel } from './layout/panel-dock/panelDockTypes.js';
export * from './layout/Page.js';
export * from './layout/PageHeader.js';
export * from './layout/LineArt.js';
export * from './layout/Card.js';
