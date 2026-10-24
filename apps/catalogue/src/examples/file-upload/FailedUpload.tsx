import { useEffect, useRef, useState } from 'react';
import { Button, List, Progress } from '@envsemble/envui';

export default function FailedUpload() {
  // Shown after the connection dropped part way through the photo.
  const [state, setState] = useState<'failed' | 'uploading' | 'done'>('failed');
  const [sent, setSent] = useState(0.4);
  const [removed, setRemoved] = useState<string[]>([]);
  const list = useRef<HTMLUListElement>(null);
  const remove = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearInterval(timer.current), []);

  function tryAgain() {
    setState('uploading');
    setSent(0);
    // Try again leaves while the upload runs, so focus moves to Remove in the same row.
    remove.current?.focus();
    // A timer stands in for the upload, reporting how much has been sent.
    let done = 0;
    timer.current = window.setInterval(() => {
      done = Math.min(1, done + 0.2);
      setSent(done);
      if (done === 1) {
        window.clearInterval(timer.current);
        setState('done');
      }
    }, 300);
  }

  // A removed row takes its buttons with it, so focus moves to the list.
  const drop = (name: string) => {
    if (name === 'team-photo.jpg') window.clearInterval(timer.current);
    setRemoved((current) => [...current, name]);
    list.current?.focus();
  };

  const megabytes = (share: number) => `${(1.1 * share).toFixed(1)} MB`;

  return (
    <List.Root
      ref={list}
      aria-label="Files"
      tabIndex={-1}
      style={{ inlineSize: 'min(100%, 28rem)' }}
    >
      {!removed.includes('annual-review.pdf') && (
        <List.Item
          label="annual-review.pdf"
          description="2.4 MB"
          action={
            <Button
              variant="text"
              aria-label="Remove annual-review.pdf"
              onClick={() => drop('annual-review.pdf')}
            >
              Remove
            </Button>
          }
        />
      )}
      {!removed.includes('team-photo.jpg') && (
        <List.Item
          label="team-photo.jpg"
          description={
            state === 'failed'
              ? "Couldn't upload. Check your connection and try again."
              : state === 'done'
                ? '1.1 MB'
                : undefined
          }
          action={
            <>
              {state === 'failed' && (
                <Button
                  variant="text"
                  aria-label="Try again to upload team-photo.jpg"
                  onClick={tryAgain}
                >
                  Try again
                </Button>
              )}
              <Button
                ref={remove}
                variant="text"
                aria-label="Remove team-photo.jpg"
                onClick={() => drop('team-photo.jpg')}
              >
                Remove
              </Button>
            </>
          }
        >
          {state === 'uploading' && (
            <Progress
              label="Uploading"
              value={sent}
              max={1}
              valueText={`${megabytes(sent)} of ${megabytes(1)}`}
              aria-valuetext={`team-photo.jpg, ${megabytes(sent)} of ${megabytes(1)}`}
            />
          )}
        </List.Item>
      )}
      {removed.length === 2 && <List.Item label="No files." />}
    </List.Root>
  );
}
