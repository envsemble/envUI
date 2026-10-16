import { createPortal } from 'react-dom';
import { Theme, useTheme } from '@envsemble/envui';
import * as ui from '@envsemble/envui';
import { ThemeProvider } from 'other-library';

export function Portal({ children }: { children: React.ReactNode }) {
  return createPortal(<Theme theme={useTheme()}>{children}</Theme>, document.body);
}

export function HighPortal({ children }: { children: React.ReactNode }) {
  return <Theme contrast="high" className="portal" theme={useTheme()}>{children}</Theme>;
}

export function NamespacePortal({ children }: { children: React.ReactNode }) {
  return <ui.Theme theme={ui.useTheme()}>{children}</ui.Theme>;
}

export function Other({ children }: { children: React.ReactNode }) {
  const dark = useTheme() === 'dark';
  return <ThemeProvider theme={useTheme()} dark={dark}>{children}</ThemeProvider>;
}
