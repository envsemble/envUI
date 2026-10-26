import { Button, Checkbox, Column, IconButton, Row, TextField } from '@envsemble/envui';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import type { FoundationFigure } from './FoundationFigures';
import { Figure } from './Topic';

/*
 * The figures of the Accessibility foundation. Its words are in docs/foundations/accessibility.md,
 * the page's one source, which places each figure by name and gives it its caption.
 */

/** A small form to move through with the keyboard: the focus ring shows where it is. */
function KeyboardFigure({ caption }: { caption?: string }) {
  return (
    <Figure label="Move through a form with the keyboard" caption={caption}>
      <Column gap={4} className="catalogue-keyboard-sample">
        <TextField label="Report title" defaultValue="Quarterly report" />
        <Checkbox label="Share with the team" defaultChecked />
        <Row gap={2} justify="end" align="center">
          <IconButton variant="ghost" icon={<MoreVert />} aria-label="More options" />
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </Row>
      </Column>
    </Figure>
  );
}

/** The figures docs/foundations/accessibility.md places, by name. */
export const accessibilityFigures: Record<string, FoundationFigure> = {
  Keyboard: { render: KeyboardFigure },
};
