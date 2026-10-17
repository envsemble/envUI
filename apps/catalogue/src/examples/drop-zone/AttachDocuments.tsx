import { useState } from 'react';
import { Button, DropZone, List, Stack } from '@envsemble/envui';

export default function AttachDocuments() {
  const [documents, setDocuments] = useState<File[]>([]);
  return (
    <Stack gap={3}>
      <DropZone
        size="sm"
        multiple
        label="Attach documents"
        description="Any file, several at once"
        onFiles={(files) => setDocuments((current) => [...current, ...files])}
      />
      {documents.length > 0 && (
        <List.Root aria-label="Attached documents">
          {documents.map((file, index) => (
            <List.Item
              key={`${index}-${file.name}`}
              label={file.name}
              description={`${Math.max(1, Math.round(file.size / 1024))} KB`}
              action={
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
    </Stack>
  );
}
