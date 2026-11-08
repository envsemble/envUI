// The site's stand-ins for browser methods (apps/site/src/motion/BrowserStandIns.ts): installed
// once, each calls the browser's own method for anything it doesn't stand in for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importSource } from './support/importSource.mjs';

const standIns = await importSource('BrowserStandIns', 'apps/site/src/motion/BrowserStandIns.ts');

/**
 * A realm of its own, with an element that matches the selectors it is given as inside, and
 * methods that record each call that reaches them: the browser's own.
 */
function realm() {
  const calls = [];
  class Element {
    constructor(inside = []) {
      this.inside = inside;
      this.parentElement = null;
    }
    closest(selectors) {
      return this.inside.some((selector) => selectors.includes(selector)) ? this : null;
    }
    contains(other) {
      return other === this;
    }
    scrollIntoView(options) {
      calls.push(['scrollIntoView', options]);
    }
    matches(selectors) {
      calls.push(['matches', selectors]);
      return true;
    }
    setPointerCapture(id) {
      calls.push(['setPointerCapture', id]);
    }
    releasePointerCapture(id) {
      calls.push(['releasePointerCapture', id]);
    }
    hasPointerCapture(id) {
      calls.push(['hasPointerCapture', id]);
      return false;
    }
  }
  class HTMLElement extends Element {
    focus(options) {
      calls.push(['focus', options]);
    }
  }
  standIns.installBrowserStandIns({ Element, HTMLElement });
  return { Element, HTMLElement, calls };
}

test('installed twice, each method is wrapped once', () => {
  const { Element, HTMLElement } = realm();
  const wrapped = Element.prototype.scrollIntoView;
  const focus = HTMLElement.prototype.focus;
  standIns.installBrowserStandIns({ Element, HTMLElement });
  assert.equal(Element.prototype.scrollIntoView, wrapped);
  assert.equal(HTMLElement.prototype.focus, focus);
});

test('outside a stage or an example, every method is the browser’s own', () => {
  const { HTMLElement, calls } = realm();
  const element = new HTMLElement();
  element.scrollIntoView({ block: 'center' });
  element.focus({ preventScroll: true });
  element.matches(':focus-visible');
  element.setPointerCapture(7);
  element.releasePointerCapture(7);
  assert.equal(element.hasPointerCapture(7), false);
  assert.deepEqual(calls, [
    ['scrollIntoView', { block: 'center' }],
    ['focus', { preventScroll: true }],
    ['matches', ':focus-visible'],
    ['setPointerCapture', 7],
    ['releasePointerCapture', 7],
    ['hasPointerCapture', 7],
  ]);
});

test('scrolling into view stays inside a stage or an open example, never the page', () => {
  const { HTMLElement, calls } = realm();
  new HTMLElement(['.catalogue-tile-canvas']).scrollIntoView();
  new HTMLElement(['.site-live-example']).scrollIntoView(false);
  new HTMLElement(['.catalogue-open-example']).scrollIntoView({ block: 'nearest' });
  new HTMLElement(['.catalogue-motion-subject']).scrollIntoView();
  assert.deepEqual(calls, []);
});

test('a live example the reader hasn’t reached for keeps focus to itself', () => {
  const { HTMLElement, calls } = realm();
  new HTMLElement([':not([data-touched])']).focus();
  assert.deepEqual(calls, []);
});

test('in a stage the keyboard is in, focus follows the pointer and :focus reads its mark', () => {
  const { HTMLElement, calls } = realm();
  const element = new HTMLElement();
  const followed = [];
  standIns.keyboardFocused.set(element, (next) => followed.push(next));
  try {
    element.focus();
    assert.deepEqual(followed, [element]);
    element.matches('button:focus-visible, :focus');
    element.matches('.env-tab');
    assert.deepEqual(calls, [
      ['matches', 'button[data-catalogue-focus], [data-catalogue-focus]'],
      ['matches', '.env-tab'],
    ]);
  } finally {
    standIns.keyboardFocused.clear();
  }
});

test('the pointers no one sees keep their capture here, a real pointer’s the browser does', () => {
  const { HTMLElement, calls } = realm();
  const element = new HTMLElement();
  standIns.captures.set(3, null);
  try {
    element.setPointerCapture(3);
    assert.equal(element.hasPointerCapture(3), true);
    element.releasePointerCapture(3);
    assert.equal(element.hasPointerCapture(3), false);
    assert.deepEqual(calls, []);
  } finally {
    standIns.captures.clear();
  }
});
