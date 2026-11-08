import type { ReactNode } from 'react';
import { Theme, ToastProvider } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { FormsFixture } from './Forms.fixture.js';
import { DialogFixture, DialogVariantsFixture } from './Dialog.fixture.js';
import { ToastTriggers, StrictToastFixture } from './Toast.fixture.js';
import { ColorControls, ColorOverrides } from './Colors.fixture.js';
import { DefaultColors } from './DefaultColors.fixture.js';
import { NavigationFixture } from './Navigation.fixture.js';
import { ButtonGroupsFixture } from './ButtonGroup.fixture.js';
import { LayoutFixture } from './Layout.fixture.js';
import { CardsFixture } from './Card.fixture.js';
import { ColorPickerFixture } from './ColorPicker.fixture.js';
import { MarkdownEditingFixture, MarkdownExtensionsFixture } from './MarkdownEditor.fixture.js';
import { AdoptionFixture } from './Adoption.fixture.js';
import { AppScreenFixture } from './AppScreen.fixture.js';
import { ScaffoldFixture, ScrollKeysFixture } from './Scaffold.fixture.js';
import { ScaffoldPanesFixture } from './ScaffoldPanes.fixture.js';
import { PanesFixture } from './Panes.fixture.js';
import { CodeBlockFixture } from './CodeBlock.fixture.js';
import { CodeDiffFixture } from './CodeDiff.fixture.js';
import { FieldsFixture } from './Field.fixture.js';
import { MarkdownFixture } from './Markdown.fixture.js';
import { MenusFixture } from './Menu.fixture.js';
import { MenubarFixture } from './Menubar.fixture.js';
import { TreeFixture } from './Tree.fixture.js';
import {
  CompactTabsFixture,
  FillTabsFixture,
  RtlTabsFixture,
  ScrollingTabsFixture,
  TabStatesFixture,
} from './Tabs.fixture.js';
import {
  DocumentTabsFixture,
  DocumentTabsRerenderFixture,
  RtlDocumentTabsFixture,
} from './DocumentTabs.fixture.js';
import { CommandPaletteEmptyFixture, CommandPaletteFixture } from './CommandPalette.fixture.js';
import { SegmentedControlFixture } from './SegmentedControl.fixture.js';
import { BadgesFixture } from './Badge.fixture.js';
import { GraphicsFixture } from './Graphic.fixture.js';
import { HoverCardFixture } from './HoverCard.fixture.js';
import { AlertsFixture } from './Alert.fixture.js';
import { PopoverFixture } from './Popover.fixture.js';
import { DataDisplayFixture } from './DataDisplay.fixture.js';
import { TablesFixture } from './Table.fixture.js';
import { PagersFixture } from './Pager.fixture.js';
import { TableOfContentsFixture } from './TableOfContents.fixture.js';
import { AffixesFixture } from './Affixes.fixture.js';
import { SlidersFixture } from './Slider.fixture.js';
import { ComposerFixture } from './Composer.fixture.js';
import { MessagesFixture } from './Message.fixture.js';
import { DropZonesFixture } from './DropZone.fixture.js';
import { ButtonCountsFixture } from './ButtonCounts.fixture.js';
import { CalendarHeatmapFixture } from './CalendarHeatmap.fixture.js';
import { ComboboxFixture } from './Combobox.fixture.js';
import { PanelDockFixture } from './PanelDock.fixture.js';
import { AvatarGroupsFixture } from './AvatarGroup.fixture.js';
import { RelativeTimesFixture } from './RelativeTime.fixture.js';
import { CopyButtonsFixture } from './CopyButton.fixture.js';
import { PaginationsFixture } from './Pagination.fixture.js';
import { DatePickerFixture } from './DatePicker.fixture.js';
import { TimePickersFixture } from './TimePicker.fixture.js';
import { MonthPickersFixture } from './MonthPicker.fixture.js';
import { PickerPopupsFixture } from './PickerPopup.fixture.js';
import { QuietButtonsFixture } from './IconButton.fixture.js';
import { SheetsFixture } from './Sheet.fixture.js';
import { NestedDrawersFixture, ResizableDrawersFixture } from './NavigationDrawer.fixture.js';
import { TooltipsFixture } from './Tooltip.fixture.js';
import { MetersFixture } from './Meter.fixture.js';
import { LineArtsFixture } from './LineArt.fixture.js';
import { RatingsFixture } from './Rating.fixture.js';
import { DisclosuresFixture } from './Disclosure.fixture.js';
import { AccordionsFixture } from './Accordion.fixture.js';
import { DensityFixture } from './Scale.fixture.js';
import { ChoiceControlsFixture } from './ChoiceControls.fixture.js';
import { StackingFixture } from './Stacking.fixture.js';
import { PrimitivesFixture } from './Primitives.fixture.js';
import { MessageStringsFixture } from './Messages.fixture.js';
import { DirectionFixture } from './Direction.fixture.js';
import { PageHeadersFixture } from './PageHeader.fixture.js';
import { DescriptionListsFixture } from './DescriptionList.fixture.js';
import { ContainerSizeFixture } from './ContainerSize.fixture.js';
import { ConfirmDialogsFixture } from './ConfirmDialog.fixture.js';
import { PortalContainersFixture } from './PortalContainer.fixture.js';
import { ListsFixture } from './List.fixture.js';
import { DevModeFixture } from './DevMode.fixture.js';
import { SkeletonsFixture } from './Skeleton.fixture.js';
import { LayoutCheckFixture } from './LayoutCheck.fixture.js';
import { ContactSheetFixture } from './ContactSheet.fixture.js';
import {
  ThemeContrastFixture,
  ThemeContrastNestedFixture,
  ThemeReleaseFixture,
  ThemeContrastProviderFixture,
  ThemeContrastRemountFixture,
} from './ThemeContrast.fixture.js';

