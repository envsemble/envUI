import { useState, type ReactNode } from 'react';
import {
  Button,
  Column,
  List,
  PortalContainer,
  Surface,
  ToastProvider,
  useToast,
} from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';
import { outlined } from './Outline';

const projects = ['Launch plan', 'Annual report', 'Press kit'];

/** Archived at once, with no question first; Undo brings it back. */
const script: PointerStep[] = [
  { wait: 400 },
  // Over Archive for a moment, and pressed, so its row goes a second in, once the card is in view.
  { to: '[aria-label="Archive Annual report"]', duration: 600 },
  { wait: 700 },
  { press: true },
  { wait: 300 },
  { release: true },
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
          toast.dismiss(id);
          // Back once the notification has gone, so it never fades out over the row it restores.
          setTimeout(() => setArchived((current) => current.filter((item) => item !== name)), 300);
        },
      },
    });
  };
  return (
    <Surface background="muted" padding={1} radius="sm" style={outlined}>
      <List.Root aria-label="Projects">
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
                  startIcon={<IconArchive />}
                  aria-label={`Archive ${name}`}
                  onClick={() => archive(name)}
                >
                  Archive
                </Button>
              }
            />
          ))}
      </List.Root>
    </Surface>
  );
}

/**
 * The window's foot, below the list, where its notifications appear at the end, as an
 * application's toast region sits at the foot of its window rather than over what it lists.
 */
function NotificationArea({ children }: { children: (area: HTMLElement | null) => ReactNode }) {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  return (
    <>
      {children(area)}
      {/* Its own containing block, so the toast region's fixed position places it here. */}
      <div
        ref={setArea}
        style={{ position: 'relative', contain: 'layout', minBlockSize: '4.5rem' }}
      />
    </>
  );
}

/** A list whose rows are archived at once, each with Undo in a notification below it. */
export default function DestructiveActionsTile() {
  return (
    <Column gap={2} style={{ inlineSize: '17rem' }}>
      <NotificationArea>
        {(area) => (
          <PortalContainer container={area}>
            <ToastProvider>
              <Projects />
            </ToastProvider>
          </PortalContainer>
        )}
      </NotificationArea>
    </Column>
  );
}
