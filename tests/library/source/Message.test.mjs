// Message and MessageList, rendered on the server: a conversation is a polite log of articles with
// their authors, status and actions, which reports when it is busy; and the style sheet's sizes
// and edges for the actions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.mjs';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { elementsOf, firstElement, hasClass, textOf } from '../../support/Markup.mjs';
import { declarations } from '../../support/CssDeclarations.mjs';
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

test('a conversation is a polite log of articles with authors, status and actions', () => {
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
  // Plain text keeps its line breaks.
  const [plain] = byClass(messages[0], 'env-message-content');
  assert.equal(textOf(plain), 'Summarize the report\nand list the risks.');
  assert.equal(plain.attributes['data-text'], '');
  assert.ok(
    css.some(
      ({ selector, prop, value }) =>
        selector === '.env-message-content[data-text]' &&
        prop === 'white-space' &&
        value === 'pre-wrap',
    ),
  );

  // A status names itself in text beside its icon, not by color alone.
  const status = (message) => textOf(byClass(message, 'env-message-status')[0]);
  assert.equal(messages[2].attributes['data-status'], 'sending');
  assert.equal(status(messages[2]), 'Sending');
  assert.equal(byClass(messages[2], 'env-spinner')[0].attributes['aria-hidden'], 'true');
  assert.equal(messages[3].attributes['data-status'], 'failed');
  assert.equal(status(messages[3]), 'Not sent');
  assert.equal(status(messages[4]), 'Could not deliver');
  // The actions are its buttons, named.
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
  // While busy, assistive technology can wait instead of announcing each step of the reply.
  const busy = list(true);
  assert.equal(busy.attributes['aria-busy'], 'true');
  assert.equal(busy.attributes['aria-live'], 'polite');
  // The busy row names who replies and says it works, shown rather than read.
  const [row] = byClass(busy, 'env-message-list-busy');
  assert.equal(row.attributes['aria-hidden'], 'true');
  assert.equal(textOf(row), 'AuroraWorking');
  assert.equal(
    textOf(busy.children.filter((child) => child.tag === 'article').at(-1)),
    'AuroraThe summary',
  );
});

test('actions without a variant or size of their own are small ghost buttons, the touch height on a coarse pointer', () => {
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
  // The actions take the small control height, which a coarse pointer raises to the touch height,
  // and a text icon action at the edge lines its icon up with the message through Button's edge
  // hooks; the sizes themselves are Scale's.
  const declared = (selector, prop) =>
    css.find((each) => each.selector === selector && each.prop === prop)?.value;
  assert.equal(
    declared('.env-message-actions', '--env-control-height'),
    'var(--env-control-height-sm)',
  );
  assert.deepEqual(
    css.filter((each) => each.prop === '--env-message-action-height').map((each) => each.value),
    [
      'var(--env-control-height)',
      'max(var(--env-control-height), var(--env-control-height-touch))',
    ],
  );
  for (const [from, edge] of [
    ['self', 'end'],
    ['other', 'start'],
  ])
    assert.match(
      declared(
        `.env-message[data-from='${from}'] > .env-message-actions, .env-message[data-from='${from}'] > .env-skeleton-content > .env-message-actions`,
        `--env-button-text-icon-edge-${edge}`,
      ),
      /var\(--env-control-icon-size\) - var\(--env-message-action-height\)/,
    );
});
