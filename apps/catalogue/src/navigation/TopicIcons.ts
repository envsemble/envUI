import { Home } from '@envsemble/envui/icons/Home';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Palette } from '@envsemble/envui/icons/Palette';
import { Star } from '@envsemble/envui/icons/Star';
import { TextFields } from '@envsemble/envui/icons/TextFields';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { Devices } from '@envsemble/envui/icons/Devices';
import { TouchApp } from '@envsemble/envui/icons/TouchApp';
import { Info } from '@envsemble/envui/icons/Info';
import { Category } from '@envsemble/envui/icons/Category';
import { AccessibilityNew } from '@envsemble/envui/icons/AccessibilityNew';
import { Article } from '@envsemble/envui/icons/Article';
import { ArrowDropDownCircle } from '@envsemble/envui/icons/ArrowDropDownCircle';
import { ArrowForward } from '@envsemble/envui/icons/ArrowForward';
import { CheckBox } from '@envsemble/envui/icons/CheckBox';
import { Code } from '@envsemble/envui/icons/Code';
import { CropSquare } from '@envsemble/envui/icons/CropSquare';
import { Dashboard } from '@envsemble/envui/icons/Dashboard';
import { BottomNavigation } from '@envsemble/envui/icons/BottomNavigation';
import { Explore } from '@envsemble/envui/icons/Explore';
import { SideNavigation } from '@envsemble/envui/icons/SideNavigation';
import { Extension } from '@envsemble/envui/icons/Extension';
import { FormatLineSpacing } from '@envsemble/envui/icons/FormatLineSpacing';
import { FormatSize } from '@envsemble/envui/icons/FormatSize';
import { HourglassEmpty } from '@envsemble/envui/icons/HourglassEmpty';
import { Notes } from '@envsemble/envui/icons/Notes';
import { Notifications } from '@envsemble/envui/icons/Notifications';
import { RadioButtonChecked } from '@envsemble/envui/icons/RadioButtonChecked';
import { ToggleOn } from '@envsemble/envui/icons/ToggleOn';
import { ViewModule } from '@envsemble/envui/icons/ViewModule';
import { WebAsset } from '@envsemble/envui/icons/WebAsset';
import { Widgets } from '@envsemble/envui/icons/Widgets';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { MenuOpen } from '@envsemble/envui/icons/MenuOpen';
import { ChatBubble } from '@envsemble/envui/icons/ChatBubble';
import { AccountCircle } from '@envsemble/envui/icons/AccountCircle';
import { Speed } from '@envsemble/envui/icons/Speed';
import { SpaceDashboard } from '@envsemble/envui/icons/SpaceDashboard';
import { AccountTree } from '@envsemble/envui/icons/AccountTree';
import { Tab } from '@envsemble/envui/icons/Tab';
import { KeyboardCommandKey } from '@envsemble/envui/icons/KeyboardCommandKey';
import { ViewWeek } from '@envsemble/envui/icons/ViewWeek';
import { Preview } from '@envsemble/envui/icons/Preview';
import { Sell } from '@envsemble/envui/icons/Sell';
import { Campaign } from '@envsemble/envui/icons/Campaign';
import { Chat } from '@envsemble/envui/icons/Chat';
import { TableChart } from '@envsemble/envui/icons/TableChart';
import { Keyboard } from '@envsemble/envui/icons/Keyboard';
import { LinearScale } from '@envsemble/envui/icons/LinearScale';
import { Tune } from '@envsemble/envui/icons/Tune';
import { Send } from '@envsemble/envui/icons/Send';
import { Forum } from '@envsemble/envui/icons/Forum';
import { CloudUpload } from '@envsemble/envui/icons/CloudUpload';
import { CalendarViewMonth } from '@envsemble/envui/icons/CalendarViewMonth';
import { CalendarMonth } from '@envsemble/envui/icons/CalendarMonth';
import { DateRange } from '@envsemble/envui/icons/DateRange';
import { ManageSearch } from '@envsemble/envui/icons/ManageSearch';
import { DockToBottom } from '@envsemble/envui/icons/DockToBottom';
import { ViewSidebar } from '@envsemble/envui/icons/ViewSidebar';
import { Schedule } from '@envsemble/envui/icons/Schedule';
import { LastPage } from '@envsemble/envui/icons/LastPage';
import { type Reference } from '../Reference';

export const foundationIcons: Record<string, typeof Palette> = {
  colors: Palette,
  typography: TextFields,
  spacing: ViewList,
  responsive: Devices,
  icons: Category,
  accessibility: TouchApp,
};
const groupIcons = {
  Foundations: Category,
  'Layout & surfaces': ViewList,
  Actions: TouchApp,
  'Forms & selection': TextFields,
  Navigation: Home,
  'Content & guidance': Category,
  'Feedback & overlays': Info,
} satisfies Record<Reference['group'], typeof Apps>;
export function getComponentIcon(group: Reference['group']) {
  return groupIcons[group];
}

const referenceIcons: Record<string, typeof Palette> = {
  typography: FormatSize,
  spacing: FormatLineSpacing,
  scale: FormatSize,
  composition: Extension,
  icons: Widgets,
  accessibility: AccessibilityNew,
  stack: ViewModule,
  surface: CropSquare,
  card: Dashboard,
  button: TouchApp,
  'text-field': TextFields,
  checkbox: CheckBox,
  switch: ToggleOn,
  radio: RadioButtonChecked,
  select: ArrowDropDownCircle,
  combobox: ManageSearch,
  'date-picker': CalendarMonth,
  'time-picker': Schedule,
  'month-picker': DateRange,
  slider: Tune,
  'drop-zone': CloudUpload,
  'color-picker': Palette,
  composer: Send,
  message: Forum,
  'calendar-heatmap': CalendarViewMonth,
  rating: Star,
  'relative-time': Schedule,
  bar: BottomNavigation,
  rail: SideNavigation,
  drawer: Explore,
  tabs: WebAsset,
  pager: ArrowForward,
  markdown: Article,
  'rich-text': Article,
  code: Code,
  disclosure: Notes,
  spinner: HourglassEmpty,
  toast: Notifications,
  dialog: WebAsset,
  menu: MoreVert,
  menubar: MenuOpen,
  tooltip: ChatBubble,
  avatar: AccountCircle,
  meter: Speed,
  progress: Speed,
  scaffold: SpaceDashboard,
  panes: ViewSidebar,
  'top-bar': WebAsset,
  sheet: ViewSidebar,
  tree: AccountTree,
  'document-tabs': Tab,
  'panel-dock': DockToBottom,
  'command-palette': KeyboardCommandKey,
  'segmented-control': ViewWeek,
  badge: Sell,
  alert: Campaign,
  popover: Chat,
  'hover-card': Preview,
  table: TableChart,
  kbd: Keyboard,
  breadcrumbs: LinearScale,
  pagination: LastPage,
};

/** A decorative symbol for the individual reference topic. */
export function getReferenceIcon(id: string, group: Reference['group']) {
  return referenceIcons[id] ?? foundationIcons[id] ?? getComponentIcon(group);
}
