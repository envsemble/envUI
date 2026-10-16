import { TextField, Menu } from '@envsemble/envui';

export function Wrapper({ MenuItem: Item, Input }: { MenuItem: typeof Menu.Item; Input: string }) {
  return <Item>{Input}</Item>;
}

export function Field() {
  return <TextField label="Name" />;
}

export function Custom() {
  const MenuItem = 'li';
  return <MenuItem>Contoso</MenuItem>;
}
