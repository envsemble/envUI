import { useTheme } from '@envsemble/envui';

export function Cast() {
  const t = useTheme() as any;
  return t.theme;
}

export function NonNull() {
  const t = useTheme()!;
  return t.contrast;
}

export function Satisfies() {
  const t = useTheme() satisfies object;
  return t.theme;
}

export function Parenthesized() {
  const t = (useTheme());
  return (t as { contrast: string }).contrast;
}

export function Conditional({ own, fallback }: { own: boolean; fallback: { theme: string } }) {
  const { theme } = own ? useTheme() : fallback;
  const { contrast } = (useTheme() ?? fallback) as { contrast?: string };
  return `${theme} ${contrast}`;
}

export function Read() {
  return (useTheme() as any).contrast;
}

export function Scheme() {
  const t = useTheme().theme as string;
  return t === 'dark';
}
