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
import { MarkdownEditingFixture } from './MarkdownEditing.js';
import { AdoptionFixture, ShellFixture } from './Adoption.js';
import { ResizableShellFixture } from './ResizableShell.js';
import { MenusFixture } from './Menus.js';
import { TreeFixture } from './TreeView.js';
import { DocumentTabsFixture } from './Tabs.js';
import { CommandPaletteFixture } from './Palette.js';

/** Fixtures that fill the viewport are only mounted on their own. */
const standaloneFixtures: Record<string, () => ReactNode> = {
  shell: ShellFixture,
  'resizable-shell': ResizableShellFixture,
};

export default function App() {
  // Keep the full fixture available for integration checks; focused tests mount
  // only their own controls, so unrelated editors and portals do no work.
  const fixture = new URLSearchParams(location.search).get('fixture');
  const includes = (name: string) => fixture === null || fixture === name;
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
          {includes('palette') && (
            <>
              <CommandPaletteFixture theme="light" />
              <CommandPaletteFixture theme="dark" />
            </>
          )}
          {includes('menus') && (
            <>
              <MenusFixture theme="light" />
              <MenusFixture theme="dark" />
            </>
          )}
          {/* Root theming would change the host document, so adoption mounts only on its own. */}
          {fixture === 'adoption' && <AdoptionFixture />}
        </main>
      </Theme>
    </>
  );
}
