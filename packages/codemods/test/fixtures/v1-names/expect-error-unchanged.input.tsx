// @ts-expect-error -- Sidebar is not exported by the installed version
import { Input, Sidebar } from '@envsemble/envui';

export const form = (
  <Sidebar>
    <Input label="Name" />
  </Sidebar>
);
