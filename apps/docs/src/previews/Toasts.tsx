import type { ReactNode } from 'react';
import { Button, Stack, Text, Toast, ToastProvider, useToast } from '@envsemble/envui';
import { Example } from './Example';
import { Preview } from './Preview';

const toastVariants = [
  { variant: 'neutral', title: 'Neutral', message: 'Files archived.' },
  { variant: 'success', title: 'Success', message: 'Changes saved.' },
  { variant: 'info', title: 'Info', message: 'An update is available.' },
  { variant: 'error', title: 'Error', message: 'Changes couldn’t be saved.' },
] as const;

function ToastExample({
  title,
  children,
  onTry,
}: {
  title: string;
  children: ReactNode;
  onTry: () => void;
}) {
  return (
    <>
      <Text as="h3" variant="section-heading" className="docs-toast-example-title">
        {title}
      </Text>
      {children}
      <Button variant="text" onClick={onTry} aria-label={`Try it now: ${title}`}>
        Try it now
      </Button>
    </>
  );
}

function NotificationExamples() {
  const toast = useToast();

  function queueNotifications() {
    for (let index = 1; index <= 5; index++) {
      toast.show({
        variant: 'info',
        message: `Upload ${index} complete.`,
        duration: 3000,
      });
    }
  }

  return (
    <Preview>
      <Example
        title="Variants"
        caption="Notifications appear at the bottom right. Timed messages last three seconds; errors stay until dismissed. Hovering pauses the timer."
      >
        <div className="docs-toast-examples">
          {toastVariants.map(({ variant, title, message }) => (
            <ToastExample
              key={variant}
              title={title}
              onTry={() =>
                toast.show({ variant, message, duration: variant === 'error' ? Infinity : 3000 })
              }
            >
              <Toast announce={false} variant={variant} message={message} />
            </ToastExample>
          ))}
        </div>
      </Example>
      <Example
        title="Placement & stacking"
        caption="Bottom-right stacks grow upward; top-center stacks grow downward. Each stack shows at most two toasts, with the queued count above it."
      >
        <div className="docs-toast-examples">
          <ToastExample
            title="Top center"
            onTry={() =>
              toast.show({
                variant: 'info',
                message: 'An update is available.',
                placement: 'top-center',
                duration: 3000,
              })
            }
          >
            <Toast announce={false} variant="info" message="An update is available." />
          </ToastExample>
          <ToastExample title="Queue five notifications" onTry={queueNotifications}>
            <Stack gap={2}>
              <Toast announce={false} variant="info" message="Upload 1 complete." />
              <Toast announce={false} variant="info" message="Upload 2 complete." />
            </Stack>
          </ToastExample>
        </div>
      </Example>
    </Preview>
  );
}

export function ToastsPreview() {
  return (
    <ToastProvider visibleLimit={2}>
      <NotificationExamples />
    </ToastProvider>
  );
}
