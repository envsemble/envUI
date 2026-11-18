import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Column, Text, type SpaceStep } from '@envsemble/envui';
import { StillMark } from './StillMark';
import { pixelTolerance, remeasure } from '../shared/Remeasure';
import { classNames } from '../shared/Attributes';

export const SpecimenHeadingLevel = createContext<2 | 3>(2);

const overflowTolerancePx = 1;

const PartHeadingLevel = createContext<2 | 3 | 4 | null>(null);

export function SpecimenFrame({
  title,
  actions,
  children,
  caption,
  className,
  gap = 4,
  size = 'content',
  still = false,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  gap?: SpaceStep;
  size?: 'compact' | 'field' | 'content' | 'wide' | 'collection';
  still?: boolean;
}) {
  const level = useContext(SpecimenHeadingLevel);
  const Heading = `h${level}` as const;
  return (
    <Column
      render={<section />}
      gap={gap}
      data-size={size}
      className={classNames('site-example', className)}
    >
      {title && actions ? (
        <div className="catalogue-example-heading">
          <Text render={<Heading />} variant="headline">
            {title}
          </Text>
          {actions}
        </div>
      ) : title ? (
        <Text render={<Heading />} variant="headline">
          {title}
        </Text>
      ) : null}
      <PartHeadingLevel value={title ? ((level + 1) as 3 | 4) : level}>{children}</PartHeadingLevel>
      {still && <StillMark />}
      {caption && (
        <Text variant="caption" className="catalogue-caption">
          {caption}
        </Text>
      )}
    </Column>
  );
}

export function SpecimenPart({
  title,
  children,
  caption,
}: {
  title: string;
  children: ReactNode;
  caption?: ReactNode;
}) {
  const specimenLevel = useContext(SpecimenHeadingLevel);
  const level = useContext(PartHeadingLevel) ?? ((specimenLevel + 1) as 3 | 4);
  const Heading = `h${level}` as const;
  return (
    <Column render={<section />} gap={2} className="catalogue-specimen">
      <Text render={<Heading />} variant="body-sm">
        {title}
      </Text>
      {children}
      {caption && <Text variant="caption">{caption}</Text>}
    </Column>
  );
}

export function SpecimenGrid({
  children,
  size = 'field',
}: {
  children: ReactNode;
  size?: 'small' | 'compact' | 'field' | 'card' | 'wide';
}) {
  return (
    <div className="catalogue-specimen-grid" data-size={size}>
      {children}
    </div>
  );
}

export function MatrixScroll({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = area.current;
    const table = element?.querySelector('table');
    if (!element || !table) return;
    const titles = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent ?? '');
    for (const row of table.querySelectorAll('tbody tr'))
      [...row.children].forEach((cell, index) => {
        if (cell.tagName === 'TD') cell.setAttribute('data-catalogue-label', titles[index] ?? '');
      });
    const stackWhereColumnsOverflow = () => {
      element.removeAttribute('data-stacked');
      const cells = [...table.querySelectorAll<HTMLElement>('th, td')];
      const overflowsItsColumn = (cell: HTMLElement) =>
        cell.scrollWidth > cell.clientWidth + overflowTolerancePx;
      if (cells.some(overflowsItsColumn)) element.setAttribute('data-stacked', '');
    };
    let width = -1;
    const widths = remeasure(
      (changed) => {
        const next = element.getBoundingClientRect().width;
        if (!changed.has('fonts') && Math.abs(next - width) < pixelTolerance) return;
        width = next;
        stackWhereColumnsOverflow();
      },
      { first: 'now', resize: [element], fonts: true },
    );
    return widths.stop;
  }, []);
  return (
    <div
      ref={area}
      className={classNames('catalogue-matrix-scroll', className)}
      role="region"
      aria-label={label}
    >
      {children}
    </div>
  );
}
