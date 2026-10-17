import { SplitView, Text, SplitPane } from '@envsemble/envui';
import { DocumentList, DocumentPreview } from './documents';

export function Documents({ label, rest }) {
  return (
    <>
      <SplitView start={<Text>Start</Text>} end={<DocumentPreview />} {...rest} />
      <SplitPane.Root
        persist="documents-split"
        defaultSize={35}
        stackBelow="48rem"
        style={{ blockSize: '100%' }}>
        <SplitPane.Pane><DocumentList /></SplitPane.Pane>
        <SplitPane.ResizeHandle label="Resize document list" />
        <SplitPane.Pane><DocumentPreview /></SplitPane.Pane>
      </SplitPane.Root>
      <SplitPane.Root>
        <SplitPane.Pane>Plain text</SplitPane.Pane>
        <SplitPane.ResizeHandle />
        <SplitPane.Pane>{label}</SplitPane.Pane>
      </SplitPane.Root>
    </>
  );
}
