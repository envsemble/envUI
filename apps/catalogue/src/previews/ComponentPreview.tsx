import { ButtonsPreview } from './Actions';
import {
  TextFieldsPreview,
  CheckboxPreview,
  SwitchPreview,
  RadioPreview,
  SelectPreview,
  SliderPreview,
} from './Forms';
import { NavigationPreview, TabsPreview, DirectionLinksPreview } from './Navigation';
import { SurfacePreview, LayoutPreview, RowsPreview, CardsPreview } from './Layout';
import { AnimatedNumberPreview, ChipsPreview, DisclosuresPreview } from './Content';
import { CodePreview } from './CodeContent';
import { MarkdownPreview } from './MarkdownContent';
import { lazy, Suspense } from 'react';
import { Text } from '@envsemble/envui';
import { EmptyStatePreview, LoadingPreview, DialogsPreview } from './Feedback';
import { ToastsPreview } from './Toasts';
import { ColorPickerPreview } from './ColorPicking';
import {
  MenuPreview,
  MenubarPreview,
  TooltipPreview,
  AvatarPreview,
  MetersPreview,
} from './Overlays';
import { AppShellPreview } from './Shell';
import { CommandPalettePreview, DocumentTabsPreview, TreePreview } from './Workspace';
import {
  BadgesPreview,
  BreadcrumbsPreview,
  KbdPreview,
  NoticesPreview,
  PopoverPreview,
  SegmentedControlPreview,
  TablesPreview,
} from './Elements';

const RichTextPreview = lazy(() =>
  import('./RichTextContent').then(({ RichTextPreview }) => ({ default: RichTextPreview })),
);

/** Select a topic; each preview retains its state across theme changes. */
export function ComponentPreview({ id }: { id: string }) {
  switch (id) {
    case 'buttons':
      return <ButtonsPreview />;
    case 'segmented-control':
      return <SegmentedControlPreview />;
    case 'fields':
      return <TextFieldsPreview />;
    case 'checkbox':
      return <CheckboxPreview />;
    case 'switch':
      return <SwitchPreview />;
    case 'radio':
      return <RadioPreview />;
    case 'select':
      return <SelectPreview />;
    case 'slider':
      return <SliderPreview />;
    case 'color-picker':
      return <ColorPickerPreview />;
    case 'navigation':
      return <NavigationPreview />;
    case 'tabs':
      return <TabsPreview />;
    case 'direction-links':
      return <DirectionLinksPreview />;
    case 'surface':
      return <SurfacePreview />;
    case 'layout':
      return <LayoutPreview />;
    case 'rows':
      return <RowsPreview />;
    case 'cards':
      return <CardsPreview />;
    case 'chips':
      return <ChipsPreview />;
    case 'badges':
      return <BadgesPreview />;
    case 'tables':
      return <TablesPreview />;
    case 'keyboard':
      return <KbdPreview />;
    case 'breadcrumbs':
      return <BreadcrumbsPreview />;
    case 'animated-number':
      return <AnimatedNumberPreview />;
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
    case 'disclosures':
      return <DisclosuresPreview />;
    case 'empty-state':
      return <EmptyStatePreview />;
    case 'loading':
      return <LoadingPreview />;
    case 'toasts':
      return <ToastsPreview />;
    case 'notices':
      return <NoticesPreview />;
    case 'popover':
      return <PopoverPreview />;
    case 'dialogs':
      return <DialogsPreview />;
    case 'menu':
      return <MenuPreview />;
    case 'menubar':
      return <MenubarPreview />;
    case 'tooltip':
      return <TooltipPreview />;
    case 'avatar':
      return <AvatarPreview />;
    case 'meters':
      return <MetersPreview />;
    case 'app-shell':
      return <AppShellPreview />;
    case 'tree':
      return <TreePreview />;
    case 'document-tabs':
      return <DocumentTabsPreview />;
    case 'command-palette':
      return <CommandPalettePreview />;
    default:
      return null;
  }
}
