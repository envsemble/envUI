import { useRef, useState } from 'react';
import { Button, Checkbox, List, Popover, Column, Row, Text, Badge } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import { IconSearchOff } from '@envsemble/envui/icons/SearchOff';

const documentCount = (count: number) => (count === 1 ? '1 document' : `${count} documents`);

export default function FilterPanel() {
  // The values of the boxes checked, such as report and Sam Lee.
  const [filters, setFilters] = useState<string[]>(['report']);
  const first = useRef<HTMLInputElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const types = filters.filter((value) => value in typeLabels);
  const editors = filters.filter((value) => !(value in typeLabels));
  const applied = filters.length;

  const shown = documents.filter(
    (document) =>
      (types.length === 0 || types.includes(document.type)) &&
      (editors.length === 0 || editors.includes(document.editor)),
  );

  return (
    <Column gap={4}>
      <Row ref={toolbar} wrap align="center" justify="between" gap={3}>
        <Popover
          title="Filter documents"
          align="start"
          trigger={
            <Button variant="secondary" size="sm" startIcon={<IconFilterList />}>
              Filters
              {/* The count of filters in use; its label says what the number counts. */}
              {applied > 0 && <Badge count={applied} aria-label={`${applied} in use`} />}
            </Button>
          }
        >
          {/* Each box filters the list at once: no Apply button, and the popover stays open. */}
          <Column gap={5}>
            {groups.map((group, index) => (
              // envUI has no checkbox group yet: a fieldset and its legend name the choices, and
              // are read with each one, as RadioGroup's are.
              <fieldset
                key={group.legend}
                style={{ minInlineSize: 0, margin: 0, padding: 0, border: 0 }}
              >
                {/* The legend keeps RadioGroup's space below it. */}
                <legend style={{ padding: 0, marginBlockEnd: 'var(--env-space-3)' }}>
                  {group.legend}
                </legend>
                <Column gap={2}>
                  {group.options.map((option, position) => (
                    <Checkbox
                      key={option.value}
                      ref={index === 0 && position === 0 ? first : undefined}
                      label={option.label}
                      checked={filters.includes(option.value)}
                      onCheckedChange={(checked) =>
                        setFilters((current) =>
                          checked
                            ? [...current, option.value]
                            : current.filter((value) => value !== option.value),
                        )
                      }
                    />
                  ))}
                </Column>
              </fieldset>
            ))}
            {filters.length > 0 && (
              <Column gap={4} align="start">
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => {
                    setFilters([]);
                    // The button goes with the filters, so focus moves to the first box.
                    first.current?.focus();
                  }}
                >
                  Clear filters
                </Button>
              </Column>
            )}
          </Column>
        </Popover>
        <Text role="status" variant="body-sm" emphasis="muted">
          {documentCount(shown.length)}
        </Text>
      </Row>
      {shown.length > 0 ? (
        <List.Root aria-label="Documents">
          {shown.map((document) => (
            <List.Item
              key={document.name}
              label={document.name}
              description={`${typeLabels[document.type]} · ${document.editor}`}
            />
          ))}
        </List.Root>
      ) : (
        <Column gap={4} padding={5}>
          <Text render={<span />} emphasis="muted">
            <IconSearchOff width="1.5rem" height="1.5rem" />
          </Text>
          <Column gap={2}>
            <Text render={<h4 />} variant="title">
              No matching documents
            </Text>
            <Text variant="body-sm">No documents match these filters.</Text>
          </Column>
          <Button
            variant="secondary"
            onClick={() => {
              setFilters([]);
              // The empty state goes with the filters, so focus moves to the Filters button.
              toolbar.current?.querySelector('button')?.focus();
            }}
          >
            Clear filters
          </Button>
        </Column>
      )}
    </Column>
  );
}

const typeLabels: Record<string, string> = { report: 'Report', plan: 'Plan', notes: 'Notes' };

const groups = [
  {
    legend: 'Type',
    options: [
      { value: 'report', label: 'Reports' },
      { value: 'plan', label: 'Plans' },
      { value: 'notes', label: 'Notes' },
    ],
  },
  {
    legend: 'Edited by',
    options: ['Alex Morgan', 'Priya Shah', 'Sam Lee'].map((name) => ({ value: name, label: name })),
  },
];

const documents = [
  { name: 'Quarterly report', type: 'report', editor: 'Sam Lee' },
  { name: 'Annual review', type: 'report', editor: 'Alex Morgan' },
  { name: 'Launch plan', type: 'plan', editor: 'Priya Shah' },
  { name: 'Data migration plan', type: 'plan', editor: 'Sam Lee' },
  { name: 'Kick-off notes', type: 'notes', editor: 'Priya Shah' },
  { name: 'Interview notes', type: 'notes', editor: 'Alex Morgan' },
];
