import type { ReactNode } from 'react';
import { Theme, Toast } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { FormsFixture } from './Forms.js';
import { DialogFixture } from './Dialog.js';
import { ToastTriggers, StrictToastFixture } from './Toasts.js';
import { ColorControls } from './Colors.js';
import { NavigationFixture } from './Navigation.js';
import { ButtonGroupsFixture } from './ButtonGroups.js';
import { LayoutFixture } from './Layout.js';
import { CardsFixture } from './Cards.js';
import { ColorPickerFixture } from './ColorPicker.js';
import { MarkdownEditingFixture, MarkdownExtensionsFixture } from './MarkdownEditing.js';
import { AdoptionFixture, ShellFixture, TwoShellsFixture } from './Adoption.js';
import { ResizableShellFixture } from './ResizableShell.js';
import {
  FramedShellFixture,
  FullShellFixture,
  FullShellSkeletonFixture,
  ScrollKeysFixture,
  TitleBarFixture,
} from './WindowShell.js';
import { MenusFixture } from './Menus.js';
import { MenubarFixture } from './Menubars.js';
import { TreeFixture } from './TreeView.js';
import {
  CompactTabsFixture,
  DocumentTabsFixture,
  FillTabsFixture,
  RtlDocumentTabsFixture,
  RtlTabsFixture,
  TabStatesFixture,
} from './Tabs.js';
import { CommandPaletteFixture } from './Palette.js';
import { SegmentedControlFixture } from './Segments.js';
import { BadgesFixture } from './Badges.js';
import {
  DialogVariantsFixture,
  HoverCardFixture,
  AlertsFixture,
  PopoverFixture,
} from './Overlays.js';
import { DataDisplayFixture } from './DataDisplay.js';
import { TablesFixture } from './Tables.js';
import { PagersFixture } from './Pagers.js';
import { AffixesFixture } from './Affixes.js';
import { SlidersFixture } from './Sliders.js';
import { ComposerFixture } from './Composer.js';
import { MessagesFixture } from './Messages.js';
import { StatsFixture } from './Stats.js';
import { DropZonesFixture } from './DropZones.js';
import { ButtonCountsFixture } from './ButtonCounts.js';
import { CalendarHeatmapFixture } from './CalendarHeatmaps.js';
import { ComboboxFixture } from './Comboboxes.js';
import { PanelDockFixture } from './PanelDocks.js';
import { AvatarGroupsFixture } from './AvatarGroups.js';
import { RelativeTimesFixture } from './RelativeTimes.js';
import { CopyButtonsFixture } from './CopyButtons.js';
import { PaginationsFixture } from './Paginations.js';
import { DatePickerFixture } from './DatePickers.js';
import { QuietButtonsFixture } from './QuietButtons.js';
import { EmptyStatesFixture } from './EmptyStates.js';
import { DrawersFixture } from './Drawers.js';
import { TooltipsFixture } from './Tooltips.js';
import { MetersFixture } from './Meters.js';
import { RatingsFixture } from './Ratings.js';
import { DisclosuresFixture } from './Disclosures.js';
import { DensityFixture } from './Density.js';
import { StackingFixture } from './Stacking.js';
import { ResponsiveHooksFixture } from './ResponsiveHooks.js';
import { PrimitivesFixture } from './Primitives.js';
import { MessageStringsFixture } from './MessageStrings.js';
import { DirectionFixture } from './Direction.js';
import {
  ThemeContrastFixture,
  ThemeContrastNestedFixture,
  ThemeReleaseFixture,
  ThemeContrastProviderFixture,
  ThemeContrastRemountFixture,
} from './ThemeContrasts.js';

/** Fixtures that fill the viewport, or need it to themselves, are only mounted on their own. */
const standaloneFixtures: Record<string, () => ReactNode> = {
  shell: ShellFixture,
  'two-shells': TwoShellsFixture,
  'resizable-shell': ResizableShellFixture,
  'full-shell': FullShellFixture,
  'full-shell-skeleton': FullShellSkeletonFixture,
  'title-bar': TitleBarFixture,
  'scroll-keys': ScrollKeysFixture,
  'framed-shell': FramedShellFixture,
  density: DensityFixture,
  stacking: StackingFixture,
  'responsive-hooks': ResponsiveHooksFixture,
  primitives: PrimitivesFixture,
  'message-strings': MessageStringsFixture,
  direction: DirectionFixture,
  'rtl-tabs': RtlTabsFixture,
  'rtl-document-tabs': RtlDocumentTabsFixture,
  pagers: PagersFixture,
  drawers: DrawersFixture,
  tooltips: TooltipsFixture,
  meters: MetersFixture,
};

