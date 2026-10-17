// The development servers the browser tests use answer a browser's close of an idle connection with
// a reset, so the closed connection leaves nothing behind on the browser's side.
//
// Each test opens a fresh browser context, whose connections close with it. The side of a
// connection that closes first keeps it in TIME_WAIT for two minutes on Windows, holding one of the
// 16,384 local ports outgoing connections take theirs from. The browser closes first, about a dozen
// connections a test, so a full run, with other checkouts' runs beside it, used the ports up:
// navigations then failed with ERR_NO_BUFFER_SPACE. A reset in answer to the browser's close ends
// the connection on both sides at once. Only idle connections are closed so: a browser closes no
// connection that still waits for a response.

/** The Vite plugin that resets a connection once the browser has closed its side. */
export function resetClosedConnections() {
  return {
    name: 'envui-reset-closed-connections',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.on('connection', (socket) => {
        // Before the HTTP server's own listener, which would answer with a close of its own.
        socket.prependListener('end', () => {
          if (!socket.destroyed) socket.resetAndDestroy();
        });
      });
    },
  };
}
