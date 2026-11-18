import type { ReactNode } from 'react';
import { classNames } from '../../shared/Attributes';

export function StepStack({
  count,
  at,
  render,
  className,
}: {
  count: number;
  at: number;
  render: (index: number) => ReactNode;
  className?: string;
}) {
  return (
    <div className={classNames('catalogue-step-stack', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} data-current={index === at || undefined}>
          {render(index)}
        </div>
      ))}
    </div>
  );
}

export function CornerLabel({ children }: { children: ReactNode }) {
  return <span className="catalogue-corner-label">{children}</span>;
}

export function AtTextSize({ size, children }: { size: number; children: ReactNode }) {
  return <div style={{ zoom: size }}>{children}</div>;
}
