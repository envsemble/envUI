import { Input } from '@envsemble/envui/icons/Input';
import { Menu } from '@envsemble/envui/icons/Menu';
import { MarkdownContent } from '@envsemble/envui/content';
import { CodeDiff } from '@envsemble/envui/diff';
import { RichTextEditor } from '@envsemble/envui/rich-text';
import { MenuItem } from 'some-other-menu-library';

export function Icons() {
  return (
    <div>
      <Input />
      <Menu />
      <MenuItem />
      <MarkdownContent markdown="Hello" />
      <CodeDiff before="a" after="b" />
      <RichTextEditor />
    </div>
  );
}
