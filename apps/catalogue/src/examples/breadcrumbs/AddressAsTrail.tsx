import { Breadcrumbs } from '@envsemble/envui';

export default function AddressAsTrail() {
  // The trail follows the address, from the domain, instead of what people know as the top.
  return (
    <Breadcrumbs
      items={[
        { label: 'example.com', href: '/' },
        { label: 'app', href: '/app' },
        { label: 'ws-4821', href: '/app/ws-4821' },
        { label: 'plans', href: '/app/ws-4821/plans' },
        { label: 'Interview notes' },
      ]}
    />
  );
}
