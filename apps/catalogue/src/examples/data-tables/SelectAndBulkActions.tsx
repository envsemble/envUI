import { useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Link,
  Stack,
  Table,
  Text,
  Toast,
  Toolbar,
  useToast,
} from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Delete } from '@envsemble/envui/icons/Delete';

/** "1 project", "3 projects": the count belongs in every label of an action on the selection. */
const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [selected, setSelected] = useState<string[]>(['quarterly-report', 'data-migration']);
  const [confirming, setConfirming] = useState(false);
  // The count the dialog asks about; it stays while the dialog closes.
  const [asked, setAsked] = useState(0);
  // The bar goes with the selection, so focus moves to the header's checkbox after an action.
  const selectAll = useRef<HTMLInputElement>(null);

  const all = projects.length > 0 && selected.length === projects.length;
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => (checked ? [...current, id] : current.filter((item) => item !== id)));

  const archive = () => {
    const archived = projects.filter((project) => selected.includes(project.id));
    setProjects((current) => current.filter((project) => !selected.includes(project.id)));
    setSelected([]);
    selectAll.current?.focus();
    // Archiving can be undone, so it happens at once, with Undo in the toast.
    const id = toast.show({
      message: `${projectCount(archived.length)} archived.`,
      action: {
        label: 'Undo',
        onClick: () => {
          setProjects((current) =>
            initialProjects.filter(
              (project) => current.includes(project) || archived.includes(project),
            ),
          );
          toast.dismiss(id);
        },
      },
    });
  };

  return (
    <Stack gap={3}>
      {selected.length > 0 && (
        // The bulk bar: the count, then the actions on the selection.
        <Stack direction="row" wrap align="center" gap={3}>
          <Text variant="body-sm">{selected.length} selected</Text>
          {/* Only icon buttons, so one tab stop with the arrow keys between them. */}
          <Toolbar.Root aria-label="Selected projects" size="sm">
            <Toolbar.Button
              icon={<Archive />}
              label={`Archive ${projectCount(selected.length)}`}
              onClick={archive}
            />
            <Toolbar.Button
              icon={<Delete />}
              label={`Delete ${projectCount(selected.length)}…`}
              onClick={() => {
                setAsked(selected.length);
                setConfirming(true);
              }}
            />
          </Toolbar.Root>
          <Button
            variant="text"
            size="sm"
            onClick={() => {
              setSelected([]);
              selectAll.current?.focus();
            }}
          >
            Clear selection
          </Button>
        </Stack>
      )}
      {/* A narrow column for the checkboxes; the others share the rest. */}
      <Table.Root aria-label="Projects" defaultColumnWidths={[8, 50, 42]}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>
              {/* Mixed while some rows are selected; a press selects them all. */}
              <Checkbox
                ref={selectAll}
                aria-label="Select all projects"
                checked={all ? true : selected.length > 0 ? 'mixed' : false}
                onCheckedChange={(checked) =>
                  setSelected(checked && !all ? projects.map((project) => project.id) : [])
                }
              />
            </Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Owner</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {projects.map((project) => (
            // Every row reports its state, selected or not, and has a checkbox that selects it.
            <Table.Row key={project.id} selected={selected.includes(project.id)}>
              <Table.Cell>
                <Checkbox
                  aria-label={`Select ${project.name}`}
                  checked={selected.includes(project.id)}
                  onCheckedChange={(checked) => toggle(project.id, checked)}
                />
              </Table.Cell>
              <Table.Cell>
                <Link href={`/projects/${project.id}`}>{project.name}</Link>
              </Table.Cell>
              <Table.Cell>{project.owner}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={`Delete ${projectCount(asked)}?`}
        description="This deletes them with their documents and tasks for everyone. You can’t undo this."
        confirmLabel={`Delete ${projectCount(asked)}`}
        finalFocus={selectAll}
        onConfirm={() => {
          // The projects are deleted on a server; the application would return its promise here,
          // so the dialog waits for it.
          setProjects((current) => current.filter((project) => !selected.includes(project.id)));
          setSelected([]);
        }}
      />
    </Stack>
  );
}

export default function SelectAndBulkActions() {
  // An application has one Toast.Provider at its root; the example brings its own.
  return (
    <Toast.Provider>
      <Projects />
    </Toast.Provider>
  );
}

const initialProjects = [
  { id: 'website-refresh', name: 'Website refresh', owner: 'Priya Shah' },
  { id: 'quarterly-report', name: 'Quarterly report', owner: 'Sam Lee' },
  { id: 'onboarding-guide', name: 'Onboarding guide', owner: 'Jordan Kim' },
  { id: 'data-migration', name: 'Data migration', owner: 'Maria Garcia' },
  { id: 'annual-review', name: 'Annual review', owner: 'Alex Morgan' },
];
