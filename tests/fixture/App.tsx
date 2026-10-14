import type { ReactNode } from 'react';
import { Theme, ToastProvider } from '@envsemble/envui';
import '@envsemble/envui/styles.css';
import './Fixture.css';
import { FormsFixture } from './Forms.js';
import { DialogFixture } from './Dialog.js';
import { ToastTriggers, ManualToastFixture, StrictToastFixture } from './Toasts.js';
import { ColorControls } from './Colors.js';
import { NavigationFixture } from './Navigation.js';
import { ButtonGroupsFixture } from './ButtonGroups.js';
import { LayoutFixture } from './Layout.js';
import { FeatureCardsFixture } from './FeatureCards.js';
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
import { DocumentTabsFixture, FillTabsFixture, TabStatesFixture } from './Tabs.js';
import { CommandPaletteFixture } from './Palette.js';
import { SegmentedControlFixture } from './Segments.js';
import { BadgesFixture } from './Badges.js';
import { DialogVariantsFixture, NoticesFixture, PopoverFixture } from './Overlays.js';
import { DataDisplayFixture } from './DataDisplay.js';
import { TablesFixture } from './Tables.js';
import { AffixesFixture } from './Affixes.js';
import { SlidersFixture } from './Sliders.js';
import { ComposerFixture } from './Composer.js';
import { MessagesFixture } from './Messages.js';
import { SplitViewFixture } from './SplitViews.js';
import { StatsFixture } from './Stats.js';
import { DropzonesFixture } from './Dropzones.js';
import { ButtonCountsFixture } from './ButtonCounts.js';
import { HeatmapFixture } from './Heatmaps.js';
import { AvatarGroupsFixture } from './AvatarGroups.js';
import { RelativeTimesFixture } from './RelativeTimes.js';
import { CopyButtonsFixture } from './CopyButtons.js';
import { PaginationsFixture } from './Paginations.js';

/** Fixtures that fill the viewport are only mounted on their own. */
const standaloneFixtures: Record<string, () => ReactNode> = {
  shell: ShellFixture,
  'two-shells': TwoShellsFixture,
  'resizable-shell': ResizableShellFixture,
  'full-shell': FullShellFixture,
  'full-shell-skeleton': FullShellSkeletonFixture,
  'title-bar': TitleBarFixture,
  'scroll-keys': ScrollKeysFixture,
  'framed-shell': FramedShellFixture,
};

export default function App() {
  // Keep the full fixture available for integration checks; focused tests mount
  // only their own controls, so unrelated editors and portals do no work.
  const fixture = new URLSearchParams(location.search).get('fixture');
  const includes = (name: string) => fixture === null || fixture === name;
  // Root theming changes the host document, so adoption mounts on its own, at the top of the page
  // like an application's provider.
  if (fixture === 'adoption') return <AdoptionFixture />;
  const Standalone = fixture === null ? undefined : standaloneFixtures[fixture];
  if (Standalone)
    return (
      <Theme theme="light">
        <Standalone />
      </Theme>
    );
  return (
    <>
      <p data-testid="host-marker">Host document marker</p>
      <Theme theme="light">
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
              <ManualToastFixture />
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
          {includes('feature-cards') && <FeatureCardsFixture />}
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
          {includes('notices') && (
            <>
              <NoticesFixture theme="light" />
              <NoticesFixture theme="dark" />
            </>
          )}
          {includes('dialog-variants') && <DialogVariantsFixture />}
          {includes('popover') && (
            <>
              <PopoverFixture theme="light" />
              <PopoverFixture theme="dark" />
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
          {includes('split-view') && (
            <>
              <SplitViewFixture theme="light" />
              <SplitViewFixture theme="dark" />
            </>
          )}
          {includes('stats') && (
            <>
              <StatsFixture theme="light" />
              <StatsFixture theme="dark" />
            </>
          )}
          {includes('dropzones') && (
            <>
              <DropzonesFixture theme="light" />
              <DropzonesFixture theme="dark" />
            </>
          )}
          {includes('heatmap') && (
            <>
              <HeatmapFixture theme="light" />
              <HeatmapFixture theme="dark" />
            </>
          )}
          {includes('button-counts') && (
            <>
              <ButtonCountsFixture theme="light" />
              <ButtonCountsFixture theme="dark" />
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
