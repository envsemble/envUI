import { Notice, MenuItem } from '@envsemble/envui';

export function Banner({ children }) {
  return (
    <Notice tone="info">
      {children}
      <MenuItem>Dismiss</MenuItem>
    </Notice>
  );
}
