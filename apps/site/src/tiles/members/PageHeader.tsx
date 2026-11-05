import { Button, PageHeader } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { usePointer, type PointerStep } from '../../motion/Motion';

/** The page's action reached and pressed. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-page-header .env-button', x: 0.4 },
  { wait: 500 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 800 },
];

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
