export const onRequestGet: PagesFunction<{ R2: R2Bucket; IMAGES_ORIGIN: string }> =
  async ({ request, env }) => {
    const url = new URL(request.url);
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || '30')));
    const cursor = url.searchParams.get('cursor') || undefined;
    const prefix = url.searchParams.get('prefix') || '';

    const { objects, truncated, cursor: next } = await env.R2.list({ prefix, limit, cursor });

    const origin = env.IMAGES_ORIGIN || 'https://lgtm-images.ryoga.dev';
    const items = objects.map(o => {
      const key = o.key;
      return {
        key,
        url: `${origin}/${key}`,
        size: o.size,
        uploaded: o.uploaded?.toISOString?.() || null,
        etag: o.etag,
      };
    });

    const body = JSON.stringify({ items, cursor_next: truncated ? next : null });
    const res = new Response(body, { headers: { 'content-type': 'application/json; charset=utf-8' } });
    res.headers.set('Cache-Control', 'public, s-maxage=60');
    return res;
  };
