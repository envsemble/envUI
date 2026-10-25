import { common } from './common.js';
import { alert } from './alert.js';
import { avatarGroup } from './avatarGroup.js';
import { breadcrumbs } from './breadcrumbs.js';
import { calendar } from './calendar.js';
import { calendarHeatmap } from './calendarHeatmap.js';
import { codeBlock } from './codeBlock.js';
import { codeDiff } from './codeDiff.js';
import { colorPicker } from './colorPicker.js';
import { combobox } from './combobox.js';
import { commandPalette } from './commandPalette.js';
import { composer } from './composer.js';
import { confirmButton } from './confirmButton.js';
import { confirmDialog } from './confirmDialog.js';
import { copy } from './copy.js';
import { datePicker } from './datePicker.js';
import { dialog } from './dialog.js';
import { diffStat } from './diffStat.js';
import { documentTabs } from './documentTabs.js';
import { editor } from './editor.js';
import { linkDialog } from './linkDialog.js';
import { list } from './list.js';
import { markdown } from './markdown.js';
import { markdownEditor } from './markdownEditor.js';
import { message } from './message.js';
import { monthPicker } from './monthPicker.js';
import { navigation } from './navigation.js';
import { pager } from './pager.js';
import { pagination } from './pagination.js';
import { panes } from './panes.js';
import { panelDock } from './panelDock.js';
import { rating } from './rating.js';
import { relativeTime } from './relativeTime.js';
import { richText } from './richText.js';
import { scaffold } from './scaffold.js';
import { searchField } from './searchField.js';
import { table } from './table.js';
import { tableOfContents } from './tableOfContents.js';
import { textarea } from './textarea.js';
import { timePicker } from './timePicker.js';
import { themeToggle } from './themeToggle.js';
import { toast } from './toast.js';
import { topBar } from './topBar.js';
import { tree } from './tree.js';

/**
 * envUI's built-in English strings, by namespace: one per component family, each in a module of its
 * own beside this one. A component imports only its namespace's module, so unused strings stay out
 * of a bundle; this collection is for applications that extract the keys, from
 * `@envsemble/envui/messages`. A message is a string, or a function of the values it names.
 */
export const defaultMessages = {
  common,
  alert,
  avatarGroup,
  breadcrumbs,
  calendar,
  calendarHeatmap,
  codeBlock,
  codeDiff,
  colorPicker,
  combobox,
  commandPalette,
  composer,
  confirmButton,
  confirmDialog,
  copy,
  datePicker,
  dialog,
  diffStat,
  documentTabs,
  editor,
  linkDialog,
  list,
  markdown,
  markdownEditor,
  message,
  monthPicker,
  navigation,
  pager,
  pagination,
  panes,
  panelDock,
  rating,
  relativeTime,
  richText,
  scaffold,
  searchField,
  table,
  tableOfContents,
  textarea,
  timePicker,
  themeToggle,
  toast,
  topBar,
  tree,
};

/** Every namespace of envUI's messages with every key, as defaultMessages has them. */
export type EnvUIMessages = typeof defaultMessages;

/** Overrides of envUI's messages: any namespace, and any of its keys. */
export type EnvUIMessagesInput = {
  [Namespace in keyof EnvUIMessages]?: Partial<EnvUIMessages[Namespace]>;
};