export default function App() {
  // Keep the full fixture available for integration checks; focused tests mount
  // only their own controls, so unrelated editors and portals do no work.
  const fixture = new URLSearchParams(location.search).get('fixture');
  const includes = (name: string) => fixture === null || fixture === name;
  // Root theming changes the host document, so adoption mounts on its own, at the top of the page
  // like an application's provider.
  if (fixture === 'adoption') return <AdoptionFixture />;
  // The contrast boundaries test the default outside any Theme, and the provider themes the root.
  if (fixture === 'theme-contrast') return <ThemeContrastFixture />;
  if (fixture === 'theme-contrast-provider') return <ThemeContrastProviderFixture />;
  if (fixture === 'theme-contrast-remount') return <ThemeContrastRemountFixture />;
  if (fixture === 'theme-contrast-nested') return <ThemeContrastNestedFixture />;
  if (fixture === 'theme-release') return <ThemeReleaseFixture />;
  const Standalone = fixture === null ? undefined : standaloneFixtures[fixture];
  // ?scale=compact puts the fixture in the compact scale, unless its own Themes set a scale.
  const scale =
    new URLSearchParams(location.search).get('scale') === 'compact' ? 'compact' : undefined;
  if (Standalone)
    return (
      <Theme theme="light" scale={scale}>
        <Standalone />
      </Theme>
    );
  return (
    <>
      <p data-testid="host-marker">Host document marker</p>
      <Theme theme="light" scale={scale}>
        <main className="fixture-main">
          {includes('forms') && (
            <>
              <FormsFixture />
              <DialogFixture />
            </>
          )}
          {includes('toast') && (
            <>
              <Toast.Provider>
                <ToastTriggers />
              </Toast.Provider>
              <StrictToastFixture />
            </>
          )}
          {includes('colors') && (
            <>
              <ColorControls theme="light" />
              <ColorControls theme="dark" />
            </>
          )}
          {includes('navigation') && (
            <>
              <NavigationFixture theme="light" />
              <NavigationFixture theme="dark" />
            </>
          )}
          {includes('button-groups') && (
            <>
              <ButtonGroupsFixture theme="light" />
              <ButtonGroupsFixture theme="dark" />
            </>
          )}
          {includes('layout') && <LayoutFixture />}
          {includes('cards') && <CardsFixture />}
          {includes('disclosures') && <DisclosuresFixture />}
          {includes('color-picker') && (
            <>
              <ColorPickerFixture theme="light" />
              <ColorPickerFixture theme="dark" />
            </>
          )}
          {includes('markdown') && <MarkdownEditingFixture />}
          {includes('markdown-extensions') && <MarkdownExtensionsFixture />}
          {includes('tree') && (
            <>
              <TreeFixture theme="light" />
              <TreeFixture theme="dark" />
            </>
          )}
          {includes('document-tabs') && (
            <>
              <DocumentTabsFixture theme="light" />
              <DocumentTabsFixture theme="dark" />
            </>
          )}
          {includes('tab-states') && (
            <>
              <TabStatesFixture theme="light" />
              <TabStatesFixture theme="dark" />
            </>
          )}
          {includes('fill-tabs') && (
            <>
              <FillTabsFixture theme="light" />
              <FillTabsFixture theme="dark" />
            </>
          )}
          {includes('palette') && (
            <>
              <CommandPaletteFixture theme="light" />
              <CommandPaletteFixture theme="dark" />
            </>
          )}
          {includes('segments') && (
            <>
              <SegmentedControlFixture theme="light" />
              <SegmentedControlFixture theme="dark" />
            </>
          )}
          {includes('badges') && (
            <>
              <BadgesFixture theme="light" />
              <BadgesFixture theme="dark" />
            </>
          )}
          {includes('alerts') && (
            <>
              <AlertsFixture theme="light" />
              <AlertsFixture theme="dark" />
            </>
          )}
          {includes('dialog-variants') && <DialogVariantsFixture />}
          {includes('popover') && (
            <>
              <PopoverFixture theme="light" />
              <PopoverFixture theme="dark" />
            </>
          )}
          {includes('hover-card') && (
            <>
              <HoverCardFixture theme="light" />
              <HoverCardFixture theme="dark" />
            </>
          )}
          {includes('data-display') && (
            <>
              <DataDisplayFixture theme="light" />
              <DataDisplayFixture theme="dark" />
            </>
          )}
          {includes('tables') && (
            <>
              <TablesFixture theme="light" />
              <TablesFixture theme="dark" />
            </>
          )}
          {includes('affixes') && (
            <>
              <AffixesFixture theme="light" />
              <AffixesFixture theme="dark" />
            </>
          )}
          {includes('sliders') && (
            <>
              <SlidersFixture theme="light" />
              <SlidersFixture theme="dark" />
            </>
          )}
          {includes('composer') && (
            <>
              <ComposerFixture theme="light" />
              <ComposerFixture theme="dark" />
            </>
          )}
          {includes('messages') && (
            <>
              <MessagesFixture theme="light" />
              <MessagesFixture theme="dark" />
            </>
          )}
          {includes('stats') && (
            <>
              <StatsFixture theme="light" />
              <StatsFixture theme="dark" />
            </>
          )}
          {includes('drop-zones') && (
            <>
              <DropZonesFixture theme="light" />
              <DropZonesFixture theme="dark" />
            </>
          )}
          {includes('calendar-heatmap') && (
            <>
              <CalendarHeatmapFixture theme="light" />
              <CalendarHeatmapFixture theme="dark" />
            </>
          )}
          {includes('panel-dock') && (
            <>
              <PanelDockFixture theme="light" />
              <PanelDockFixture theme="dark" />
            </>
          )}
          {includes('button-counts') && (
            <>
              <ButtonCountsFixture theme="light" />
              <ButtonCountsFixture theme="dark" />
            </>
          )}
          {includes('combobox') && (
            <>
              <ComboboxFixture theme="light" />
              <ComboboxFixture theme="dark" />
            </>
          )}
          {includes('avatar-groups') && (
            <>
              <AvatarGroupsFixture theme="light" />
              <AvatarGroupsFixture theme="dark" />
            </>
          )}
          {includes('relative-times') && (
            <>
              <RelativeTimesFixture theme="light" />
              <RelativeTimesFixture theme="dark" />
            </>
          )}
          {includes('copy-buttons') && (
            <>
              <CopyButtonsFixture theme="light" />
              <CopyButtonsFixture theme="dark" />
            </>
          )}
          {includes('paginations') && (
            <>
              <PaginationsFixture theme="light" />
              <PaginationsFixture theme="dark" />
            </>
          )}
          {includes('date-picker') && (
            <>
              <DatePickerFixture theme="light" />
              <DatePickerFixture theme="dark" />
            </>
          )}
          {includes('quiet-buttons') && (
            <>
              <QuietButtonsFixture theme="light" />
              <QuietButtonsFixture theme="dark" />
            </>
          )}
          {includes('compact-tabs') && (
            <>
              <CompactTabsFixture theme="light" />
              <CompactTabsFixture theme="dark" />
            </>
          )}
          {includes('ratings') && (
            <>
              <RatingsFixture theme="light" />
              <RatingsFixture theme="dark" />
            </>
          )}
          {includes('empty-states') && (
            <>
              <EmptyStatesFixture theme="light" />
              <EmptyStatesFixture theme="dark" />
            </>
          )}
          {includes('menus') && (
            <>
              <MenusFixture theme="light" />
              <MenusFixture theme="dark" />
            </>
          )}
          {/* Access keys listen to the whole window, so the menubar mounts only on its own. */}
          {fixture === 'menubar' && <MenubarFixture />}
        </main>
      </Theme>
    </>
  );
}
