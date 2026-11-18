import type { Plugin, PreviewServer, ViteDevServer } from 'vite';

export function resetClosedConnections(): Plugin {
  const reset = (server: ViteDevServer | PreviewServer) => {
    server.httpServer?.on('connection', (socket) => {
      socket.prependListener('end', () => {
        if (!socket.destroyed) socket.resetAndDestroy();
      });
    });
  };
  return {
    name: 'envui-reset-closed-connections',
    apply: 'serve',
    configureServer: reset,
    configurePreviewServer: reset,
  };
}
