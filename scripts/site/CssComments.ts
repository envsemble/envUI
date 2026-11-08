// The site's style sheets ship without their comments (apps/site/vite.config.ts): cssMinify is off,
// so the token reference reads the values as written, and the comments are about half the bytes.

/**
 * A style sheet without its comments, and without the lines they leave empty: strings, where a
 * comment's characters are text, stay as they are.
 */
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
