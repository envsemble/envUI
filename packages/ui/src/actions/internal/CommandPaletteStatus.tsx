'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import type { ReactNode } from 'react';
import { commandPalette } from '../../foundations/messages/commandPalette.js';
import { DecorativeIcon } from '../../internal/icon/DecorativeIcon.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { flag } from '../../internal/flag.js';
import { useFormatters } from '../../internal/provider/useFormatters.js';
import type { CommandPaletteProps } from '../CommandPalette.js';
import '../../styles/Base.css';
// The options' ListRow.css ties with the palette's rules, so it comes first in any bundle.
import '../../styles/ListRow.css';
import '../../styles/CommandPalette.css';

/**
 * CommandPalette's one polite status: the number of results as they change, or the loading label
 * while they load, read by assistive technology only, or the empty state, one muted line in place
 * of the list, so the palette keeps about its height: its title and description are announced,
 * and its icon is decorative.
 */
export function CommandPaletteStatus({
  count,
  query,
  loading,
  loadingLabel,
  emptyLabel,
  emptyDescription,
  emptyIcon,
}: Pick<CommandPaletteProps, 'loadingLabel' | 'emptyLabel' | 'emptyDescription' | 'emptyIcon'> & {
  /** How many options show. */
  count: number;
  /** The search text, trimmed. */
  query: string;
  loading: boolean;
}) {
  const messages = useMessages('commandPalette', commandPalette);
  const number = useFormatters().number();
  const empty = count === 0;
  return (
    <BaseAutocomplete.Status className="env-command-palette-status" data-empty={flag(empty)}>
      {empty ? (
        <EmptyState
          query={query}
          loading={loading}
          loadingLabel={loadingLabel}
          emptyLabel={emptyLabel}
          emptyDescription={emptyDescription}
          emptyIcon={emptyIcon}
        />
      ) : loading ? (
        (loadingLabel ?? messages.loading)
      ) : (
        messages.results({ count, countText: number.format(count) })
      )}
    </BaseAutocomplete.Status>
  );
}

/**
 * With no options, the empty state invites a search before people type, and says what to try when
 * the text finds nothing. While loading, its line says so, with no icon: the spinner is at the
 * search field's end.
 */
function EmptyState({
  query,
  loading,
  loadingLabel,
  emptyLabel,
  emptyDescription,
  emptyIcon,
}: {
  query: string;
  loading: boolean;
  loadingLabel: ReactNode;
  emptyLabel: ReactNode;
  emptyDescription: ReactNode;
  emptyIcon: ReactNode;
}) {
  const messages = useMessages('commandPalette', commandPalette);
  const typed = query !== '';
  const icon = loading ? null : emptyIcon;
  const title = loading
    ? (loadingLabel ?? messages.loading)
    : (emptyLabel ?? (typed ? messages.empty : messages.emptyQuery));
  const description = loading
    ? null
    : emptyDescription === undefined
      ? typed
        ? messages.emptyHint({ query })
        : null
      : emptyDescription;
  return (
    <>
      {icon != null && icon !== false && (
        <span className="env-command-palette-empty-icon">
          <DecorativeIcon>{icon}</DecorativeIcon>
        </span>
      )}
      <span className="env-command-palette-empty-title">{title}</span>
      {description != null && description !== false && (
        <>
          {/* A space between the lines, so they are read as two. */}{' '}
          <span className="env-command-palette-empty-description">{description}</span>
        </>
      )}
    </>
  );
}
