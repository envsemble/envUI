import { Input, MenuItem } from '@envsemble/envui';

export function Wrapper({ MenuItem: Item, Input }: { MenuItem: typeof MenuItem; Input: string }) {
  return <Item>{Input}</Item>;
}

export function Field() {
  return <Input label="Name" />;
}

export function Custom() {
  const MenuItem = 'li';
  return <MenuItem>Contoso</MenuItem>;
}
