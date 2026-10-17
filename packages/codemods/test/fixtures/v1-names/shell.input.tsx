import { PanelDock, PanelDockHeader, TitleBar, WindowFrame } from '@envsemble/envui';
import type { PanelDockHeaderProps, PanelDockProps, TitleBarProps } from '@envsemble/envui';

export function Workspace({ panels, ...props }: PanelDockProps<never> & { bar: TitleBarProps }) {
  const header: Partial<PanelDockHeaderProps> = {};
  return (
    <WindowFrame titleBar={<TitleBar>Notes</TitleBar>}>
      <PanelDock {...props} panels={panels}>
        {(panel) => <PanelDockHeader {...header} title={panel.title} />}
      </PanelDock>
    </WindowFrame>
  );
}
