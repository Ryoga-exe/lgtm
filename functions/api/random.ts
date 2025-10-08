import { getImagesOrigin, ImagesFunctionEnv, jsonResponse, readCappedInteger } from './utils';

const DEFAULT_PREFIX = '';

export const onRequestGet: PagesFunction<ImagesFunctionEnv> = async ({ request, env }) => {
  const url = new URL(request.url);
  const limit = readCappedInteger(url.searchParams, 'pool', { fallback: 500, min: 1, max: 1000 });

  const { objects } = await env.R2.list({ prefix: DEFAULT_PREFIX, limit });
  if (objects.length === 0) {
    return jsonResponse({ error: 'no images' }, { status: 404 });
  }

  const pick = objects[Math.floor(Math.random() * objects.length)];
  const origin = getImagesOrigin(env);
  const imageUrl = `${origin}/${pick.key}`;

  return jsonResponse(
    {
      key: pick.key,
      url: imageUrl,
      markdown: `![LGTM](${imageUrl})`,
      html: `<img src="${imageUrl}" alt="LGTM">`,
    },
    { cacheSeconds: 30 }
  );
};
