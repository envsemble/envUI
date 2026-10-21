// Class names, selectors and custom properties written across lines.
export function Notices({ tone, open }: { tone: string; open: boolean }) {
  return (
    <section
      className={`
        env-alert
        env-alert-${tone}
        ${open ? 'env-list-item-fill' : ''}
      `}
    >
      <span className={`env-list-item
        env-counter`} />
    </section>
  );
}

export const rows = (root: HTMLElement) =>
  root.querySelectorAll(`
    .env-list
      > .env-list-item
  `);

export const tone = `var(--env-alert-tone,
  var(--env-list-item-fill))`;
