export function Migrated({ tone }: { tone: string }) {
  return (
    <div
      className={`env-alert env-alert-${tone} env-counter-badge env-counter-badge-label`}
      style={{ '--env-alert-tone': 'red', '--env-calendar-heatmap-mix': '40%' }}
    >
      <span className="env-list-item env-list-item-fill env-drawer-item env-pager-link" />
    </div>
  );
}
