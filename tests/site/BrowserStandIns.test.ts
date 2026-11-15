import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { importSource } from '../support/ImportSource.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const standIns = await importSource('BrowserStandIns', 'apps/site/src/motion/BrowserStandIns.ts');

function realmRecordingOwnCalls() {
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
  const own = {
    scrollIntoView: Element.prototype.scrollIntoView,
    focus: HTMLElement.prototype.focus,
  };
  const release = standIns.holdBrowserStandIns({ Element, HTMLElement });
  return { Element, HTMLElement, calls, own, release };
}

test('held twice, each method is wrapped once, and the last release puts the own ones back', () => {
  const { Element, HTMLElement, own, release } = realmRecordingOwnCalls();
  const wrapped = Element.prototype.scrollIntoView;
  const focus = HTMLElement.prototype.focus;
  assert.notEqual(wrapped, own.scrollIntoView);
  const again = standIns.holdBrowserStandIns({ Element, HTMLElement });
  assert.equal(Element.prototype.scrollIntoView, wrapped);
  assert.equal(HTMLElement.prototype.focus, focus);
  again();
  again();
  assert.equal(Element.prototype.scrollIntoView, wrapped);
  release();
  assert.equal(Element.prototype.scrollIntoView, own.scrollIntoView);
  assert.equal(HTMLElement.prototype.focus, own.focus);
  const third = standIns.holdBrowserStandIns({ Element, HTMLElement });
  assert.notEqual(Element.prototype.scrollIntoView, own.scrollIntoView);
  third();
});

test('outside a stage or an example, every method is the browser’s own', () => {
  const { HTMLElement, calls } = realmRecordingOwnCalls();
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
  const { HTMLElement, calls } = realmRecordingOwnCalls();
  new HTMLElement(['.catalogue-tile-canvas']).scrollIntoView();
  new HTMLElement(['.site-live-example']).scrollIntoView(false);
  new HTMLElement(['.catalogue-open-example']).scrollIntoView({ block: 'nearest' });
  new HTMLElement(['.catalogue-motion-subject']).scrollIntoView();
  assert.deepEqual(calls, []);
});

test('a live example the reader hasn’t reached for keeps focus to itself', () => {
  const { HTMLElement, calls } = realmRecordingOwnCalls();
  new HTMLElement([':not([data-touched])']).focus();
  assert.deepEqual(calls, []);
});

test('in a stage the keyboard is in, focus follows the pointer and :focus reads its mark', () => {
  const { HTMLElement, calls } = realmRecordingOwnCalls();
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

test('evaluated again, as on a hot reload, the module keeps the state its stand-ins read', async () => {
  const { Element, calls } = realmRecordingOwnCalls();
  const bundle = pathToFileURL(join(repositoryRoot, '.cache/unit/BrowserStandIns.mjs')).href;
  const again = await import(`${bundle}?evaluated=again`);
  assert.notEqual(again.holdBrowserStandIns, standIns.holdBrowserStandIns);
  assert.equal(again.captures, standIns.captures);
  assert.equal(again.keyboardFocused, standIns.keyboardFocused);
  const element = new Element();
  again.captures.set(41, null);
  element.setPointerCapture(41);
  assert.equal(again.captures.get(41), element);
  assert.ok(element.hasPointerCapture(41));
  again.captures.delete(41);
  assert.deepEqual(calls, []);
  const wrapped = Element.prototype.setPointerCapture;
  const release = again.holdBrowserStandIns({ Element, HTMLElement: class extends Element {} });
  assert.equal(Element.prototype.setPointerCapture, wrapped);
  release();
});
