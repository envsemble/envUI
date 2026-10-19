import { SplitPane } from '@envsemble/envui';
import { DocumentList, DocumentPreview } from './documents';

// After v1-names, a SplitView is a SplitPane.Root that still takes start and end.
export const Documents = () => (
  <SplitPane.Root start={<DocumentList />} end={<DocumentPreview />} resizeLabel="Resize list" />
);

// 1.0 code stays as it is.
export const Migrated = () => (
  <SplitPane.Root>
    <SplitPane.Pane>
      <DocumentList />
    </SplitPane.Pane>
    <SplitPane.ResizeHandle />
    <SplitPane.Pane>
      <DocumentPreview />
    </SplitPane.Pane>
  </SplitPane.Root>
);
