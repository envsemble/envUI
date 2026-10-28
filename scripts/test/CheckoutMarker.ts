// Development servers of this checkout answer /__envui/checkout with its identity, so the browser
// tests reuse a server already running only when it serves this checkout. Without the check, a
// server another checkout started on the same port would silently serve that checkout's code.
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const checkoutPath = '/__envui/checkout';

/**
 * The development servers' ports when no other checkout or program holds them: the site's, which
 * `npm run dev` serves on too (apps/site/package.json), and the test fixture's.
 */
export const defaultPorts = { site: 8770, fixture: 8766 };
const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));

/** A short hash of the checkout's folder; Windows paths compare without case. */
export function checkoutId(folder = root) {
  const path = resolve(folder);
  return createHash('sha256')
    .update(process.platform === 'win32' ? path.toLowerCase() : path)
    .digest('hex')
    .slice(0, 16);
}

/** The Vite plugin that answers the marker on a development server. */
export function checkoutMarker() {
  const id = checkoutId();
  return {
    name: 'envui-checkout-marker',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(checkoutPath, (_request, response) => {
        response.setHeader('Content-Type', 'text/plain');
        response.setHeader('Cache-Control', 'no-store');
        response.end(id);
      });
    },
  };
}

/** What listens on a local port: nothing, this checkout's server, or anything else. */
export async function probe(port, id = checkoutId()) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}${checkoutPath}`, {
      signal: AbortSignal.timeout(2000),
    });
    return (await response.text()).trim() === id ? 'ours' : 'other';
  } catch (error) {
    const failure = error as { code?: string; cause?: { code?: string } };
    const code = failure?.cause?.code ?? failure?.code;
    return code === 'ECONNREFUSED' ? 'free' : 'other';
  }
}

/** A port of this checkout's own, for when another program holds the default. */
export function checkoutPort(offset, id = checkoutId()) {
  return 20000 + (parseInt(id.slice(0, 8), 16) % 9000) * 2 + offset;
}

/**
 * Picks each server's port and whether to reuse what runs there, and records the ports in the
 * environment, where tests/browser/helpers/Servers.ts and the worker processes read them. A port given in
 * the environment is used as it is, and fails when another checkout serves it; a default port held
 * by another checkout or program gives way to this checkout's own.
 */
export async function resolveServers(
  servers: Record<string, { variable: string; port: number; offset: number }>,
  { ci = Boolean(process.env.CI), log = console.log } = {},
) {
  const resolved: Record<string, { port: number; reuse: boolean }> = {};
  for (const [name, { variable, port: preferred, offset }] of Object.entries(servers)) {
    if (process.env.ENVUI_SERVERS_RESOLVED) {
      resolved[name] = { port: Number(process.env[variable]), reuse: true };
      continue;
    }
    const given = process.env[variable];
    let port = Number(given || preferred);
    let state = await probe(port);
    if (state === 'other' && !given && !ci) {
      const own = checkoutPort(offset);
      log(
        `Port ${port} serves another checkout or program, so the ${name} server of this checkout uses ${own}.`,
      );
      port = own;
      state = await probe(port);
    }
    if (state === 'other')
      throw new Error(
        `Port ${port} for the ${name} server is taken by another checkout or program${given ? `, and ${variable} chose it` : ''}. Stop it, or set ${variable} to a free port.`,
      );
    process.env[variable] = String(port);
    resolved[name] = { port, reuse: state === 'ours' && !ci };
  }
  process.env.ENVUI_SERVERS_RESOLVED = '1';
  return resolved;
}
