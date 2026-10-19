import { PanelDock, WindowFrame } from '@envsemble/envui';

export function Workspace({ panels, ...props }: PanelDock.RootProps<never> & { bar: WindowFrame.TitleBarProps }) {
  const header: Partial<PanelDock.HeaderProps> = {};
  return (
    <WindowFrame.Root titleBar={<WindowFrame.TitleBar>Notes</WindowFrame.TitleBar>}>
      <PanelDock.Root {...props} panels={panels}>
        {(panel) => <PanelDock.Header {...header} title={panel.title} />}
      </PanelDock.Root>
    </WindowFrame.Root>
  );
}
