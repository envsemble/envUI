import { useRef, useState, type CSSProperties } from 'react';
import {
  Button,
  Checkbox,
  ConfirmDialog,
  Link,
  Column,
  Row,
  Table,
  Text,
  ToastProvider,
  Toolbar,
  useToast,
} from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconDelete } from '@envsemble/envui/icons/Delete';

/** "1 project", "3 projects": the count belongs in every label of an action on the selection. */
const projectCount = (count: number) => (count === 1 ? '1 project' : `${count} projects`);

/** Read by assistive technology but not shown: the bar shows the count on screen. */
const visuallyHidden: CSSProperties = {
  position: 'absolute',
  inlineSize: 1,
  blockSize: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState(initialProjects);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  // The count the dialog asks about; it stays while the dialog closes.
  const [asked, setAsked] = useState(0);
  // The bar goes with the selection, so focus moves to the header's checkbox after an action.
  const selectAll = useRef<HTMLInputElement>(null);
  // Where focus goes as the dialog closes: back to Delete when it is cancelled, or to the header's
  // checkbox once the projects, and the bar with them, are gone.
  const returnFocus = useRef<HTMLElement | null>(null);

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
    <Column gap={3}>
      {/* The bar comes and goes, so a status that is always there announces the count politely
          as it changes; the count the bar shows isn't announced a second time. */}
      <div role="status" style={visuallyHidden}>
        {selected.length > 0 ? `${projectCount(selected.length)} selected` : 'No projects selected'}
      </div>
      {/* Above the table, the count of projects, and while rows are selected the bulk bar in its
          place: the count, then the actions on the selection, at the size of the rows. It keeps
          its height, so the table stays where it is. */}
      <Row wrap align="center" gap={3} style={{ minBlockSize: '2.5rem' }}>
        {selected.length === 0 ? (
          <Text emphasis="muted">{projectCount(projects.length)}</Text>
        ) : (
          <>
            <Text>{selected.length} selected</Text>
            {/* Only icon buttons, so one tab stop with the arrow keys between them. */}
            <Toolbar.Root aria-label="Selected projects">
              <Toolbar.Button
                icon={<IconArchive />}
                label={`Archive ${projectCount(selected.length)}`}
                onClick={archive}
              />
              <Toolbar.Button
                icon={<IconDelete />}
                label={`Delete ${projectCount(selected.length)}…`}
                onClick={(event) => {
                  returnFocus.current = event.currentTarget;
                  setAsked(selected.length);
                  setConfirming(true);
                }}
              />
            </Toolbar.Root>
            <Button
              variant="text"
              onClick={() => {
                setSelected([]);
                selectAll.current?.focus();
              }}
            >
              Clear selection
            </Button>
          </>
        )}
      </Row>
      {/* A narrow column for the checkboxes; the others share the rest. */}
      <Table.Root aria-label="Team projects" defaultColumnWidths={[8, 50, 42]}>
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
        finalFocus={returnFocus}
        onConfirm={() => {
          returnFocus.current = selectAll.current;
          // The projects are deleted on a server; the application would return its promise here,
          // so the dialog waits for it.
          setProjects((current) => current.filter((project) => !selected.includes(project.id)));
          setSelected([]);
        }}
      />
    </Column>
  );
}

export default function SelectAndBulkActions() {
  // An application has one ToastProvider at its root; the example brings its own.
  return (
    <ToastProvider>
      <Projects />
    </ToastProvider>
  );
}

const initialProjects = [
  { id: 'website-refresh', name: 'Website refresh', owner: 'Priya Shah' },
  { id: 'quarterly-report', name: 'Quarterly report', owner: 'Sam Lee' },
  { id: 'onboarding-guide', name: 'Onboarding guide', owner: 'Jordan Kim' },
  { id: 'data-migration', name: 'Data migration', owner: 'Maria Garcia' },
  { id: 'annual-review', name: 'Annual review', owner: 'Alex Morgan' },
];
