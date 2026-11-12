// Terrazzo builds envUI's tokens (packages/ui/tokens, DTCG 2025.10 with a resolver) into
// src/generated/Tokens.css and the token list, src/generated/tokens.json. Run it through
// `npm run tokens:build`, which formats the output with Prettier; `npm run tokens:check` fails when
// the committed output is stale. `npx tz check --config packages/ui/terrazzo.config.mjs` only lints
// the tokens. The config, its plugins and its lint rules are in scripts/build/tokens/.
import { createConfig } from '../../scripts/build/tokens/Config.ts';

export default createConfig();
