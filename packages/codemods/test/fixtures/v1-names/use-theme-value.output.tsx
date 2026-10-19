import { createContext } from 'react';
import { Select, useTheme } from '@envsemble/envui';

const Scheme = createContext<unknown>(null);
const options = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function Picker() {
  return <Select label="Theme" options={options} value={useTheme().theme} />;
}

export function HeldPicker() {
  const t = useTheme().theme;
  return <Select label="Theme" options={options} value={t} />;
}

export function SchemeScope({ children }: { children: React.ReactNode }) {
  return <Scheme value={useTheme()}>{children}</Scheme>;
}

export function Wrapped({ children }: { children: React.ReactNode }) {
  return <SchemeProvider value={useTheme()}>{children}</SchemeProvider>;
}

function SchemeProvider({ value, children }: { value: unknown; children: React.ReactNode }) {
  return <Scheme value={value}>{children}</Scheme>;
}
