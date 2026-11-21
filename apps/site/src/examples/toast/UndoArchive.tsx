import { useState } from 'react';
import { IconButton, List, Text, ToastProvider, useToast } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';

const initialProjects = ['Website refresh', 'Onboarding emails', 'Billing migration'];

function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const archive = (name: string) => {
    setProjects((current) => current.filter((project) => project !== name));
    const id = toast.show({
      message: `${name} archived.`,
      actions: [
        {
          label: 'Undo',
          onClick: () => {
            setProjects((current) =>
              initialProjects.filter((project) => project === name || current.includes(project)),
            );
            toast.dismiss(id);
          },
        },
      ],
    });
  };
  if (projects.length === 0) return <Text variant="body-sm">Every project is archived.</Text>;
  return (
    <List.Root aria-label="Projects">
      {projects.map((project) => (
        <List.Item
          key={project}
          label={project}
          end={
            <IconButton
              variant="text"
              icon={<IconArchive />}
              aria-label={`Archive ${project}`}
              onClick={() => archive(project)}
            />
          }
        />
      ))}
    </List.Root>
  );
}

export default function UndoArchive() {
  return (
    <ToastProvider>
      <Projects />
    </ToastProvider>
  );
}
