import { useEffect, useState } from 'react';
import { Button, Toast, useToast } from '@envsemble/envui';

export function ToastTriggers() {
  const toast = useToast();
  const [actionCount, setActionCount] = useState(0);
  return (
    <section className="fixture-section">
      <h2>Managed notifications</h2>
      <div className="fixture-actions">
        <Button
          data-testid="toast-neutral"
          onClick={() => toast.show({ message: 'Neutral notice' })}
        >
          Show neutral notice
        </Button>
        <Button
          data-testid="toast-short"
          onClick={() => toast.show({ message: 'Short notice', duration: 500 })}
        >
          Show short notice
        </Button>
        <Button
          data-testid="toast-success"
          onClick={() => toast.show({ message: 'Success notice', variant: 'success' })}
        >
          Show success notice
        </Button>
        <Button
          data-testid="toast-info"
          onClick={() => toast.show({ message: 'Info notice', variant: 'info' })}
        >
          Show info notice
        </Button>
        <Button
          data-testid="toast-error"
          onClick={() => toast.show({ message: 'Persistent error notice', variant: 'error' })}
        >
          Show error notice
        </Button>
        <Button
          data-testid="toast-action"
          onClick={() =>
            toast.show({
              message: 'Persistent action notice',
              variant: 'info',
              action: { label: 'Undo notice', onClick: () => setActionCount((count) => count + 1) },
            })
          }
        >
          Show action notice
        </Button>
        <Button
          data-testid="toast-top"
          onClick={() =>
            toast.show({ message: 'Top center notice', placement: 'top-center', duration: 0 })
          }
        >
          Show top center notice
        </Button>
        <Button
          data-testid="toast-queue-bottom"
          onClick={() => {
            for (let index = 1; index <= 4; index++)
              toast.show({
                message: `Bottom queue ${index}`,
                placement: 'bottom-right',
                duration: 0,
              });
          }}
        >
          Queue bottom notices
        </Button>
        <Button
          data-testid="toast-queue-top"
          onClick={() => {
            for (let index = 1; index <= 4; index++)
              toast.show({ message: `Top queue ${index}`, placement: 'top-center', duration: 0 });
          }}
        >
          Queue top notices
        </Button>
        <Button
          data-testid="toast-queue-actions"
          onClick={() => {
            for (let index = 1; index <= 3; index++)
              toast.show({
                message: `Action notice ${index}`,
                duration: 0,
                action: {
                  label: 'Restore previous version',
                  onClick: () => setActionCount((count) => count + 1),
                },
              });
          }}
        >
          Queue action notices
        </Button>
        <Button data-testid="toast-clear" variant="secondary" onClick={toast.clear}>
          Clear managed notices
        </Button>
      </div>
      <output data-testid="toast-action-count">{actionCount}</output>
    </section>
  );
}

function MountNotice() {
  const toast = useToast();
  useEffect(() => {
    toast.show({ message: 'Mounted persistent notice', variant: 'error' });
  }, [toast]);
  return (
    <Button
      onClick={() => {
        for (let i = 0; i < 3; i++)
          toast.show({ message: `Extra persistent ${i}`, variant: 'error' });
      }}
    >
      Add strict notices
    </Button>
  );
}

export function StrictToastFixture() {
  const [stress, setStress] = useState(false);
  return (
    <>
      <Button onClick={() => setStress(true)}>Mount strict toast provider</Button>
      {stress && (
        <Toast.Provider>
          <MountNotice />
        </Toast.Provider>
      )}
    </>
  );
}
