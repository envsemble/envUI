import { CheckboxPreview, DropZonePreview } from './Forms';
import { ComboboxPreview, DatePickerPreview } from './Pickers';
import { SurfacePreview, LayoutPreview, ListPreview, CardsPreview } from './Layout';
import {
  AnimatedNumberPreview,
  ChipsPreview,
  DisclosurePreview,
  RatingPreview,
  RelativeTimePreview,
} from './Content';
import { CodePreview } from './CodeContent';
import { MarkdownPreview } from './MarkdownContent';
import { lazy, Suspense } from 'react';
import { Text } from '@envsemble/envui';
import { EmptyStatePreview, SpinnerPreview, SkeletonPreview } from './Feedback';
import { ColorPickerPreview } from './ColorPicking';
import { ComposerPreview, MessagesPreview } from './Conversation';
import { CalendarHeatmapPreview, StatsPreview } from './Dashboard';
import { MenubarPreview, AvatarPreview } from './Overlays';
import { AppShellPreview } from './Shell';
import { CommandPalettePreview, DocumentTabsPreview } from './Workspace';
import { PanelDockPreview } from './Dock';
import {
  BadgesPreview,
  BreadcrumbsPreview,
  HoverCardPreview,
  KbdPreview,
  AlertsPreview,
  PopoverPreview,
  SegmentedControlPreview,
} from './Elements';

const RichTextPreview = lazy(() =>
  import('./RichTextContent').then(({ RichTextPreview }) => ({ default: RichTextPreview })),
);

/** Select a topic; each preview retains its state across theme changes. */
export function ComponentPreview({ id }: { id: string }) {
  switch (id) {
    case 'segmented-control':
      return <SegmentedControlPreview />;
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
    case 'surface':
      return <SurfacePreview />;
    case 'stack':
      return <LayoutPreview />;
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
    case 'disclosure':
      return <DisclosurePreview />;
    case 'empty-state':
      return <EmptyStatePreview />;
    case 'spinner':
      return <SpinnerPreview />;
    case 'skeleton':
      return <SkeletonPreview />;
    case 'alert':
      return <AlertsPreview />;
    case 'popover':
      return <PopoverPreview />;
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
    case 'panel-dock':
      return <PanelDockPreview />;
    case 'command-palette':
      return <CommandPalettePreview />;
    default:
      return null;
  }
}
