// @ts-expect-error -- Tree is not exported by the installed version
import { Input, Tree } from '@envsemble/envui';

export const form = (
  <Tree>
    <Input label="Name" />
  </Tree>
);
