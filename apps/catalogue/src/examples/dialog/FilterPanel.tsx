import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  List,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
} from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';

const projects = [
  { name: 'Northwind launch', status: 'active', owner: 'Priya Shah' },
  { name: 'Hiring guide', status: 'active', owner: 'Alex Morgan' },
  { name: 'Office move', status: 'paused', owner: 'Alex Morgan' },
  { name: 'Budget 2027', status: 'active', owner: 'Sam Lee' },
  { name: 'Support rota', status: 'done', owner: 'Priya Shah' },
];

const owners = [
  { value: 'anyone', label: 'Anyone' },
  { value: 'Alex Morgan', label: 'Alex Morgan' },
  { value: 'Priya Shah', label: 'Priya Shah' },
  { value: 'Sam Lee', label: 'Sam Lee' },
];

export default function FilterPanel() {
  const [status, setStatus] = useState('any');
  const [owner, setOwner] = useState('anyone');
  const shown = projects.filter(
    (project) =>
      (status === 'any' || project.status === status) &&
      (owner === 'anyone' || project.owner === owner),
  );
  return (
    <Stack align="start">
      <Dialog
        placement="right"
        trigger={
          <Button variant="secondary" startIcon={<FilterList />}>
            Filters
          </Button>
        }
        title="Filters"
        closeLabel="Close filters"
        actions={
          <>
            <Button
              variant="text"
              onClick={() => {
                setStatus('any');
                setOwner('anyone');
              }}
            >
              Clear filters
            </Button>
            <DialogClose variant="primary">
              Show {shown.length} {shown.length === 1 ? 'project' : 'projects'}
            </DialogClose>
          </>
        }
      >
        <Stack gap={5}>
          <RadioGroup variant="rows" label="Status" value={status} onValueChange={setStatus}>
            <Radio value="any" label="Any status" />
            <Radio value="active" label="Active" />
            <Radio value="paused" label="Paused" />
            <Radio value="done" label="Done" />
          </RadioGroup>
          <Select
            variant="outlined"
            label="Owner"
            options={owners}
            value={owner}
            onValueChange={(value) => setOwner(value ?? 'anyone')}
          />
        </Stack>
      </Dialog>
      {/* The list takes the width of a column of the page. */}
      {shown.length > 0 ? (
        <List.Root aria-label="Projects" style={{ inlineSize: 'min(100%, 24rem)' }}>
          {shown.map((project) => (
            <List.Item key={project.name} title={project.name} detail={project.owner} />
          ))}
        </List.Root>
      ) : (
        <Text tone="muted">No projects match these filters.</Text>
      )}
    </Stack>
  );
}
