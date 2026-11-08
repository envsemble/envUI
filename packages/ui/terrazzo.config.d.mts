// The types of terrazzo.config.mjs, for the build scripts that import it.
import type { Config } from '@terrazzo/parser';

/** A fresh config, so a long-running build (the site's dev server) reads the tokens anew. */
export function createConfig(options?: {
  tokensDirectory?: string | URL;
  outDir?: string | URL;
}): Config;

declare const config: Config;
export default config;
