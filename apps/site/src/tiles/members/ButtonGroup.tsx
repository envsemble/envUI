import { Button, ButtonGroup, Column, IconButton } from '@envsemble/envui';
import { IconExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { usePointer, type PointerStep } from '../../motion/Motion';

/** Along the connected buttons to Edit, then to the split button's menu button. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button-group:first-child > :nth-child(2)' },
  { wait: 1100 },
  { to: '[aria-label="More publish options"]', duration: 500 },
  { wait: 900 },
  { leave: true },
  { wait: 600 },
];

/**
 * Two groups of connected buttons: three actions of a project, and a split button, Publish with
 * the menu button of its other options.
 */
export default function ButtonGroupTile() {
  usePointer(script);
  return (
    <Column gap={4} align="center">
      <ButtonGroup aria-label="Project actions">
        <Button variant="secondary">Open</Button>
        <Button variant="secondary">Edit</Button>
        <Button variant="secondary">Share</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Publish">
        <Button>Publish</Button>
        <IconButton variant="primary" icon={<IconExpandMore />} aria-label="More publish options" />
      </ButtonGroup>
    </Column>
  );
}
