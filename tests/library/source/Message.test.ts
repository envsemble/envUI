import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { declarations } from '../../support/CssDeclarations.ts';
import { styleSheetsDirectory } from '../../../scripts/RepositoryPaths.ts';

const { Button, IconButton, Message, MessageList } = await importSource(
  'Message',
  'packages/ui/src/index.ts',
);
const css = declarations(readFileSync(join(styleSheetsDirectory, 'Message.css'), 'utf8'));

const render = (element) => firstElement(renderToStaticMarkup(element));
const byClass = (root, name) => elementsOf(root).filter((element) => hasClass(element, name));
const icon = h('svg', { 'data-icon': '' });

test('a conversation is a polite log of articles with authors, status named in text, named actions and line breaks kept', () => {
  const log = render(
    h(
      MessageList,
      { 'aria-label': 'Conversation' },
      h(Message, { from: 'self', meta: '09:41' }, 'Summarize the report\nand list the risks.'),
      h(
        Message,
        {
          from: 'other',
          author: 'Aurora',
          meta: '09:41',
          actions: h(IconButton, { variant: 'text', icon, 'aria-label': 'Copy answer' }),
        },
        h('p', null, 'Revenue grew in every region.'),
      ),
      h(Message, { from: 'self', status: 'sending' }, 'Draft the summary'),
      h(Message, { from: 'self', status: 'failed', actions: h(Button, null, 'Retry') }, 'A'),
      h(Message, { from: 'self', status: 'failed', statusLabel: 'Could not deliver' }, 'Ping'),
    ),
  );
  assert.equal(log.attributes.role, 'log');
  assert.equal(log.attributes['aria-label'], 'Conversation');
  assert.equal(log.attributes['aria-live'], 'polite');
  const messages = log.children.filter((child) => child.tag === 'article');
  assert.equal(messages.length, 5);
  assert.deepEqual(
    messages.map((message) => message.attributes['data-from']),
    ['self', 'other', 'self', 'self', 'self'],
  );
  assert.deepEqual(byClass(messages[1], 'env-message-author').map(textOf), ['Aurora']);
  assert.deepEqual(byClass(messages[1], 'env-message-meta').map(textOf), ['09:41']);
  const [plain] = byClass(messages[0], 'env-message-text');
  assert.equal(textOf(plain), 'Summarize the report\nand list the risks.');
  assert.ok(
    css.some(
      ({ selector, prop, value }) =>
        selector === '.env-message-text' && prop === 'white-space' && value === 'pre-wrap',
    ),
  );

  const status = (message) => textOf(byClass(message, 'env-message-status')[0]);
  assert.equal(messages[2].attributes['data-status'], 'sending');
  assert.equal(status(messages[2]), 'Sending');
  assert.equal(byClass(messages[2], 'env-spinner')[0].attributes['aria-hidden'], 'true');
  assert.equal(messages[3].attributes['data-status'], 'failed');
  assert.equal(status(messages[3]), 'Not sent');
  assert.equal(status(messages[4]), 'Could not deliver');
  const buttons = (message) => elementsOf(message).filter((element) => element.tag === 'button');
  assert.equal(buttons(messages[1])[0].attributes['aria-label'], 'Copy answer');
  assert.equal(textOf(buttons(messages[3])[0]), 'Retry');
});

test('a busy log reports it while a working reply streams in as its last message', () => {
  const list = render(
    h(
      MessageList,
      { 'aria-label': 'Pane conversation', 'aria-busy': true },
      h(Message, { from: 'self' }, 'On a pane'),
      h(Message, { from: 'other', author: 'Aurora', status: 'working' }, 'The summ'),
    ),
  );
  assert.equal(list.attributes['aria-busy'], 'true');
  assert.equal(list.attributes['aria-live'], 'polite');
  const reply = list.children.filter((child) => child.tag === 'article').at(-1);
  assert.equal(reply.attributes['data-status'], 'working');
  assert.equal(textOf(reply), 'AuroraThe summWorking');
  assert.equal(
    render(h(MessageList, { 'aria-label': 'Idle' }, h(Message, { from: 'self' }, 'Hi'))).attributes[
      'aria-busy'
    ],
    undefined,
  );
});

