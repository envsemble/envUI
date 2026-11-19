import { useState } from 'react';
import { Button, DropZone, List } from '@envsemble/envui';

const brief = new File(['Website refresh brief'], 'Website refresh brief.pdf', {
  type: 'application/pdf',
});

export default function FilesInsideTheZone() {
  const [documents, setDocuments] = useState<File[]>([brief]);
  return (
    <DropZone
      size="sm"
      multiple
      label="Attach documents"
      description="Drop more files here or on the list"
      onFilesAccepted={(files) => setDocuments((current) => [...current, ...files])}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      {documents.length > 0 && (
        <List.Root aria-label="Attached documents">
          {documents.map((file, index) => (
            <List.Item
              key={`${index}-${file.name}`}
              label={file.name}
              end={
                <Button
                  variant="text"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setDocuments((current) => current.filter((item) => item !== file))}
                >
                  Remove
                </Button>
              }
            />
          ))}
        </List.Root>
      )}
    </DropZone>
  );
}
