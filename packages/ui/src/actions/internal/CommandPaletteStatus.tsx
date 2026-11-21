'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
import type { ReactNode } from 'react';
import { commandPalette } from '../../foundations/messages/commandPalette.js';
import { EmptyState } from '../../feedback/EmptyState.js';
import { useMessages } from '../../internal/provider/EnvUIContext.js';
import { flag } from '../../internal/flag.js';
import { useFormatters } from '../../internal/provider/useFormatters.js';
import type { CommandPaletteProps } from '../CommandPalette.js';
import '../../styles/Base.css';
import '../../styles/ListRow.css';
import '../../styles/EmptyState.css';
import '../../styles/CommandPalette.css';

type CommandPaletteMessages = typeof commandPalette;

function emptyTitle(query: string, emptyLabel: ReactNode, messages: CommandPaletteMessages) {
  if (emptyLabel != null) return emptyLabel;
  return query === '' ? messages.emptyQuery : messages.empty;
}

function emptyHint(query: string, emptyDescription: ReactNode, messages: CommandPaletteMessages) {
  if (emptyDescription !== undefined) return emptyDescription;
  return query === '' ? null : messages.emptyHint({ query });
}

export function CommandPaletteStatus({
  count,
  query,
  loading,
  loadingLabel,
  emptyLabel,
  emptyDescription,
  emptyIcon,
}: Pick<CommandPaletteProps, 'loadingLabel' | 'emptyLabel' | 'emptyDescription' | 'emptyIcon'> & {
  count: number;
  query: string;
  loading: boolean;
}) {
  const messages = useMessages('commandPalette', commandPalette);
  const number = useFormatters().number();
  const empty = count === 0;
  const loadingTitle = loadingLabel ?? messages.loading;
  const shown = () => {
    if (!empty)
      return loading ? loadingTitle : messages.results({ count, countText: number.format(count) });
    if (loading) return <EmptyState icon={null} title={loadingTitle} description={null} />;
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle(query, emptyLabel, messages)}
        description={emptyHint(query, emptyDescription, messages)}
      />
    );
  };
  return (
    <BaseAutocomplete.Status className="env-command-palette-status" data-empty={flag(empty)}>
      {shown()}
    </BaseAutocomplete.Status>
  );
}
