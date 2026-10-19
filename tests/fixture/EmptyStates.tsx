import { Button, EmptyState, Theme, type ThemeValue } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Inbox } from '@envsemble/envui/icons/Inbox';

/** Centred empty states taking the place of a region's content, mounted with ?fixture=empty-states. */
export function EmptyStatesFixture({ theme }: { theme: ThemeValue }) {
  return (
    <Theme theme={theme} data-testid={`empty-${theme}`} className="fixture-section">
      <div data-testid={`empty-region-${theme}`} style={{ display: 'grid', blockSize: '30rem' }}>
        <EmptyState
          align="center"
          icon={<Inbox />}
          headingLevel={2}
          title={`No submissions yet ${theme}`}
          description="Responses to this form appear here as people submit it."
          action={<Button startIcon={<Add />}>New form {theme}</Button>}
        />
      </div>
      <EmptyState
        align="center"
        tone="danger"
        data-testid={`empty-error-${theme}`}
        title={`Submissions unavailable ${theme}`}
        description="Try again."
      />
      <EmptyState
        data-testid={`empty-start-${theme}`}
        icon={<Inbox />}
        title={`Nothing here ${theme}`}
      />
    </Theme>
  );
}
