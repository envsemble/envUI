import { useState } from 'react';
import { Button, List, PortalContainer, Toast, useToast } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { usePointer, usePreviewLayer, type PointerStep } from '../motion/Motion';

const projects = ['Launch plan', 'Annual report', 'Press kit'];

/** Archived at once, with no question first; Undo brings it back. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '[aria-label="Archive Annual report"]' },
  { wait: 400 },
  { click: true },
  { wait: 1200 },
  { to: '.env-toast-action', duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

function Projects() {
  const toast = useToast();
  const [archived, setArchived] = useState<string[]>([]);
  usePointer(script);
  const archive = (name: string) => {
    setArchived((current) => [...current, name]);
    const id = toast.show({
      message: `${name} archived.`,
      action: {
        label: 'Undo',
        onClick: () => {
          setArchived((current) => current.filter((item) => item !== name));
          toast.dismiss(id);
        },
      },
    });
  };
  return (
    <List.Root aria-label="Projects" style={{ inlineSize: '16rem' }}>
      {projects
        .filter((name) => !archived.includes(name))
        .map((name) => (
          <List.Item
            key={name}
            label={name}
            end={
              <Button
                variant="secondary"
                size="sm"
                startIcon={<Archive />}
                aria-label={`Archive ${name}`}
                onClick={() => archive(name)}
              >
                Archive
              </Button>
            }
          />
        ))}
    </List.Root>
  );
}

/** A list whose rows are archived at once, each with Undo in a notification. */
export default function DestructiveActionsTile() {
  const layer = usePreviewLayer();
  if (!layer) return null;
  return (
    <PortalContainer container={layer}>
      <Toast.Provider>
        <Projects />
      </Toast.Provider>
    </PortalContainer>
  );
}
