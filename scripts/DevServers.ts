import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import { repositoryRoot } from './RepositoryPaths.ts';

const checkoutPath = '/__envui/checkout';

export const defaultPorts = { site: 8770, fixture: 8766, siteBuild: 8767 };

const portsApart = 10;

export const portsFor = (index: number) => ({
  ENVUI_SITE_PORT: String(
    Number(process.env.ENVUI_SITE_PORT || defaultPorts.site) + portsApart * index,
  ),
  ENVUI_FIXTURE_PORT: String(
    Number(process.env.ENVUI_FIXTURE_PORT || defaultPorts.fixture) + portsApart * index,
  ),
  ENVUI_SITE_BUILD_PORT: String(
    Number(process.env.ENVUI_SITE_BUILD_PORT || defaultPorts.siteBuild) + portsApart * index,
  ),
});

export function checkoutId(folder = repositoryRoot) {
  const path = resolve(folder);
  return createHash('sha256')
    .update(process.platform === 'win32' ? path.toLowerCase() : path)
    .digest('hex')
    .slice(0, 16);
}

export function checkoutMarker(): Plugin {
  const id = checkoutId();
  const answerBeforeViteMiddlewares = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(checkoutPath, (_request, response) => {
      response.setHeader('Content-Type', 'text/plain');
      response.setHeader('Cache-Control', 'no-store');
      response.end(id);
    });
  };
  return {
    name: 'envui-checkout-marker',
    apply: 'serve',
    configureServer: answerBeforeViteMiddlewares,
    configurePreviewServer: answerBeforeViteMiddlewares,
  };
}

async function probe(port: number, id = checkoutId()) {
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

export function checkoutPort(offset: number, id = checkoutId()) {
  return 20000 + (parseInt(id.slice(0, 8), 16) % 9000) * 2 + offset;
}

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
