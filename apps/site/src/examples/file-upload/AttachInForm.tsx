import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Column, DropZone, List, Progress, Row, Text, Textarea } from '@envsemble/envui';

interface Upload {
  id: number;
  name: string;
  /** How much of the file has been sent, from 0 to 1. */
  sent: number;
}

export default function AttachInForm() {
  const [uploads, setUploads] = useState<Upload[]>([{ id: 1, name: 'site-plan.pdf', sent: 1 }]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearInterval(timer)), []);
  const uploading = uploads.some((upload) => upload.sent < 1);

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
      sent: 0,
    }));
    setUploads((current) => [...current, ...added]);
    // Files upload as soon as they are added; timers stand in for the uploads, a tenth at a time.
    for (const upload of added) {
      let tenths = 0;
      const timer = window.setInterval(() => {
        tenths += 1;
        const sent = tenths / 10;
        if (tenths === 10) window.clearInterval(timer);
        setUploads((current) =>
          current.map((item) => (item.id === upload.id ? { ...item, sent } : item)),
        );
      }, 450);
      timers.current.push(timer);
    }
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
            onFilesAccepted={add}
          />
          <List.Root aria-label="Attached files">
            {uploads.map((upload) => (
              <List.Item key={upload.id} label={upload.name}>
                {upload.sent < 1 && (
                  <Progress
                    label="Uploading"
                    value={upload.sent}
                    max={1}
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
