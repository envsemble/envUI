// Class names, selectors and custom properties written across lines.
export function Notices({ tone, open }: { tone: string; open: boolean }) {
  return (
    <section
      className={`
        env-notice
        env-notice-${tone}
        ${open ? 'env-row-fill' : ''}
      `}
    >
      <span className={`env-row
        env-counter`} />
    </section>
  );
}

export const rows = (root: HTMLElement) =>
  root.querySelectorAll(`
    .env-grouped-rows
      > .env-row
  `);

export const tone = `var(--env-notice-tone,
  var(--env-row-fill))`;
