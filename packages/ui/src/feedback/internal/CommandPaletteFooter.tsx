import type { ReactNode } from 'react';
import { Kbd } from '../../content/Kbd.js';
import { Row } from '../../foundations/Layout.js';
import type { CommandPaletteHint } from '../CommandPalette.js';
import '../../styles/Base.css';
// The options' ListRow.css ties with the palette's rules, so it comes first in any bundle.
import '../../styles/ListRow.css';
import '../../styles/CommandPalette.css';

/**
 * CommandPalette's key hints and footer content, below the list; none shows without either. A hint
 * for Enter, alone or with a modifier, chooses the highlighted option: with no option to choose,
 * while results load or when nothing matches, it would promise what can't run, so it hides.
 */
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
          <span>{hint.label}</span>
        </Row>
      ))}
      {footer != null && <span className="env-command-palette-footer-content">{footer}</span>}
    </Row>
  );
}
