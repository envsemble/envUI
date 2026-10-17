import { PanelDock } from '@envsemble/envui';

export function Notes({ controls }) {
  return (
    <>
      <PanelDock.Header title="Notes" controls={null} />
      <PanelDock.Header title="Drafts" controls={false} />
      <PanelDock.Header title="Budget" controls={controls} />
    </>
  );
}
