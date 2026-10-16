import { CheckboxPreview, DropZonePreview } from './Forms';
import { ComboboxPreview, DatePickerPreview } from './Pickers';
import { ListPreview, CardsPreview } from './Layout';
import { AnimatedNumberPreview, ChipsPreview, DisclosurePreview } from './Content';
import { CodePreview } from './CodeContent';
import { MarkdownPreview } from './MarkdownContent';
import { EmptyStatePreview } from './Feedback';
import { ColorPickerPreview } from './ColorPicking';
import { ComposerPreview } from './Conversation';
import { CalendarHeatmapPreview } from './Dashboard';
import { MenubarPreview, AvatarPreview } from './Overlays';
import { AppShellPreview } from './Shell';
import { CommandPalettePreview, DocumentTabsPreview } from './Workspace';
import {
  BadgesPreview,
  BreadcrumbsPreview,
  HoverCardPreview,
  KbdPreview,
  AlertsPreview,
} from './Elements';

/** Select a topic; each preview retains its state across theme changes. */
export function ComponentPreview({ id }: { id: string }) {
  switch (id) {
    case 'checkbox':
      return <CheckboxPreview />;
    case 'combobox':
      return <ComboboxPreview />;
    case 'date-picker':
      return <DatePickerPreview />;
    case 'drop-zone':
      return <DropZonePreview />;
    case 'color-picker':
      return <ColorPickerPreview />;
    case 'composer':
      return <ComposerPreview />;
    case 'list':
      return <ListPreview />;
    case 'card':
      return <CardsPreview />;
    case 'chips':
      return <ChipsPreview />;
    case 'badge':
      return <BadgesPreview />;
    case 'kbd':
      return <KbdPreview />;
    case 'breadcrumbs':
      return <BreadcrumbsPreview />;
    case 'animated-number':
      return <AnimatedNumberPreview />;
    case 'calendar-heatmap':
      return <CalendarHeatmapPreview />;
    case 'code':
      return <CodePreview />;
    case 'markdown':
      return <MarkdownPreview />;
    case 'disclosure':
      return <DisclosurePreview />;
    case 'empty-state':
      return <EmptyStatePreview />;
    case 'alert':
      return <AlertsPreview />;
    case 'hover-card':
      return <HoverCardPreview />;
    case 'menubar':
      return <MenubarPreview />;
    case 'avatar':
      return <AvatarPreview />;
    case 'app-shell':
      return <AppShellPreview />;
    case 'document-tabs':
      return <DocumentTabsPreview />;
    case 'command-palette':
      return <CommandPalettePreview />;
    default:
      return null;
  }
}
