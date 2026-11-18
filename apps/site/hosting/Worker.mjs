const contentHashedAssetsPath = '/assets/';
const oneYearSeconds = 31536000;

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch(request: Request): Promise<Response> } }} env
   */
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith(contentHashedAssetsPath)) {
      return env.ASSETS.fetch(request);
    }
    const response = await env.ASSETS.fetch(request);
    const isHtml = response.headers.get('Content-Type')?.startsWith('text/html');
    const foundAsset = response.status === 304 || (response.ok && !isHtml);
    if (foundAsset) {
      const asset = new Response(response.body, response);
      asset.headers.set('Cache-Control', `private, max-age=${oneYearSeconds}, immutable`);
      asset.headers.set('X-Content-Type-Options', 'nosniff');
      return asset;
    }
    return new Response('Not found\n', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
