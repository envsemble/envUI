import { EnvUIProvider, Pager } from '@envsemble/envui';

/**
 * A pager that mixes the previous prop with a Pager.Next child, and one whose strings come from
 * EnvUIProvider, mounted with ?fixture=pagers.
 */
export function PagersFixture() {
  return (
    <div data-testid="pagers">
      <Pager.Root aria-label="Mixed pager">
        <Pager.Previous href="#introduction">Introduction</Pager.Previous>
        <Pager.Next href="#setup">Setup</Pager.Next>
      </Pager.Root>
      <EnvUIProvider messages={{ pager: { label: 'Seiten', previous: 'Zurück', next: 'Weiter' } }}>
        <Pager.Root>
          <Pager.Previous href="#introduction">Einführung</Pager.Previous>
          <Pager.Next href="#setup">Einrichtung</Pager.Next>
        </Pager.Root>
      </EnvUIProvider>
    </div>
  );
}
