import classNames from 'classnames';
import clsx from 'clsx';
import type { CSSProperties } from 'react';

const label = 'env-notice';
const style = { '--env-heatmap-mix': '40%', color: 'var(--env-notice-tone)' } as CSSProperties;

export function Notice({ tone, open, compact }: { tone: string; open: boolean; compact?: boolean }) {
  return (
    <div
      aria-label={label}
      className={classNames('env-notice', `env-notice-${tone}`, open && 'env-disclosure-note', {
        'env-row-fill': open,
      })}
      style={{ '--env-notice-tone': 'red', margin: 0, background: 'var(--env-row-fill)' }}
    >
      <span className="env-counter-label  owner env-environment">Alex Morgan</span>
      <span className={compact ? 'env-row env-navigation-compact' : `env-row ${tone}-row`} />
      <span className={clsx(['env-direction-link', open ? 'env-direction-link-title' : null])} />
      <span className={`${tone}env-row env-row`} data-class="env-row" />
      <span class="env-heatmap" style={style} />
    </div>
  );
}

export function focusNotice(root: HTMLElement) {
  root.querySelector<HTMLElement>('.env-notice > .env-notice-title, [class~="env-row"]')?.focus();
  root.querySelectorAll(`.env-heatmap-cell[data-day="${1}"]`).forEach((cell) => {
    cell.classList.toggle('env-heatmap-day', true);
  });
  const row = root.closest('.env-grouped-rows .env-row');
  if (row?.matches(':is(.env-row, .env-contrast-row-pane)')) row.classList.add('env-counter', 'env-counter-badge');
  root.classList.replace('env-notice', 'env-alert');
  root.getElementsByClassName('env-row env-row-fill');
  root.style.setProperty('--env-heatmap-mix', '20%');
  return root.style.getPropertyValue('--env-notice-tone');
}

export const props = { className: 'env-notice env-row', title: 'env-row' };

export function mark(element: HTMLElement) {
  element.className = 'env-date-time-field env-file-dropzone';
}
