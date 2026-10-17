import { SplitView, Text } from '@envsemble/envui';
import { DocumentList, DocumentPreview } from './documents';

export function Documents({ label, rest }) {
  return (
    <>
      <SplitView start={<Text>Start</Text>} end={<DocumentPreview />} {...rest} />
      <SplitView
        storageKey="documents-split"
        defaultSize={35}
        stackBelow="48rem"
        resizeLabel="Resize document list"
        start={<DocumentList />}
        end={<DocumentPreview />}
        style={{ blockSize: '100%' }}
      />
      <SplitView start="Plain text" end={label} />
    </>
  );
}
