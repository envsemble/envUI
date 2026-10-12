import { useState } from 'react';
import { AppShell, NavigationItem } from '@envsemble/envui';
import { Home } from '@envsemble/envui/icons/Home';
import { Search } from '@envsemble/envui/icons/Search';

const files = Array.from({ length: 200 }, (_, index) => `Document ${index + 1}.md`);

/** A resizable shell with a self-scrolling list below the navigation and a sticky page header. */
export function ResizableShellFixture() {
  const [page, setPage] = useState('documents');
  const [widths, setWidths] = useState<number[]>([]);
  return (
    <AppShell
      brand={<span data-testid="brand">B</span>}
      title="Documents"
      navigationLabel="Resizable navigation"
      navigation={
        <>
          <NavigationItem
            icon={<Home />}
            selected={page === 'documents'}
            onClick={() => setPage('documents')}
          >
            Documents
          </NavigationItem>
          <NavigationItem
            icon={<Search />}
            selected={page === 'search'}
            onClick={() => setPage('search')}
          >
            Search
          </NavigationItem>
        </>
      }
      sidebarContent={
        <ul className="fixture-sidebar-list" data-testid="sidebar-list" aria-label="Files">
          {files.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      }
      resizable
      onSidebarWidthChange={(width) => setWidths((current) => [...current, width])}
      storageKey="fixture-resizable-sidebar"
      className="fixture-resizable-shell"
    >
      <header className="fixture-sticky-header" data-testid="sticky-header">
        Sticky document header
      </header>
      <output data-testid="width-changes">{widths.join(',')}</output>
      <div className="fixture-tall-page">
        {Array.from({ length: 60 }, (_, index) => (
          <p key={index}>Paragraph {index + 1}</p>
        ))}
      </div>
    </AppShell>
  );
}
