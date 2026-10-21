import { useEffect, useRef, useState } from 'react';
import { DropZone, Column, Text } from '@envsemble/envui';

export default function UploadProgress() {
  const [uploading, setUploading] = useState<string>();
  const [done, setDone] = useState('');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const upload = ([file]: File[]) => {
    setUploading(file.name);
    setDone('');
    // Stands in for the upload to a server.
    timer.current = window.setTimeout(() => {
      setUploading(undefined);
      setDone(`${file.name} is uploaded.`);
    }, 1500);
  };

  return (
    <Column gap={3}>
      <DropZone
        pending={uploading != null}
        label={uploading ? `Uploading ${uploading}` : 'Drop a report here, or browse'}
        description={uploading ? 'This takes a moment' : 'PDF up to 10 MB'}
        accept="application/pdf,.pdf"
        onDropAccepted={upload}
      />
      <Text variant="caption" emphasis="muted" role="status">
        {done}
      </Text>
    </Column>
  );
}
