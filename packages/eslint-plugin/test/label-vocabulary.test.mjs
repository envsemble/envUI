import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import rule from '../src/rules/label-vocabulary.js';
import { named, ruleTester } from './RuleTester.mjs';

const replace = (label, rewritten) => ({ messageId: 'replace', data: { label, rewritten } });

ruleTester.run('label-vocabulary', rule, {
  valid: [
    '<Button>Save</Button>',
    '<Button onClick={copy}>Copy link</Button>',
    ...named('A word the table qualifies, such as Add for something new, is left to the writer', [
      '<Button>Add member</Button>',
    ]),
    '<Button type="submit">Submit</Button>',
    '<Button>Send invitation</Button>',
    '<Pager.Next>Next</Pager.Next>',
    ...named('Text outside an action, and an action label that only starts with a word', [
      '<h2>Login history</h2>',
      '<th>Retry count</th>',
      '<Field label="Retry" />',
      '<Button>Clone repository</Button>',
    ]),
    ...named('Sentences, words inside a label and other props', [
      '<Text>Submit the form when every field is filled in.</Text>',
      '<Button>Save and submit</Button>',
      '<Field description="Submit" />',
    ]),
    ...named('Words the application keeps, by option, in any case', [
      { code: '<Button onClick={clone}>Clone</Button>', options: [{ allow: ['clone', 'Retry'] }] },
      { code: '<Button>retry</Button>', options: [{ allow: ['clone', 'Retry'] }] },
      { code: '<Menu.Item label="Log  in" />', options: [{ allow: ['Log in'] }] },
    ]),
  ],
  invalid: [
    { code: '<Button type="submit">Proceed</Button>', errors: [replace('Proceed', 'Continue')] },
    { code: '<Button>Modify…</Button>', errors: [replace('Modify', 'Edit')] },
    { code: '<Menu.Item label="Log out" />', errors: [replace('Log out', 'Sign out')] },
    { code: '<IconButton aria-label="clone" />', errors: [replace('clone', 'duplicate')] },
    { code: "<ConfirmButton confirmLabel={'Retry'} />", errors: [replace('Retry', 'Try again')] },
    { code: "<Button>{'Undelete'}</Button>", errors: [replace('Undelete', 'Restore')] },
    {
      code: '<><Button>Clone</Button><Button>Modify</Button></>',
      options: [{ allow: ['Clone'] }],
      errors: [replace('Modify', 'Edit')],
    },
  ],
});

test('the words come from the vocabulary table of the writing guide', () => {
  const guide = new URL('../../../docs/writing.md', import.meta.url);
  const table = readFileSync(guide, 'utf8');
  const words = JSON.parse(
    readFileSync(new URL('../src/data/vocabulary.json', import.meta.url), 'utf8'),
  ).words;
  for (const [word, use] of Object.entries(words)) {
    assert.match(table, new RegExp(`\\b${word}\\b`), word);
    assert.match(table, new RegExp(`\\b${use}\\b`), use);
  }
  assert.ok(!('Add' in words), 'a qualified word is left out');
  assert.ok(!('OK' in words), 'a word under two rows is left out');
  assert.ok(!('Publish' in words), 'a qualifier after "Send or Publish" covers both');
});
