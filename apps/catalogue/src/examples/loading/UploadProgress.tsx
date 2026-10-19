import { useEffect, useRef, useState } from 'react';
import { Button, Progress, Stack, Text } from '@envsemble/envui';

const files = [
  { name: 'annual-review.pdf', size: 6 },
  { name: 'data-migration-plan.xlsx', size: 3 },
];

export default function UploadProgress() {
  // Megabytes sent of each file; undefined before the upload starts.
  const [sent, setSent] = useState<number[]>();
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);
  const done = sent?.every((value, index) => value === files[index].size);
  const upload = () => {
    // The button stays enabled, so focus stays on it; a press while uploading does nothing.
    if (sent !== undefined && !done) return;
    setSent(files.map(() => 0));
    // The files upload to a server, which reports what it has received; a timer stands in for it.
    timer.current = window.setInterval(() => {
      setSent((current) => {
        const next = (current ?? []).map((value, index) =>
          Math.min(files[index].size, Math.round((value + 0.6) * 10) / 10),
        );
        if (next.every((value, index) => value === files[index].size))
          window.clearInterval(timer.current);
        return next;
      });
    }, 300);
  };
  return (
    <Stack gap={5}>
      <Stack align="start">
        <Button variant="secondary" onClick={upload}>
          Upload 2 files
        </Button>
      </Stack>
      {sent && (
        <Stack gap={4}>
          {files.map((file, index) => (
            // The value says how far it is; valueText says it in the units people think in.
            <Progress
              key={file.name}
              label={file.name}
              value={(sent[index] / file.size) * 100}
              valueText={`${sent[index]} of ${file.size} MB`}
            />
          ))}
        </Stack>
      )}
      <Text role="status" emphasis="muted">
        {done ? 'Uploaded 2 files.' : ''}
      </Text>
    </Stack>
  );
}
