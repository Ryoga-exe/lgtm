export const onRequestGet: PagesFunction<{ R2: R2Bucket; IMAGES_ORIGIN: string }> =
  async ({ request, env }) => {
    const url = new URL(request.url);
    const limit = Math.min(1000, Number(url.searchParams.get('pool') || '500'));
    const prefix = '';

    const { objects } = await env.R2.list({ prefix, limit });
    if (!objects.length) return resp({ error: 'no images' }, 404);

    const pick = objects[Math.floor(Math.random() * objects.length)];
    const origin = env.IMAGES_ORIGIN;
    if (!origin) return resp({ error: 'IMAGES_ORIGIN is not set' }, 500);
    const img = `${origin}/${pick.key}`;

    return resp({
      key: pick.key,
      url: img,
      markdown: `![LGTM](${img})`,
      html: `<img src="${img}" alt="LGTM">`
    }, 200, 30);
  };

function resp(data: any, status = 200, sMaxAge?: number) {
  const h: Record<string, string> = { 'content-type': 'application/json; charset=utf-8' };
  if (sMaxAge) h['Cache-Control'] = `public, s-maxage=${sMaxAge}`;
  return new Response(JSON.stringify(data), { status, headers: h });
}
