import stylelint from 'stylelint';

const {
  utils: { report },
} = stylelint;

export function numbers(value) {
  const found = [];
  const functions = [];
  let index = 0;
  while (index < value.length) {
    const character = value[index];
    const rest = value.slice(index);
    if (character === '"' || character === "'") {
      let end = index + 1;
      while (end < value.length && value[end] !== character) end += value[end] === '\\' ? 2 : 1;
      index = end + 1;
      continue;
    }
    if (character === '(') {
      functions.push('');
      index += 1;
      continue;
    }
    if (character === ')') {
      functions.pop();
      index += 1;
      continue;
    }
    const number = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?([a-z%]*)/i.exec(rest);
    if (number) {
      found.push({
        index,
        text: number[0],
        value: Number.parseFloat(number[0]),
        unit: number[1].toLowerCase(),
        functions: [...functions],
      });
      index += number[0].length;
      continue;
    }
    const name = /^[#\w-]+/.exec(rest)?.[0];
    if (name) {
      index += name.length;
      if (value[index] !== '(') continue;
      if (name.toLowerCase() === 'url') {
        const end = value.indexOf(')', index);
        index = end === -1 ? value.length : end + 1;
        continue;
      }
      functions.push(name.toLowerCase());
      index += 1;
      continue;
    }
    index += 1;
  }
  return found;
}

export function topLevelWords(value) {
  const words = [];
  let depth = 0;
  let start = -1;
  let quote = '';
  const end = (index) => {
    if (start !== -1) words.push({ word: value.slice(start, index), index: start });
    start = -1;
  };
  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      if (start === -1) start = index;
      continue;
    }
    if (character === '(') depth++;
    if (character === ')') depth--;
    if (depth > 0 || character === ')') {
      if (start === -1) start = index;
      continue;
    }
    if (/\s/.test(character) || character === '/' || character === ',') end(index);
    else if (start === -1) start = index;
  }
  end(value.length);
  return words;
}

const valueOffset = (declaration) =>
  declaration.prop.length + (declaration.raws.between ?? ':').length;

/**
 * @param {{ result: any, ruleName: string, declaration: any, message: string, start: number, length: number, fix?: () => void }} problem
 */
export function reportInValue({ result, ruleName, declaration, message, start, length, fix }) {
  const index = valueOffset(declaration) + start;
  report({
    result,
    ruleName,
    node: declaration,
    message,
    index,
    endIndex: index + length,
    ...(fix ? { fix } : {}),
  });
}

export function propertyMatcher(list) {
  const tests = list.map((entry) => {
    const pattern = /^\/(.*)\/([a-z]*)$/.exec(entry);
    if (pattern) {
      const expression = new RegExp(pattern[1], pattern[2]);
      return (property) => expression.test(property);
    }
    return (property) => property === entry.toLowerCase();
  });
  return (property) => tests.some((test) => test(property.toLowerCase()));
}

export const documentationUrl = (rule) =>
  `https://github.com/envsemble/envUI/blob/main/packages/stylelint-config/README.md#${rule}`;
