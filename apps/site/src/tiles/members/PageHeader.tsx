import { Button, PageHeader } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import type { TileWindow } from '../Tiles';

const script: PointerStep[] = [
  { wait: 180 },
  { to: '.env-page-header .env-button', x: 0.4 },
  { wait: 840 },
  { leave: true },
  { wait: 480 },
];

export const tileWindow: TileWindow = { width: 16, height: 12 };

export default function PageHeaderTile() {
  usePointer(script);
  return (
    <PageHeader
      headingLevel={3}
      title="Projects"
      description="Your team's work."
      actions={<Button start={<IconAdd />}>New project</Button>}
      style={{ inlineSize: '15rem' }}
    />
  );
}
