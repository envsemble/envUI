'use client';

import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete';
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
  const typed = query !== '';
  return (
    <BaseAutocomplete.Status className="env-command-palette-status" data-empty={flag(empty)}>
      {empty ? (
        <EmptyState
          icon={loading ? null : emptyIcon}
          title={
            loading
              ? (loadingLabel ?? messages.loading)
              : (emptyLabel ?? (typed ? messages.empty : messages.emptyQuery))
          }
          description={
            loading
              ? null
              : emptyDescription === undefined
                ? typed
                  ? messages.emptyHint({ query })
                  : null
                : emptyDescription
          }
        />
      ) : loading ? (
        (loadingLabel ?? messages.loading)
      ) : (
        messages.results({ count, countText: number.format(count) })
      )}
    </BaseAutocomplete.Status>
  );
}
