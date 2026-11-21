const escaped = (text: string) => text.replace(/[.+?^$()|[\]\\]/g, '\\$&');
const segment = '(?!\\.)[^/]*';

function globSource(glob: string): string {
  let source = '';
  for (let index = 0; index < glob.length; index++) {
    const character = glob[index]!;
    const startsSegment = index === 0 || glob[index - 1] === '/';
    if (character === '*' && glob[index + 1] === '*') {
      index++;
      if (glob[index + 1] === '/') {
        index++;
        source += `(?:${segment}/)*`;
      } else source += `(?:${segment}(?:/${segment})*)?`;
    } else if (character === '*') source += startsSegment ? segment : '[^/]*';
    else if (character === '{') {
      const end = glob.indexOf('}', index);
      source += `(?:${glob
        .slice(index + 1, end)
        .split(',')
        .map(globSource)
        .join('|')})`;
      index = end;
    } else source += escaped(character);
  }
  return source;
}

export function compileGlob(glob: string) {
  const pattern = new RegExp(`^${globSource(glob)}$`);
  return (path: string) => pattern.test(path);
}

export function compileGlobs(globs: readonly string[]) {
  const matchers = globs.map(compileGlob);
  return (path: string) => matchers.some((matches) => matches(path));
}
