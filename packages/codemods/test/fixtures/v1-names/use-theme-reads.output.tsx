import { Theme, useTheme, useTheme as useEnvTheme } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export function Badge() {
  const theme = useTheme().theme;
  const label = theme === 'dark' ? 'Night' : 'Day';
  return <span className={`t-${useTheme().theme}`}>{label}</span>;
}

export function Portal({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  const theme = useTheme().theme;
  return (
    <>
      <Theme theme={theme}>{children}</Theme>
      <Theme theme={dark ? 'dark' : useTheme().theme}>{children}</Theme>
    </>
  );
}

export function Aliased() {
  return useEnvTheme().theme === 'dark' ? <ui.Theme theme="light" /> : null;
}

export function Namespaced() {
  const scheme: string = ui.useTheme().theme;
  return scheme.toUpperCase();
}

export function Present() {
  return useTheme() != null && useTheme() !== undefined;
}

export function Shadowed() {
  const useTheme = () => 'dark';
  return useTheme() === 'dark';
}

export function AlreadyMigrated({ children }: { children: React.ReactNode }) {
  const current = useTheme();
  const { contrast } = useTheme();
  const shown = `${useTheme().theme} ${contrast}`;
  return (
    <Theme {...current} className={current.contrast}>
      {shown}
      {children}
    </Theme>
  );
}
