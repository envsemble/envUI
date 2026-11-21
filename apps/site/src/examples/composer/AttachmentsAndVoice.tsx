import { useState } from 'react';
import { Badge, Composer, IconButton, Row } from '@envsemble/envui';
import { IconAttachFile } from '@envsemble/envui/icons/AttachFile';
import { IconDescription } from '@envsemble/envui/icons/Description';
import { IconMic } from '@envsemble/envui/icons/Mic';

export default function AttachmentsAndVoice() {
  const [files, setFiles] = useState(['Pricing brief.pdf', 'Launch checklist.md']);
  return (
    <Composer
      aria-label="Message"
      placeholder="Ask about these files"
      header={
        files.length > 0 ? (
          <Row wrap gap={2}>
            {files.map((file) => (
              <Badge key={file} variant="outline" start={<IconDescription />}>
                {file}
              </Badge>
            ))}
          </Row>
        ) : null
      }
      start={<IconButton variant="text" icon={<IconAttachFile />} aria-label="Attach files" />}
      end={<IconButton variant="text" icon={<IconMic />} aria-label="Dictate" />}
      onSend={() => setFiles([])}
      style={{ inlineSize: 'min(100%, 32rem)' }}
    />
  );
}
