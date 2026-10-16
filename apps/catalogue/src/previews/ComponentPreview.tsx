import {
  SwitchPreview,
  RadioPreview,
  SelectPreview,
  SliderPreview,
  DropZonePreview,
} from './Forms';
import { NavListPreview, TabsPreview, PagerPreview, PaginationPreview } from './Navigation';
import { ComboboxPreview, DatePickerPreview } from './Pickers';
import { SurfacePreview, LayoutPreview } from './Layout';
import { ChipsPreview, RatingPreview, RelativeTimePreview } from './Content';
import { CodePreview } from './CodeContent';
import { MarkdownPreview } from './MarkdownContent';
import { lazy, Suspense } from 'react';
import { Text } from '@envsemble/envui';
import { SpinnerPreview, SkeletonPreview } from './Feedback';
import { ToastsPreview } from './Toasts';
import { ColorPickerPreview } from './ColorPicking';
import { ComposerPreview, MessagesPreview } from './Conversation';
import { CalendarHeatmapPreview, StatsPreview } from './Dashboard';
import {
  MenubarPreview,
  TooltipPreview,
  AvatarPreview,
  MeterPreview,
  ProgressPreview,
} from './Overlays';
import { AppShellPreview } from './Shell';
import { CommandPalettePreview, DocumentTabsPreview, TreePreview } from './Workspace';
import { PanelDockPreview } from './Dock';
import { HoverCardPreview, PopoverPreview, SegmentedControlPreview } from './Elements';

const RichTextPreview = lazy(() =>
  import('./RichTextContent').then(({ RichTextPreview }) => ({ default: RichTextPreview })),
);

/** Select a topic; each preview retains its state across theme changes. */
export function ComponentPreview({ id }: { id: string }) {
  switch (id) {
    case 'segmented-control':
      return <SegmentedControlPreview />;
    case 'switch':
      return <SwitchPreview />;
    case 'radio':
      return <RadioPreview />;
    case 'select':
      return <SelectPreview />;
    case 'combobox':
      return <ComboboxPreview />;
    case 'date-picker':
      return <DatePickerPreview />;
    case 'slider':
      return <SliderPreview />;
    case 'drop-zone':
      return <DropZonePreview />;
    case 'color-picker':
      return <ColorPickerPreview />;
    case 'composer':
      return <ComposerPreview />;
    case 'nav-list':
      return <NavListPreview />;
    case 'tabs':
      return <TabsPreview />;
    case 'pager':
      return <PagerPreview />;
    case 'surface':
      return <SurfacePreview />;
    case 'stack':
      return <LayoutPreview />;
    case 'chips':
      return <ChipsPreview />;
    case 'pagination':
      return <PaginationPreview />;
    case 'rating':
      return <RatingPreview />;
    case 'relative-time':
      return <RelativeTimePreview />;
    case 'message':
      return <MessagesPreview />;
    case 'stat':
      return <StatsPreview />;
    case 'calendar-heatmap':
      return <CalendarHeatmapPreview />;
    case 'code':
      return <CodePreview />;
    case 'markdown':
      return <MarkdownPreview />;
    case 'rich-text':
      return (
        <Suspense fallback={<Text role="status">Loading rich text…</Text>}>
          <RichTextPreview />
        </Suspense>
      );
    case 'spinner':
      return <SpinnerPreview />;
    case 'skeleton':
      return <SkeletonPreview />;
    case 'toast':
      return <ToastsPreview />;
    case 'popover':
      return <PopoverPreview />;
    case 'hover-card':
      return <HoverCardPreview />;
    case 'menubar':
      return <MenubarPreview />;
    case 'tooltip':
      return <TooltipPreview />;
    case 'avatar':
      return <AvatarPreview />;
    case 'meter':
      return <MeterPreview />;
    case 'progress':
      return <ProgressPreview />;
    case 'app-shell':
      return <AppShellPreview />;
    case 'tree':
      return <TreePreview />;
    case 'document-tabs':
      return <DocumentTabsPreview />;
    case 'panel-dock':
      return <PanelDockPreview />;
    case 'command-palette':
      return <CommandPalettePreview />;
    default:
      return null;
  }
}
