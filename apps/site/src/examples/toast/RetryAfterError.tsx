import { useRef, useState } from 'react';
import { Button, ToastProvider, useToast } from '@envsemble/envui';

function PublishButton() {
  const toast = useToast();
  const [publishing, setPublishing] = useState(false);
  const attempts = useRef(0);
  const publish = () => {
    setPublishing(true);
    // Publishing takes a moment; a timer stands in for it, and the first attempt fails.
    window.setTimeout(() => {
      setPublishing(false);
      attempts.current += 1;
      if (attempts.current === 1) {
        const id = toast.show({
          tone: 'danger',
          message: 'Northwind launch couldn’t be published. Check your connection and try again.',
          action: {
            label: 'Try again',
            onClick: () => {
              toast.dismiss(id);
              publish();
            },
          },
        });
      } else {
        toast.show({ tone: 'success', message: 'Northwind launch published.' });
      }
    }, 1200);
  };
  return (
    <Button pending={publishing} onClick={publish}>
      Publish
    </Button>
  );
}

export default function RetryAfterError() {
  return (
    <ToastProvider>
      <PublishButton />
    </ToastProvider>
  );
}
