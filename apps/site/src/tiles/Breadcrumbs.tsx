import { Breadcrumbs } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const link = (index: number) => `.env-breadcrumbs-item:nth-child(${index}) > .env-breadcrumbs-link`;

/** Along the trail: each level before the current page shows it leads back there. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: link(1), y: 0.6 },
  { wait: 700 },
  { to: link(2), y: 0.6, duration: 450 },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

/** A tile's links lead nowhere. */
const stay = (event: { preventDefault: () => void }) => event.preventDefault();

/** A trail of three levels, the last the current page. */
export default function BreadcrumbsTile() {
  usePointer(script);
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/', onClick: stay },
        { label: 'Plans', href: '/plans', onClick: stay },
        { label: 'Roadmap' },
      ]}
    />
  );
}
