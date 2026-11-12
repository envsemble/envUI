import { useEffect, useState } from 'react';
import { Column, DropZone } from '@envsemble/envui';

interface Upload {
  /** The file's size and how much of it has been sent, in MB. */
  size: number;
  sent: number;
}

const megabytes = (bytes: number) => Math.max(0.1, Math.round(bytes / 1024 / 102.4) / 10);

export default function ZoneBusyWhileUploading() {
  // Shown part way through two uploads, with the zone closed until both are done.
  const [uploads, setUploads] = useState<Upload[]>([
    { size: 2.4, sent: 1.5 },
    { size: 1.1, sent: 0.3 },
  ]);
  // A timer stands in for the uploads, each sending 0.1 MB at a time.
  useEffect(() => {
    const timer = window.setInterval(
      () =>
        setUploads((current) =>
          current.map((upload) => ({
            ...upload,
            sent: Math.min(upload.size, Math.round((upload.sent + 0.1) * 10) / 10),
          })),
        ),
      300,
    );
    return () => window.clearInterval(timer);
  }, []);
  const running = uploads.filter((upload) => upload.sent < upload.size).length;
  const add = (files: File[]) =>
    setUploads((current) => [
      ...current,
      ...files.map((file) => ({ size: megabytes(file.size), sent: 0 })),
    ]);

  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <DropZone
        size="sm"
        multiple
        pending={running > 0}
        label={
          running === 0 ? 'Add files' : `Uploading ${running} ${running === 1 ? 'file' : 'files'}`
        }
        description={running === 0 ? undefined : 'This takes a moment'}
        onFilesAccepted={add}
      />
    </Column>
  );
}
