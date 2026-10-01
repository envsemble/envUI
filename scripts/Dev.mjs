import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const clients = new Set();
const mime = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.js': 'text/javascript' };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/__reload') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    response.write(': connected\n\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }
  try {
    const file = resolve(root, '.' + decodeURIComponent(pathname === '/' ? '/envUI.html' : pathname));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || file.includes(`${sep}.git${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    let content = await readFile(file);
    if (extname(file) === '.html') {
      content = content.toString().replace('</body>', `<script>new EventSource('/__reload').onmessage = () => location.reload();</script></body>`);
    }
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(content);
  } catch {
    response.writeHead(404).end('File not found');
  }
});
let timer;
watch(root, { recursive: true }, (_, filename) => {
  if (!filename || /^(\.git|dist|node_modules)([\\/]|$)/.test(filename)) return;
  clearTimeout(timer);
  timer = setTimeout(() => { for (const client of clients) client.write('data: reload\n\n'); }, 100);
});
server.on('error', error => { console.error(error.message); process.exit(1); });
server.listen(8765, '127.0.0.1', () => console.log('Live preview: http://127.0.0.1:8765 — Ctrl+C to stop.'));
