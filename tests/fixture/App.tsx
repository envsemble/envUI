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
import { RichTextEditingFixture } from './RichTextEditing.js';

export default function App() {
  return (
    <>
      <p data-testid="host-marker">Host document marker</p>
      <Theme theme="light">
        <main className="fixture-main">
          <FormsFixture />
          <DialogFixture />
          <ToastProvider>
            <ToastTriggers />
          </ToastProvider>
          <ManualToastFixture />
          <ColorControls theme="light" />
          <ColorControls theme="dark" />
          <NavigationFixture theme="light" />
          <NavigationFixture theme="dark" />
          <ButtonGroupsFixture theme="light" />
          <ButtonGroupsFixture theme="dark" />
          <LayoutFixture />
          <FeatureCardsFixture />
          <ColorPickerFixture theme="light" />
          <ColorPickerFixture theme="dark" />
          <StrictToastFixture />
          <MarkdownEditingFixture />
          <RichTextEditingFixture />
        </main>
      </Theme>
    </>
  );
}