test('actions without a variant or size of their own are small ghost buttons', () => {
  const message = render(
    h(
      Message,
      {
        from: 'other',
        author: 'Sam Lee',
        actions: [
          h(IconButton, { key: 'copy', icon, 'aria-label': 'Copy note' }),
          h(Button, { key: 'reply' }, 'Reply'),
        ],
      },
      'A note with default actions.',
    ),
  );
  const buttons = elementsOf(message).filter((element) => element.tag === 'button');
  assert.equal(buttons.length, 2);
  for (const button of buttons) {
    assert.equal(button.attributes['data-variant'], 'ghost');
    assert.equal(button.attributes['data-size'], 'sm');
  }
});

test('author and status take any content, and start takes a column beside the message', () => {
  const avatar = h('span', { 'data-avatar': '' }, 'A');
  const message = render(
    h(
      Message,
      {
        from: 'other',
        start: avatar,
        author: h(
          'a',
          { href: '/people/aurora' },
          'Aurora',
          h('span', { 'data-badge': '' }, 'Bot'),
        ),
        meta: '09:41',
        status: 'failed',
        statusLabel: h('span', null, 'Not sent. ', h('a', { href: '#retry' }, 'Try again')),
        actions: h(Button, null, 'Copy'),
        style: { color: 'red' },
      },
      'Ping',
    ),
  );
  assert.equal(message.attributes['data-start'], '');
  assert.match(message.attributes.style, /color:red/);
  assert.match(message.attributes.style, /--_message-rows:4/);
  const [start] = message.children.filter((child) => typeof child !== 'string');
  assert.ok(hasClass(start, 'env-message-start'));
  assert.equal(textOf(start), 'A');
  const [author] = byClass(message, 'env-message-author');
  assert.equal(elementsOf(author).filter((element) => element.tag === 'a').length, 1);
  assert.equal(textOf(author), 'AuroraBot');
  const [status] = byClass(message, 'env-message-status');
  assert.equal(elementsOf(status).find((element) => element.tag === 'a').attributes.href, '#retry');
  const plain = render(h(Message, { from: 'other', author: 'Aurora' }, 'Hi'));
  assert.equal(plain.attributes['data-start'], undefined);
  assert.equal(plain.attributes.style, undefined);
});

test('a working message shows a spinner and Working or its status label, and its reply once it streams in', () => {
  const working = (children, props = {}) =>
    render(
      h(
        Message,
        {
          from: 'other',
          author: 'Agent',
          start: h('span', { 'data-avatar': '' }, 'A'),
          status: 'working',
          actions: h(Button, null, 'Stop'),
          ...props,
        },
        children,
      ),
    );
  const empty = working('');
  assert.equal(empty.attributes['data-status'], 'working');
  assert.equal(empty.attributes['aria-hidden'], undefined);
  assert.equal(byClass(empty, 'env-message-content').length, 0);
  assert.match(empty.attributes.style, /--_message-rows:3/);
  const [status] = byClass(empty, 'env-message-status');
  assert.equal(textOf(status), 'Working');
  assert.equal(byClass(status, 'env-spinner').length, 1);
  assert.equal(textOf(elementsOf(empty).find((element) => element.tag === 'button')), 'Stop');

  const streaming = working('The tests pass so far', { statusLabel: 'Running tests…' });
  assert.equal(textOf(byClass(streaming, 'env-message-content')[0]), 'The tests pass so far');
  assert.equal(textOf(byClass(streaming, 'env-message-status')[0]), 'Running tests…');
  assert.match(streaming.attributes.style, /--_message-rows:4/);
});
