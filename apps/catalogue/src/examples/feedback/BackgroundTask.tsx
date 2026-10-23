import { useEffect, useRef, useState } from 'react';
import { Button, Link, Column, Row, Text, Toast, useToast } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';

const file = 'quarterly-report.csv';

function ExportReport() {
  const toast = useToast();
  const [state, setState] = useState<'idle' | 'running' | 'ready'>('idle');
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = () => {
    setState('running');
    // The export runs on a server for a while; people can carry on meanwhile. A timer stands in.
    timer.current = window.setTimeout(() => {
      setState('ready');
      // People may be anywhere when it ends: the notification carries the next step, and stays
      // until it is dismissed because it has an action.
      const id = toast.show({
        tone: 'info',
        message: `${file} is ready.`,
        action: {
          label: 'Download',
          onClick: () => {
            // The application starts the download here, as the link on the page does.
            toast.dismiss(id);
          },
        },
      });
    }, 3000);
  };

  return (
    <Column gap={4} align="start">
      <Button
        variant="secondary"
        startIcon={<Download />}
        pending={state === 'running'}
        onClick={start}
      >
        Export report
      </Button>
      {/* The page keeps the state too, so the file stays reachable once the toast is gone. */}
      <Row wrap align="center" gap={3}>
        <Text role="status" variant="body-sm" emphasis="muted">
          {state === 'running' ? `Preparing ${file}. You can leave this page.` : ''}
        </Text>
        {state === 'ready' && (
          <Link href={`/exports/${file}`} download>
            {`Download ${file}`}
          </Link>
        )}
      </Row>
    </Column>
  );
}

export default function BackgroundTask() {
  // An application has one Toast.Provider at its root; the example brings its own.
  return (
    <Toast.Provider>
      <ExportReport />
    </Toast.Provider>
  );
}
