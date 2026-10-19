import { Pager } from '@envsemble/envui';

export default function ComposedParts() {
  return (
    <Pager.Root aria-label="Release notes">
      <Pager.Previous href="/releases/2026-09">September release</Pager.Previous>
      <Pager.Next href="/releases/2026-11">November release</Pager.Next>
    </Pager.Root>
  );
}
