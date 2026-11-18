import type { CodeToken } from './codeHighlighting.js';

export interface CodeSource {
  source: string;
  language: string;
}

const sourceKey = ({ source, language }: CodeSource) => `${language}\0${source}`;
const preHighlightedTokens = new Map<string, CodeToken[][]>();
let renderedSourcesBeingCollected: Map<string, CodeSource> | undefined;

export function giveCodeTokens(code: CodeSource, tokens: CodeToken[][]) {
  preHighlightedTokens.set(sourceKey(code), tokens);
}

export function givenCodeTokens(code: CodeSource): CodeToken[][] | undefined {
  renderedSourcesBeingCollected?.set(sourceKey(code), code);
  return preHighlightedTokens.get(sourceKey(code));
}

export function collectRenderedCode(): () => CodeSource[] {
  const collected = new Map<string, CodeSource>();
  renderedSourcesBeingCollected = collected;
  return () => {
    if (renderedSourcesBeingCollected === collected) renderedSourcesBeingCollected = undefined;
    return [...collected.values()];
  };
}
