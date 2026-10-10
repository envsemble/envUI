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

export default function App() {
  // Keep the full fixture available for integration checks; focused tests mount
  // only their own controls, so unrelated editors and portals do no work.
  const fixture = new URLSearchParams(location.search).get('fixture');
  const includes = (name: string) => fixture === null || fixture === name;
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
        </main>
      </Theme>
    </>
  );
}
