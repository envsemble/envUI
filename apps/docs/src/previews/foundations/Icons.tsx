import { useMemo, useRef, useState } from 'react';
import { Text, BrandLogo, EnvUILogo, Stack, Input, Button, ActionGroup } from '@envsemble/envui';
// The offline catalogue consumes every public symbol. Products use individual imports.
import * as symbols from '@envsemble/envui/icons';
import { Code } from '../../Code';
import { Example, SpecimenGrid } from '../Example';

const normalizeName = (name: string) => name.toLowerCase().replace(/[\s_-]/g, '');
const catalogue = Object.entries(symbols)
  .sort(([first], [second]) => first.localeCompare(second, undefined, { numeric: true }))
  .map(([name, Symbol]) => ({ name, Symbol, searchName: normalizeName(name) }));
const pageSize = 24;

function IconCatalogue() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedName, setSelectedName] = useState('Home');
  const [copyMessage, setCopyMessage] = useState('');
  const importElement = useRef<HTMLDivElement>(null);
  const matches = useMemo(() => {
    const search = normalizeName(query.trim());
    return catalogue.filter(({ searchName }) => searchName.includes(search));
  }, [query]);
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const visibleSymbols = matches.slice(page * pageSize, (page + 1) * pageSize);
  const SelectedSymbol = symbols[selectedName as keyof typeof symbols];
  const importCode = `import { ${selectedName} } from '@envsemble/envui/icons/${selectedName}';`;

  async function copyImport() {
    try {
      await navigator.clipboard.writeText(importCode);
      setCopyMessage('Import copied.');
    } catch {
      // Clipboard access can be unavailable in a downloaded file.
      const code = importElement.current?.querySelector('code');
      const selection = window.getSelection();
      if (code && selection) {
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setCopyMessage('Clipboard unavailable. Copy the selected import manually.');
    }
  }

  return (
    <Example title="Material Symbols Rounded" size="collection">
      <Input
        className="docs-icon-search"
        label="Find an icon"
        type="search"
        value={query}
        placeholder="Name, such as arrow_back or ArrowBack"
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(0);
        }}
      />
      <Stack gap={3} className="docs-icon-import">
        <Text as="h3" variant="section-heading">
          {selectedName}
        </Text>
        <div className="docs-icon-pair">
          <SelectedSymbol width="1.5rem" height="1.5rem" />
          <SelectedSymbol filled width="1.5rem" height="1.5rem" />
        </div>
        <Text variant="caption">Outline / filled</Text>
        <div ref={importElement}>
          <Code>{importCode}</Code>
        </div>
        <ActionGroup>
          <Button variant="secondary" onClick={copyImport}>
            Copy import
          </Button>
          <Text variant="caption" role="status">
            {copyMessage}
          </Text>
        </ActionGroup>
      </Stack>
      <Text variant="caption" role="status">
        {matches.length} of {catalogue.length} exports. Select a symbol to view its import.
      </Text>
      {matches.length ? (
        <ul className="docs-icon-catalogue" aria-label="Icon catalogue">
          {visibleSymbols.map(({ name, Symbol }) => (
            <li key={name}>
              <Button
                variant="secondary"
                startIcon={<Symbol />}
                aria-pressed={selectedName === name}
                onClick={() => {
                  setSelectedName(name);
                  setCopyMessage('');
                }}
              >
                {name}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <Text>No matching icons. Try another name.</Text>
      )}
      <ActionGroup>
        <Button variant="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous symbols
        </Button>
        <Text variant="caption">
          Page {page + 1} of {pageCount}
        </Text>
        <Button
          variant="secondary"
          disabled={page + 1 >= pageCount}
          onClick={() => setPage(page + 1)}
        >
          Next symbols
        </Button>
      </ActionGroup>
    </Example>
  );
}

export function IconsPreview() {
  return (
    <>
      <IconCatalogue />
      <Example title="Brand identity">
        <SpecimenGrid size="compact">
          <Stack gap={3}>
            <EnvUILogo className="docs-brand-specimen" />
            <Text variant="caption">envUI</Text>
          </Stack>
          <Stack gap={3}>
            <BrandLogo className="docs-brand-specimen" />
            <Text variant="caption">envsemble</Text>
          </Stack>
        </SpecimenGrid>
        <Text tone="muted">
          React lockups inherit the theme's text color. Raw SVGs and favicons use fixed colors.
        </Text>
        <Code>{`import logoUrl from '@envsemble/envui/assets/envUI/envUI-lockup-black.svg';
import faviconUrl from '@envsemble/envui/assets/envUI/envUI-favicon.ico';`}</Code>
        <Text variant="caption">
          White versions: envUI-lockup-white.svg and envUI-favicon-white.ico in the same folder. The
          raw envsemble logo is exported at @envsemble/envui/assets/envsemble-lockup-black.svg.
        </Text>
      </Example>
    </>
  );
}
