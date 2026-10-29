import { useEffect, useRef, useState } from 'react';
import { Button, Column, DropZone, List, Progress, Text, Toast, useToast } from '@envsemble/envui';

interface Upload {
  id: number;
  name: string;
  size: number;
  sent: number;
  state: 'uploading' | 'done' | 'failed';
}

const limit = 10 * 1024 * 1024;

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${bytes === 0 ? 0 : Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function Uploads() {
  const toast = useToast();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [error, setError] = useState<string>();
  const timers = useRef(new Map<number, number>());
  const attempts = useRef(0);
  useEffect(() => {
    const running = timers.current;
    return () => running.forEach((timer) => window.clearInterval(timer));
  }, []);
  const list = useRef<HTMLUListElement>(null);
  // A removed row takes its buttons with it, so focus moves to the next row's first button, or to
  // the list once it is empty.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });

  const change = (id: number, update: (upload: Upload) => Partial<Upload>) =>
    setUploads((current) =>
      current.map((upload) => (upload.id === id ? { ...upload, ...update(upload) } : upload)),
    );

  function start(id: number) {
    change(id, () => ({ state: 'uploading', sent: 0 }));
    // A timer stands in for the upload, reporting what has been sent, about 1 MB a second. Every
    // other upload drops part way, as on an unsteady connection, to show a failure.
    const drops = attempts.current++ % 2 === 1;
    timers.current.set(
      id,
      window.setInterval(() => {
        change(id, ({ sent, size }) => {
          const next = Math.min(size, sent + 300_000);
          if (drops && next > size * 0.6) {
            window.clearInterval(timers.current.get(id));
            return { state: 'failed' };
          }
          if (next < size) return { sent: next };
          window.clearInterval(timers.current.get(id));
          return { sent: size, state: 'done' };
        });
      }, 250),
    );
  }

  function add(files: File[]) {
    const fit = files.filter((file) => file.size <= limit);
    const tooLarge = files.filter((file) => file.size > limit);
    setError(
      tooLarge.length > 0
        ? `${tooLarge.map((file) => file.name).join(', ')} ${tooLarge.length === 1 ? 'is' : 'are'} larger than 10 MB.`
        : undefined,
    );
    const added = fit.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      sent: 0,
      state: 'uploading' as const,
    }));
    setUploads((current) => [...current, ...added]);
    added.forEach((upload) => start(upload.id));
  }

  function remove(upload: Upload) {
    const index = uploads.indexOf(upload);
    window.clearInterval(timers.current.get(upload.id));
    focusNext.current = () => {
      const rows = list.current?.querySelectorAll('li') ?? [];
      const row = rows[Math.min(index, rows.length - 1)];
      (row?.querySelector('button') ?? list.current)?.focus();
    };
    // Removed at once, with no question first: Undo puts it back, and an upload starts again.
    setUploads((current) => current.filter((item) => item !== upload));
    const id = toast.show({
      message: `${upload.name} removed.`,
      action: {
        label: 'Undo',
        onClick: () => {
          setUploads((current) => {
            const restored = [...current];
            restored.splice(index, 0, upload);
            return restored;
          });
          if (upload.state === 'uploading') start(upload.id);
          toast.dismiss(id);
        },
      },
    });
  }

  const done = uploads.filter((upload) => upload.state === 'done').length;
  const failed = uploads.filter((upload) => upload.state === 'failed').length;

  return (
    // As wide as a form column.
    <Column gap={4} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <DropZone
        multiple
        label="Add files"
        description="Any file up to 10 MB"
        error={error}
        onFilesAccepted={add}
      />
      <List.Root ref={list} aria-label="Files" tabIndex={-1}>
        {uploads.map((upload) => (
          <List.Item
            key={upload.id}
            label={upload.name}
            description={
              upload.state === 'done'
                ? size(upload.size)
                : upload.state === 'failed'
                  ? "Couldn't upload. Check your connection and try again."
                  : undefined
            }
            action={
              <>
                {upload.state === 'failed' && (
                  <Button
                    variant="text"
                    aria-label={`Try again to upload ${upload.name}`}
                    onClick={() => start(upload.id)}
                  >
                    Try again
                  </Button>
                )}
                <Button
                  variant="text"
                  aria-label={`Remove ${upload.name}`}
                  onClick={() => remove(upload)}
                >
                  Remove
                </Button>
              </>
            }
          >
            {upload.state === 'uploading' && (
              <Progress
                label="Uploading"
                value={upload.sent}
                max={upload.size}
                valueText={`${size(upload.sent)} of ${size(upload.size)}`}
                aria-valuetext={`${upload.name}, ${size(upload.sent)} of ${size(upload.size)}`}
              />
            )}
          </List.Item>
        ))}
        {uploads.length === 0 && <List.Item label="No files yet." />}
      </List.Root>
      <Text variant="caption" emphasis="muted" role="status">
        {uploads.length > 0 &&
          `${done} of ${uploads.length} uploaded${failed > 0 ? `, ${failed} failed` : ''}.`}
      </Text>
    </Column>
  );
}

export default function UploadFiles() {
  // An application has one Toast.Provider at its root; the example brings its own.
  return (
    <Toast.Provider>
      <Uploads />
    </Toast.Provider>
  );
}
