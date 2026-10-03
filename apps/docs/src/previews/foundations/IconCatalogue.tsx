import { useId, useMemo, useRef, useState } from 'react';
import {
  CodeBlock,
  ActionGroup,
  Button,
  Card,
  Dialog,
  Input,
  Stack,
  Switch,
  Text,
} from '@envsemble/envui';
// This offline browser consumes the full public catalogue. Products use per-icon imports.
import * as symbols from '@envsemble/envui/icons';
import { Example } from '../Example';

const normalizeName = (name: string) => name.toLowerCase().replace(/[\s_-]/g, '');
const displayName = (name: string) =>
  name
    .replace(/^Icon(?=\d)/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
const commonNames = [
  'Search',
  'Home',
  'Menu',
  'Close',
  'Settings',
  'CheckCircle',
  'Favorite',
  'Add',
  'Delete',
  'ArrowBack',
  'Star',
  'ChevronRight',
  'ArrowForward',
  'MoreVert',
  'Check',
  'Info',
  'Warning',
  'Error',
  'Download',
  'Upload',
  'Edit',
  'Folder',
  'Person',
  'Help',
];
const commonOrder = new Map(commonNames.map((name, index) => [name, index]));
const catalogue = Object.entries(symbols)
  .sort(
    ([first], [second]) =>
      (commonOrder.get(first) ?? Infinity) - (commonOrder.get(second) ?? Infinity) ||
      first.localeCompare(second, undefined, { numeric: true }),
  )
  .map(([name, Symbol]) => ({
    name,
    label: displayName(name),
    Symbol,
    searchName: normalizeName(name),
  }));
const pageSize = 72;

function IconDetails({ name, filled }: { name: keyof typeof symbols; filled: boolean }) {
  const Symbol = symbols[name];
  const importCode = `import { CodeBlock, ${name} }\n  from '@envsemble/envui/icons/${name}';`;

  return (
    <Stack gap={5}>
      <Stack gap={3}>
        <Text variant="caption">Material Symbols Rounded · {filled ? 'Filled' : 'Outline'}</Text>
        <div className="docs-icon-detail-preview">
          <Symbol filled={filled} width="4rem" height="4rem" />
        </div>
      </Stack>
      <Stack gap={3} as="section">
        <CodeBlock language="tsx" appearance="plain" wrap label="React import" copyable>
          {importCode}
        </CodeBlock>
      </Stack>
      <Stack gap={3} as="section">
        <Text as="h3" variant="section-heading">
          Usage
        </Text>
        <CodeBlock
          language="tsx"
          appearance="plain"
          wrap
        >{`<${name}${filled ? ' filled' : ''} />`}</CodeBlock>
        <Text variant="caption">Inherits the surrounding text color.</Text>
      </Stack>
    </Stack>
  );
}

export function IconCatalogue() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [filled, setFilled] = useState(false);
  const [selectedName, setSelectedName] = useState<keyof typeof symbols | null>(null);
  const selectedButton = useRef<HTMLButtonElement>(null);
  const detailsId = useId();
  const matches = useMemo(() => {
    const search = normalizeName(query.trim());
    return catalogue.filter(({ searchName }) => searchName.includes(search));
  }, [query]);
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const visibleSymbols = matches.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <Example size="collection">
      <div className="docs-icon-toolbar">
        <Input
          label="Search icons"
          type="search"
          value={query}
          placeholder="Icon name"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
        <Switch label="Filled icons" checked={filled} onCheckedChange={setFilled} />
      </div>
      {matches.length ? (
        <ul className="docs-icon-catalogue" aria-label="Icon catalogue">
          {visibleSymbols.map(({ name, label, Symbol }) => (
            <li key={name}>
              <Card
                as="button"
                tone={selectedName === name ? 'row' : 'canvas'}
                padding={4}
                className="docs-icon-tile"
                aria-label={label}
                aria-pressed={selectedName === name}
                aria-haspopup="dialog"
                aria-controls={selectedName === name ? detailsId : undefined}
                onClick={(event) => {
                  selectedButton.current = event.currentTarget;
                  setSelectedName((current) =>
                    current === name ? null : (name as keyof typeof symbols),
                  );
                }}
              >
                <Symbol filled={filled} width="2rem" height="2rem" />
                <Text as="span" variant="caption" tone="primary">
                  {label}
                </Text>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <Text>No matching icons. Try another name.</Text>
      )}
      {pageCount > 1 && (
        <ActionGroup>
          <Button variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Text variant="caption">
            Page {page + 1} of {pageCount}
          </Text>
          <Button
            variant="secondary"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </ActionGroup>
      )}
      <Dialog
        id={detailsId}
        className="docs-icon-details"
        title={selectedName ?? 'Icon details'}
        placement="right"
        modal={false}
        disablePointerDismissal
        open={selectedName !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedName(null);
        }}
        closeLabel="Close icon details"
        finalFocus={selectedButton}
      >
        {selectedName && <IconDetails key={selectedName} name={selectedName} filled={filled} />}
      </Dialog>
    </Example>
  );
}
