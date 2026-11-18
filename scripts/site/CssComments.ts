import type { Plugin } from 'vite';

export const cssCommentsPlugin = (): Plugin => ({
  name: 'envui-css-comments',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    for (const file of Object.values(bundle))
      if (file.type === 'asset' && file.fileName.endsWith('.css'))
        file.source = withoutComments(String(file.source));
  },
});

export function withoutComments(css: string) {
  let result = '';
  let index = 0;
  while (index < css.length) {
    const character = css[index];
    if (character === '"' || character === "'") {
      let end = index + 1;
      while (end < css.length && css[end] !== character) end += css[end] === '\\' ? 2 : 1;
      result += css.slice(index, end + 1);
      index = end + 1;
    } else if (character === '/' && css[index + 1] === '*') {
      const end = css.indexOf('*/', index + 2);
      index = end === -1 ? css.length : end + 2;
    } else {
      result += character;
      index++;
    }
  }
  return result.replace(/\n(?:[ \t]*\n)+/g, '\n').replace(/^[ \t]*\n/, '');
}
