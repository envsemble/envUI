import classNames from 'classnames';
import clsx from 'clsx';
import type { CSSProperties } from 'react';

const label = 'env-notice';
const style = { '--env-calendar-heatmap-mix': '40%', color: 'var(--env-alert-tone)' } as CSSProperties;

export function Notice({ tone, open, compact }: { tone: string; open: boolean; compact?: boolean }) {
  return (
    <div
      aria-label={label}
      className={classNames('env-alert', `env-alert-${tone}`, open && 'env-disclosure', {
        'env-list-item-fill': open,
      })}
      style={{ '--env-alert-tone': 'red', margin: 0, background: 'var(--env-list-item-fill)' }}
    >
      <span className="env-counter-badge-label  owner env-environment">Alex Morgan</span>
      <span className={compact ? 'env-list-item env-nav-list-item-compact' : `env-list-item ${tone}-row`} />
      <span className={clsx(['env-pager-link', open ? 'env-pager-link-title' : null])} />
      <span className={`${tone}env-row env-list-item`} data-class="env-row" />
      <span class="env-calendar-heatmap" style={style} />
    </div>
  );
}

export function focusNotice(root: HTMLElement) {
  root.querySelector<HTMLElement>('.env-alert > .env-alert-title, [class~="env-list-item"]')?.focus();
  root.querySelectorAll(`.env-calendar-heatmap-cell[data-day="${1}"]`).forEach((cell) => {
    cell.classList.toggle('env-calendar-heatmap-day', true);
  });
  const row = root.closest('.env-list .env-list-item');
  if (row?.matches(':is(.env-list-item, .env-list-surface)')) row.classList.add('env-counter-badge', 'env-counter-badge');
  root.classList.replace('env-alert', 'env-alert');
  root.getElementsByClassName('env-list-item env-list-item-fill');
  root.style.setProperty('--env-calendar-heatmap-mix', '20%');
  return root.style.getPropertyValue('--env-alert-tone');
}

export const props = { className: 'env-alert env-list-item', title: 'env-row' };

export function mark(element: HTMLElement) {
  element.className = 'env-date-picker env-drop-zone';
}
