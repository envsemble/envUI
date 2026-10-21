import { PanelDock, TitleBar, WindowFrame } from '@envsemble/envui';
import type { TitleBarProps } from '@envsemble/envui';

export function Workspace({ panels, ...props }: PanelDock.RootProps<never> & { bar: TitleBarProps }) {
  const header: Partial<PanelDock.HeaderProps> = {};
  return (
    <WindowFrame titleBar={<TitleBar>Notes</TitleBar>}>
      <PanelDock.Root {...props} panels={panels}>
        {(panel) => <PanelDock.Header {...header} title={panel.title} />}
      </PanelDock.Root>
    </WindowFrame>
  );
}
