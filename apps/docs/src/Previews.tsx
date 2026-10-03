import { ButtonsPreview } from './previews/Actions';
import {
  TextFieldsPreview,
  CheckboxPreview,
  SwitchPreview,
  RadioPreview,
  SelectPreview,
} from './previews/Forms';
import { NavigationPreview, TabsPreview, DirectionLinksPreview } from './previews/Navigation';
import { SurfacePreview, LayoutPreview, RowsPreview, CardsPreview } from './previews/Layout';
import { ChipsPreview, DisclosuresPreview } from './previews/Content';
import { CodePreview } from './previews/CodeContent';
import { MarkdownPreview } from './previews/MarkdownContent';
import {
  EmptyStatePreview,
  LoadingPreview,
  ToastsPreview,
  DialogsPreview,
} from './previews/Feedback';

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
