import { ButtonsPreview } from './Actions';
import {
  TextFieldsPreview,
  CheckboxPreview,
  SwitchPreview,
  RadioPreview,
  SelectPreview,
} from './Forms';
import { NavigationPreview, TabsPreview, DirectionLinksPreview } from './Navigation';
import { SurfacePreview, LayoutPreview, RowsPreview, CardsPreview } from './Layout';
import { ChipsPreview, DisclosuresPreview } from './Content';
import { CodePreview } from './CodeContent';
import { MarkdownPreview } from './MarkdownContent';
import { RichTextPreview } from './RichTextContent';
import { EmptyStatePreview, LoadingPreview, DialogsPreview } from './Feedback';
import { ToastsPreview } from './Toasts';
import { ColorPickerPreview } from './ColorPicking';

/** Select a topic; each preview retains its state across theme changes. */
export function ComponentPreview({ id }: { id: string }) {
  switch (id) {
    case 'buttons':
      return <ButtonsPreview />;
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
    case 'code':
      return <CodePreview />;
    case 'markdown':
      return <MarkdownPreview />;
    case 'rich-text':
      return <RichTextPreview />;
    case 'disclosures':
      return <DisclosuresPreview />;
    case 'empty-state':
      return <EmptyStatePreview />;
    case 'loading':
      return <LoadingPreview />;
    case 'toasts':
      return <ToastsPreview />;
    case 'dialogs':
      return <DialogsPreview />;
    default:
      return null;
  }
}
