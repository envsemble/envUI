import { useEffect } from 'react';
import { Alert, Button, Progress, Spinner, ToastProvider, useToast } from '@envsemble/envui';
import { Cell, Section, Stage, Strip } from './ContactSheetParts.js';

const alertTones = ['info', 'success', 'warning', 'danger'] as const;

function Alerts() {
  return (
    <Section name="Alert">
      {alertTones.map((tone) => (
        <Strip key={tone} label={tone}>
          <Cell caption="Title and text" width="22rem">
            <Alert tone={tone} title="Billing changes on 1 December">
              Your plan moves to monthly invoices.
            </Alert>
          </Cell>
          <Cell caption="Actions, dismissible" width="26rem">
            <Alert
              tone={tone}
              title="Sync paused"
              actions={
                <Button variant="outline" size="sm">
                  Resume
                </Button>
              }
              onDismiss={() => {}}
            >
              Three files wait to upload.
            </Alert>
          </Cell>
          <Cell caption="Text only" width="18rem">
            <Alert tone={tone}>Saved to drafts.</Alert>
          </Cell>
          <Cell caption="Dismiss: hover" force="hover" target="button" width="18rem">
            <Alert tone={tone} onDismiss={() => {}}>
              Saved to drafts.
            </Alert>
          </Cell>
          <Cell caption="Dismiss: focus-visible" force="focus" target="button" width="18rem">
            <Alert tone={tone} onDismiss={() => {}}>
              Saved to drafts.
            </Alert>
          </Cell>
        </Strip>
      ))}
      <Strip label="Loading">
        <Cell caption="Skeleton" width="22rem">
          <Alert title="Billing changes" skeleton>
            Your plan moves to monthly invoices.
          </Alert>
        </Cell>
      </Strip>
    </Section>
  );
}

function Progresses() {
  return (
    <Section name="Progress">
      <Strip>
        {[0, 30, 75, 100].map((value) => (
          <Cell key={value} caption={`${value}%`} width="14rem">
            <Progress label="Uploading" value={value} />
          </Cell>
        ))}
        <Cell caption="Indeterminate" width="14rem">
          <Progress label="Preparing" value={null} />
        </Cell>
        <Cell caption="Segments, step 2 of 4" width="14rem">
          <Progress label="Setup" value={2} max={4} segments={4} valueText="Step 2 of 4" />
        </Cell>
      </Strip>
    </Section>
  );
}

function Spinners() {
  return (
    <Section name="Spinner">
      <Strip>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Cell key={size} caption={size}>
            <Spinner size={size} label="Loading" />
          </Cell>
        ))}
        <Cell caption="Label shown">
          <Spinner label="Loading projects" showLabel />
        </Cell>
        <Cell caption="In a button">
          <Button pending variant="secondary">
            Save
          </Button>
        </Cell>
      </Strip>
    </Section>
  );
}

/** Toasts in every tone, one with an action, one not dismissible, kept until the page closes. */
function Toasts({ placement }: { placement: 'bottom-end' | 'top-center' }) {
  const toast = useToast();
  useEffect(() => {
    const ids = [
      toast.show({ message: 'Neutral: link copied.', duration: 0, placement }),
      toast.show({
        message: 'Info: a new version is ready.',
        tone: 'info',
        duration: 0,
        placement,
      }),
      toast.show({
        message: 'Success: project archived.',
        tone: 'success',
        duration: 0,
        placement,
        action: { label: 'Undo', onClick: () => {} },
      }),
      toast.show({
        message: 'Danger: the upload failed.',
        tone: 'danger',
        duration: 0,
        placement,
        action: { label: 'Retry', onClick: () => {} },
      }),
      toast.show({ message: 'Not dismissible.', duration: 0, placement, dismissible: false }),
    ];
    return () => ids.forEach((id) => toast.dismiss(id));
  }, [toast, placement]);
  return null;
}

function ToastStages() {
  return (
    <Section name="Toast (ToastProvider)">
      <Strip>
        <Cell caption="Tones, actions, bottom-end stack">
          <Stage height="30rem" width="30rem">
            <ToastProvider limit={5}>
              <Toasts placement="bottom-end" />
            </ToastProvider>
          </Stage>
        </Cell>
        <Cell caption="Top-center">
          <Stage height="30rem" width="30rem">
            <ToastProvider defaultPlacement="top-center" limit={5}>
              <Toasts placement="top-center" />
            </ToastProvider>
          </Stage>
        </Cell>
      </Strip>
    </Section>
  );
}

export function FeedbackSheet() {
  return (
    <>
      <Alerts />
      <Progresses />
      <Spinners />
      <ToastStages />
    </>
  );
}
