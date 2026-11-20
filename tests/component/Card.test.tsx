import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import * as fixture from '../fixture/Card.fixture.tsx';
import { box } from './support/Browser.ts';
import { mount } from './support/Mount.tsx';

const card = () => page.getByTestId('project-card');

const hitAt = (target: Element) => {
  const { x, y, width, height } = target.getBoundingClientRect();
  return document.elementFromPoint(x + width / 2, y + height / 2);
};

test('a description holds block content in a div, not a paragraph', () => {
  mount(fixture);
  const description = card().element().querySelector('.env-card-description')!;
  expect(description.tagName).toBe('DIV');
  expect(description.querySelector('ul')).not.toBeNull();
  expect(card().element().querySelector('p')).toBeNull();
});

test('headerEnd sits in the title row after the meta, at the row end', () => {
  mount(fixture);
  const header = card().element().querySelector('.env-card-header')!;
  const meta = header.querySelector('.env-card-meta')!;
  const end = header.querySelector('.env-card-header-end')!;
  expect(meta.nextElementSibling).toBe(end);
  const row = box(header);
  const endBox = box(end);
  expect(endBox.x + endBox.width).toBeCloseTo(row.x + row.width, 0);
  const lone = page.getByTestId('end-card').element().querySelector('.env-card-header-end')!;
  const loneRow = box(lone.parentElement!);
  expect(box(lone).x + box(lone).width).toBeCloseTo(loneRow.x + loneRow.width, 0);
});

test("an interactive card's data-row-target takes the card's click, and every other link, button and field takes its own", async () => {
  mount(fixture);
  const target = card().getByRole('link', { name: 'Northwind launch' }).element();
  expect(hitAt(page.getByTestId('card-body').element())).toBe(target);
  expect(hitAt(card().getByText('Web').element())).toBe(target);
  const meta = card().element().querySelector<HTMLElement>('.env-card-meta')!;
  expect(hitAt(meta)).toBe(target);
  const owner = card().getByRole('link', { name: 'Ana' }).element();
  expect(owner).toContainElement(hitAt(owner) as HTMLElement);
  const more = card().getByRole('button', { name: 'Project actions' }).element();
  expect(more).toContainElement(hitAt(more) as HTMLElement);
  const share = card().getByRole('button', { name: 'Share' }).element();
  expect(share).toContainElement(hitAt(share) as HTMLElement);
  await card().getByRole('button', { name: 'Project actions' }).click();
  await expect.element(page.getByTestId('edits')).toHaveTextContent('1');
  expect(card().element()).toHaveAttribute('data-interactive', '');
  expect(card().element().tagName).toBe('DIV');
  expect(card().getByRole('heading', { name: 'Northwind launch' }).element()).toContainElement(
    target,
  );
});
