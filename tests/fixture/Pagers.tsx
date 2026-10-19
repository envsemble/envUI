import { EnvUIProvider, Pager } from '@envsemble/envui';

/**
 * A pager that mixes the previous prop with a Pager.Next child, and one whose strings come from
 * EnvUIProvider, mounted with ?fixture=pagers.
 */
export function PagersFixture() {
  return (
    <div data-testid="pagers">
      <Pager.Root
        aria-label="Mixed pager"
        previous={{ href: '#introduction', children: 'Introduction' }}
      >
        <Pager.Next href="#setup">Setup</Pager.Next>
      </Pager.Root>
      <EnvUIProvider messages={{ pager: { label: 'Seiten', previous: 'Zurück', next: 'Weiter' } }}>
        <Pager.Root
          previous={{ href: '#introduction', children: 'Einführung' }}
          next={{ href: '#setup', children: 'Einrichtung' }}
        />
      </EnvUIProvider>
    </div>
  );
}
