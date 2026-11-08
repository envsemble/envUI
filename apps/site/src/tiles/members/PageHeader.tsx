import { Button, PageHeader } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import type { TileWindow } from '../Tiles';

/** The pointer on the page's action, which takes its hover fill. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-page-header .env-button', x: 0.4 },
  { wait: 1400 },
  { leave: true },
  { wait: 800 },
];

/** A larger window than the tiles' (Tile.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 16, height: 12 };

/** A page's header: its title, a sentence under it and its action at the end of the title's row. */
export default function PageHeaderTile() {
  usePointer(script);
  return (
    <PageHeader
      headingLevel={3}
      title="Projects"
      description="Your team's work."
      actions={<Button startIcon={<IconAdd />}>New project</Button>}
      style={{ inlineSize: '15rem' }}
    />
  );
}
