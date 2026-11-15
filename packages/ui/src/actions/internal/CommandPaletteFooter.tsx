import type { ReactNode } from 'react';
import { Kbd } from '../../content/Kbd.js';
import { Slot } from '../../internal/layout/Slot.js';
import { Row } from '../../layout/Layout.js';
import type { CommandPaletteHint } from '../CommandPalette.js';
import '../../styles/Base.css';
import '../../styles/ListRow.css';
import '../../styles/CommandPalette.css';

export function CommandPaletteFooter({
  hints,
  footer,
  empty,
}: {
  hints: readonly CommandPaletteHint[] | undefined;
  footer: ReactNode;
  empty: boolean;
}) {
  const shownHints = empty ? hints?.filter((hint) => !hint.keys.includes('Enter')) : hints;
  if (!shownHints?.length && footer == null) return null;
  return (
    <Row wrap align="center" className="env-command-palette-footer">
      {shownHints?.map((hint, hintIndex) => (
        <Row
          key={hintIndex}
          render={<span />}
          align="center"
          gap={2}
          className="env-command-palette-hint"
        >
          <Kbd keys={hint.keys} />
          <Slot className="env-command-palette-hint-label" element="span">
            {hint.label}
          </Slot>
        </Row>
      ))}
      {footer != null && (
        <Slot className="env-command-palette-footer-content" element="span">
          {footer}
        </Slot>
      )}
    </Row>
  );
}