/** Fixtures that fill the viewport, or need it to themselves, are only mounted on their own. */
const standaloneFixtures: Record<string, () => ReactNode> = {
  'code-block': CodeBlockFixture,
  'code-diff': CodeDiffFixture,
  fields: FieldsFixture,
  'markdown-tables': MarkdownFixture,
  scaffold: ScaffoldFixture,
  'scroll-keys': ScrollKeysFixture,
  'scaffold-panes': ScaffoldPanesFixture,
  panes: PanesFixture,
  density: DensityFixture,
  'choice-controls': ChoiceControlsFixture,
  stacking: StackingFixture,
  'portal-containers': PortalContainersFixture,
  primitives: PrimitivesFixture,
  'message-strings': MessageStringsFixture,
  direction: DirectionFixture,
  'rtl-tabs': RtlTabsFixture,
  'scrolling-tabs': ScrollingTabsFixture,
  'rtl-document-tabs': RtlDocumentTabsFixture,
  'document-tabs-rerender': DocumentTabsRerenderFixture,
  pagers: PagersFixture,
  'table-of-contents': TableOfContentsFixture,
  sheets: SheetsFixture,
  'resizable-drawers': ResizableDrawersFixture,
  'nested-drawers': NestedDrawersFixture,
  tooltips: TooltipsFixture,
  meters: MetersFixture,
  'line-arts': LineArtsFixture,
  'page-headers': PageHeadersFixture,
  'description-lists': DescriptionListsFixture,
  'container-size': ContainerSizeFixture,
  'confirm-dialogs': ConfirmDialogsFixture,
  lists: ListsFixture,
  'time-pickers': TimePickersFixture,
  'month-pickers': MonthPickersFixture,
  'picker-popups': PickerPopupsFixture,
  'dev-mode': DevModeFixture,
  'layout-check': LayoutCheckFixture,
  skeletons: SkeletonsFixture,
  accordions: AccordionsFixture,
  'contact-sheet': ContactSheetFixture,
};

export default function App() {
  // Keep the full fixture available for integration checks; focused tests mount
  // only their own controls, so unrelated editors and portals do no work.
  const fixture = new URLSearchParams(location.search).get('fixture');
  const includes = (name: string) => fixture === null || fixture === name;
  // Root theming changes the host document, so adoption mounts on its own, at the top of the page
  // like an application's provider.
  if (fixture === 'adoption') return <AdoptionFixture />;
  // Product screens for review theme the document root through their own provider, as an
  // application does.
  if (fixture === 'app-screen') return <AppScreenFixture />;
  // The contrast boundaries test the default outside any Theme, and the provider themes the root.
  if (fixture === 'theme-contrast') return <ThemeContrastFixture />;
  if (fixture === 'theme-contrast-provider') return <ThemeContrastProviderFixture />;
  if (fixture === 'theme-contrast-remount') return <ThemeContrastRemountFixture />;
  if (fixture === 'theme-contrast-nested') return <ThemeContrastNestedFixture />;
  if (fixture === 'theme-release') return <ThemeReleaseFixture />;
  const Standalone = fixture === null ? undefined : standaloneFixtures[fixture];
  // The fixture is comfortable whatever the pointer, so a spec measures the same sizes in every
  // browser; ?scale=compact or ?scale=system puts it in that scale, unless its own Themes set one.
  const requestedScale = new URLSearchParams(location.search).get('scale');
  const scale =
    requestedScale === 'compact' || requestedScale === 'system' ? requestedScale : 'comfortable';
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
              <ToastProvider>
                <ToastTriggers />
              </ToastProvider>
              <StrictToastFixture />
            </>
          )}
          {includes('colors') && (
            <>
              <ColorControls theme="light" />
              <ColorControls theme="dark" />
              <ColorOverrides />
            </>
          )}
          {/* Open popups: only on its own page, so they cover nothing else. */}
          {fixture === 'default-colors' && <DefaultColors />}
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
          {includes('color-picker') && <ColorPickerFixture />}
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
              <CommandPaletteEmptyFixture />
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
          {includes('graphics') && <GraphicsFixture />}
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
