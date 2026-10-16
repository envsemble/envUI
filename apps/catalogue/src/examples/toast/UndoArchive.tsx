import { useState } from 'react';
import { Button, List, Text, Toast, useToast } from '@envsemble/envui';

const initialProjects = ['Website refresh', 'Onboarding emails', 'Billing migration'];

function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const archive = (name: string) => {
    setProjects((current) => current.filter((project) => project !== name));
    const id = toast.show({
      message: `${name} archived.`,
      action: {
        label: 'Undo',
        onClick: () => {
          setProjects((current) =>
            initialProjects.filter((project) => project === name || current.includes(project)),
          );
          // The action doesn't close the notification by itself.
          toast.dismiss(id);
        },
      },
    });
  };
  if (projects.length === 0) return <Text variant="body-sm">Every project is archived.</Text>;
  return (
    <List.Root aria-label="Projects">
      {projects.map((project) => (
        <List.Item
          key={project}
          title={project}
          action={
            <Button
              variant="secondary"
              aria-label={`Archive ${project}`}
              onClick={() => archive(project)}
            >
              Archive
            </Button>
          }
        />
      ))}
    </List.Root>
  );
}

export default function UndoArchive() {
  return (
    <Toast.Provider>
      <Projects />
    </Toast.Provider>
  );
}
