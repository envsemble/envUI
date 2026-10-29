import { useEffect, useRef, useState } from 'react';
import { Button, List, Toast, useToast } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';

function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const list = useRef<HTMLUListElement>(null);
  // An archived row takes its button with it, so focus moves to the next row's button, or to the
  // list once it is empty.
  const focusNext = useRef<(() => void) | null>(null);
  useEffect(() => {
    focusNext.current?.();
    focusNext.current = null;
  });

  const archive = (name: string) => {
    const index = projects.indexOf(name);
    focusNext.current = () => {
      const buttons = list.current?.querySelectorAll('button') ?? [];
      (buttons[Math.min(index, buttons.length - 1)] ?? list.current)?.focus();
    };
    // The project is archived at once, with no question first: Undo brings it back.
    setProjects((current) => current.filter((project) => project !== name));
    const id = toast.show({
      message: `${name} archived.`,
      action: {
        label: 'Undo',
        onClick: () => {
          setProjects((current) =>
            initialProjects.filter((project) => project === name || current.includes(project)),
          );
          toast.dismiss(id);
        },
      },
    });
  };

  return (
    <List.Root ref={list} aria-label="Projects" tabIndex={-1}>
      {projects.map((project) => (
        <List.Item
          key={project}
          label={project}
          end={
            <Button
              variant="secondary"
              size="sm"
              startIcon={<Archive />}
              aria-label={`Archive ${project}`}
              onClick={() => archive(project)}
            >
              Archive
            </Button>
          }
        />
      ))}
      {projects.length === 0 && <List.Item label="Every project is archived." />}
    </List.Root>
  );
}

export default function UndoInstead() {
  // An application has one Toast.Provider at its root; the example brings its own.
  return (
    <Toast.Provider>
      <Projects />
    </Toast.Provider>
  );
}

const initialProjects = [
  'Website refresh',
  'Quarterly report',
  'Onboarding guide',
  'Mobile release',
];
