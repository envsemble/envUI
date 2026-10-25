import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Column, DropZone, List, Progress, Row, Text, Textarea } from '@envsemble/envui';

interface Upload {
  id: number;
  name: string;
  done: boolean;
}

export default function AttachInForm() {
  const [uploads, setUploads] = useState<Upload[]>([{ id: 1, name: 'site-plan.pdf', done: true }]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const uploading = uploads.some((upload) => !upload.done);

  // A send waits for the uploads still running, then goes.
  useEffect(() => {
    if (!sending || uploading) return;
    setSending(false);
    setStatus(`Report sent with ${uploads.length} ${uploads.length === 1 ? 'file' : 'files'}.`);
  }, [sending, uploading, uploads.length]);

  function add(files: File[]) {
    const added = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      done: false,
    }));
    setUploads((current) => [...current, ...added]);
    // Files upload as soon as they are added; timers stand in for the uploads.
    for (const upload of added)
      timers.current.push(
        window.setTimeout(
          () =>
            setUploads((current) =>
              current.map((item) => (item.id === upload.id ? { ...item, done: true } : item)),
            ),
          2500,
        ),
      );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    setSending(true);
  }

  return (
    // One column, kept to a width that reads easily.
    <form onSubmit={submit} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <Column gap={5}>
        <Textarea label="What happened" name="details" rows={3} />
        <Column gap={3}>
          <DropZone
            size="sm"
            multiple
            label="Attach photos or documents"
            description="Any file up to 10 MB"
            onDropAccepted={add}
          />
          <List.Root aria-label="Attached files">
            {uploads.map((upload) => (
              <List.Item key={upload.id} label={upload.name}>
                {!upload.done && (
                  <Progress
                    label="Uploading"
                    value={null}
                    aria-valuetext={`Uploading ${upload.name}`}
                  />
                )}
              </List.Item>
            ))}
          </List.Root>
        </Column>
        <Row wrap gap={3}>
          <Button type="submit" pending={sending}>
            Send report
          </Button>
          <Button variant="secondary">Cancel</Button>
        </Row>
        <Text role="status" emphasis="muted">
          {sending ? 'Sending once the files have uploaded.' : status}
        </Text>
      </Column>
    </form>
  );
}
