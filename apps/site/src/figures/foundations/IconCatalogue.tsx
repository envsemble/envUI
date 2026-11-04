import { useId, useMemo, useRef, useState } from 'react';
import { Button, SearchField, Column, Row, Switch, Text, Sheet } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
// This browser of every icon loads the full set, from the library's generated list of them, which
// the package doesn't export: applications import each icon by its own path. The site's Vite
// config and tsconfig point envui-icon-list at packages/ui/src/icons/index.ts.
import * as symbols from 'envui-icon-list';
import { Example } from '../Example';
import { iconPageSize as pageSize } from './Icons';

const normalizeName = (name: string) => name.toLowerCase().replace(/[\s_-]/g, '');
/** An icon's module, its name without the prefix: IconAdd is icons/Add, Icon10k icons/10k. */
const moduleName = (name: string) => name.replace(/^Icon/, '');
const displayName = (name: string) =>
  moduleName(name)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
const commonNames = [
  'IconSearch',
  'IconHome',
  'IconMenu',
  'IconClose',
  'IconSettings',
  'IconCheckCircle',
  'IconFavorite',
  'IconAdd',
  'IconDelete',
  'IconArrowBack',
  'IconStar',
  'IconChevronRight',
  'IconArrowForward',
  'IconMoreVert',
  'IconCheck',
  'IconInfo',
  'IconWarning',
  'IconError',
  'IconDownload',
  'IconUpload',
  'IconEdit',
  'IconFolder',
  'IconPerson',
  'IconHelp',
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

function IconDetails({ name, filled }: { name: keyof typeof symbols; filled: boolean }) {
  const Symbol = symbols[name];

  return (
    <Column gap={5}>
      <Column gap={3}>
        <Text variant="caption">Material Symbols Rounded · {filled ? 'Filled' : 'Outline'}</Text>
        <div className="catalogue-icon-detail-preview">
          <Symbol filled={filled} width="4rem" height="4rem" />
        </div>
      </Column>
      <Text variant="caption">Inherits the surrounding text color.</Text>
      {/* The code to use it, as under every example. */}
      <CodeBlock language="tsx" label="React import" copyable>
        {`import { ${name} } from '@envsemble/envui/icons/${moduleName(name)}';

<${name}${filled ? ' filled' : ''} />`}
      </CodeBlock>
    </Column>
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
      <div className="catalogue-icon-toolbar">
        <SearchField
          variant="floating"
          label="Search icons"
          showLabel
          value={query}
          onValueChange={(next) => {
            setQuery(next);
            setPage(0);
          }}
        />
        <Switch label="Filled icons" checked={filled} onCheckedChange={setFilled} />
      </div>
      {matches.length ? (
        <ul className="catalogue-icon-catalogue" aria-label="Icon catalogue">
          {visibleSymbols.map(({ name, label, Symbol }) => (
            <li key={name}>
              <button
                type="button"
                className="catalogue-icon-tile"
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
                <Text
                  render={<span />}
                  variant="caption"
                  emphasis="default"
                  className="catalogue-icon-label"
                  title={label}
                >
                  {label}
                </Text>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Text>No matching icons. Try another name.</Text>
      )}
      {pageCount > 1 && (
        <Row wrap align="center" gap={4}>
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
        </Row>
      )}
      <Sheet
        id={detailsId}
        className="catalogue-icon-details"
        title={selectedName ?? 'Icon details'}
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
      </Sheet>
    </Example>
  );
}
