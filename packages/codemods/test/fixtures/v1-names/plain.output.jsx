import { Alert, Menu } from '@envsemble/envui';

export function Banner({ children }) {
  return (
    <Alert tone="info">
      {children}
      <Menu.Item>Dismiss</Menu.Item>
    </Alert>
  );
}
