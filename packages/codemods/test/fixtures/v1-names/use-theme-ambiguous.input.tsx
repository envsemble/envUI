import { createContext } from 'react';
import { useTheme } from '@envsemble/envui';

const SchemeContext = createContext<unknown>(null);

export function useAppTheme() {
  return useTheme();
}

export const useArrowTheme = () => useTheme();

export function Provider({ children }: { children: React.ReactNode }) {
  return <SchemeContext value={useTheme()}>{children}</SchemeContext>;
}

export function LegacyProvider({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <SchemeContext.Provider value={t}>{children}</SchemeContext.Provider>;
}

export function Returned() {
  const t = useTheme();
  return t;
}

export function Field() {
  return <input value={useTheme()} readOnly />;
}
