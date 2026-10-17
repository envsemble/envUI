import { SplitPane } from '@envsemble/envui';
import { DocumentList, DocumentPreview } from './documents';

// 1.0 code with spread props stays as it is, unreported: its panes are its children.
export const Documents = (props: Omit<SplitPane.RootProps, 'children'>) => (
  <SplitPane.Root {...props}>
    <SplitPane.Pane>
      <DocumentList />
    </SplitPane.Pane>
    <SplitPane.ResizeHandle />
    <SplitPane.Pane>
      <DocumentPreview />
    </SplitPane.Pane>
  </SplitPane.Root>
);
