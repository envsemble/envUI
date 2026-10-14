import { Home } from '@envsemble/envui/icons/Home';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Palette } from '@envsemble/envui/icons/Palette';
import { TextFields } from '@envsemble/envui/icons/TextFields';
import { ViewList } from '@envsemble/envui/icons/ViewList';
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
import { Explore } from '@envsemble/envui/icons/Explore';
import { Extension } from '@envsemble/envui/icons/Extension';
import { FormatLineSpacing } from '@envsemble/envui/icons/FormatLineSpacing';
import { FormatSize } from '@envsemble/envui/icons/FormatSize';
import { HourglassEmpty } from '@envsemble/envui/icons/HourglassEmpty';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { Label } from '@envsemble/envui/icons/Label';
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
import { Sell } from '@envsemble/envui/icons/Sell';
import { Campaign } from '@envsemble/envui/icons/Campaign';
import { Chat } from '@envsemble/envui/icons/Chat';
import { TableChart } from '@envsemble/envui/icons/TableChart';
import { Keyboard } from '@envsemble/envui/icons/Keyboard';
import { LinearScale } from '@envsemble/envui/icons/LinearScale';
import { Tune } from '@envsemble/envui/icons/Tune';
import { Send } from '@envsemble/envui/icons/Send';
import { Forum } from '@envsemble/envui/icons/Forum';
import { VerticalSplit } from '@envsemble/envui/icons/VerticalSplit';
import { Monitoring } from '@envsemble/envui/icons/Monitoring';
import { CloudUpload } from '@envsemble/envui/icons/CloudUpload';
import { CalendarViewMonth } from '@envsemble/envui/icons/CalendarViewMonth';
import { Schedule } from '@envsemble/envui/icons/Schedule';
import { type Reference } from '../Reference';

export const foundationIcons: Record<string, typeof Palette> = {
  colors: Palette,
  typography: TextFields,
  spacing: ViewList,
  icons: Category,
  composition: ViewList,
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
  composition: Extension,
  icons: Widgets,
  accessibility: AccessibilityNew,
  layout: ViewModule,
  surface: CropSquare,
  cards: Dashboard,
  'split-view': VerticalSplit,
  buttons: TouchApp,
  fields: TextFields,
  checkbox: CheckBox,
  switch: ToggleOn,
  radio: RadioButtonChecked,
  select: ArrowDropDownCircle,
  slider: Tune,
  'file-dropzone': CloudUpload,
  'color-picker': Palette,
  composer: Send,
  messages: Forum,
  stats: Monitoring,
  heatmap: CalendarViewMonth,
  'relative-time': Schedule,
  navigation: Explore,
  tabs: WebAsset,
  'direction-links': ArrowForward,
  markdown: Article,
  'rich-text': Article,
  code: Code,
  chips: Label,
  disclosures: Notes,
  'empty-state': Inbox,
  loading: HourglassEmpty,
  toasts: Notifications,
  dialogs: WebAsset,
  menu: MoreVert,
  menubar: MenuOpen,
  tooltip: ChatBubble,
  avatar: AccountCircle,
  meters: Speed,
  'app-shell': SpaceDashboard,
  tree: AccountTree,
  'document-tabs': Tab,
  'command-palette': KeyboardCommandKey,
  'segmented-control': ViewWeek,
  badges: Sell,
  notices: Campaign,
  popover: Chat,
  tables: TableChart,
  keyboard: Keyboard,
  breadcrumbs: LinearScale,
};

/** A decorative symbol for the individual reference topic. */
export function getReferenceIcon(id: string, group: Reference['group']) {
  return referenceIcons[id] ?? foundationIcons[id] ?? getComponentIcon(group);
}
