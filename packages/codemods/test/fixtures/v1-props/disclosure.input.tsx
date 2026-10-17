import { Disclosure } from '@envsemble/envui';

export const Details = ({ remember }: { remember: (open: boolean) => void }) => (
  <Disclosure title="Advanced" onToggle={(event) => remember(event.currentTarget.open)}>
    Settings for administrators.
  </Disclosure>
);
