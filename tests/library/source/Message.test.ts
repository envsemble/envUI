import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.ts';
import { declarations } from '../../support/CssDeclarations.ts';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const { Button, IconButton, Message, MessageList } = await importSource(
  'Message',
  'packages/ui/src/index.ts',
);
const css = declarations(
  readFileSync(join(repositoryRoot, 'packages/ui/src/styles/Message.css'), 'utf8'),
);

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

test('a busy log reports it while a reply streams in', () => {
  const list = (busy) =>
    render(
      h(
        MessageList,
        { 'aria-label': 'Pane conversation', busy, busyAuthor: 'Aurora' },
        h(Message, { from: 'self' }, 'On a pane'),
        h(Message, { from: 'other', author: 'Aurora' }, 'The summary'),
      ),
    );
  const idle = list(false);
  assert.equal(idle.attributes['aria-busy'], undefined);
  assert.equal(byClass(idle, 'env-message-list-busy').length, 0);
  const busy = list(true);
  assert.equal(busy.attributes['aria-busy'], 'true');
  assert.equal(busy.attributes['aria-live'], 'polite');
  const [row] = byClass(busy, 'env-message-list-busy');
  assert.equal(row.attributes['aria-hidden'], 'true');
  assert.equal(textOf(row), 'AuroraWorking');
  assert.equal(
    textOf(busy.children.filter((child) => child.tag === 'article').at(-1)),
    'AuroraThe summary',
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
