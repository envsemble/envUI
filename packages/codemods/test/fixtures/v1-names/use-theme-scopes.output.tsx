import { useTheme } from '@envsemble/envui';

export function Block({ x, other }: { x: boolean; other: () => { contrast: string } }) {
  const theme = useTheme().theme;
  if (x) {
    const theme = other();
    console.log(theme.contrast);
  }
  return theme === 'dark';
}

export function Loop({ items }: { items: { theme: string }[] }) {
  const t = useTheme().theme;
  for (const t of items) console.log(t.theme);
  return t === 'dark';
}

export function Closure() {
  const t = useTheme();
  const read = () => t.contrast;
  return read();
}
