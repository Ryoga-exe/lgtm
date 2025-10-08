import { getImagesOrigin, ImagesFunctionEnv, jsonResponse, readCappedInteger } from './utils';

export const onRequestGet: PagesFunction<ImagesFunctionEnv> = async ({ request, env }) => {
  const url = new URL(request.url);
  const limit = readCappedInteger(url.searchParams, 'limit', { fallback: 30, min: 1, max: 200 });
  const cursor = url.searchParams.get('cursor') ?? undefined;
  const prefix = url.searchParams.get('prefix') ?? '';

  const { objects, truncated, cursor: next } = await env.R2.list({ prefix, limit, cursor });

  const origin = getImagesOrigin(env);
  const items = objects.map(object => {
    const key = object.key;

    return {
      key,
      url: `${origin}/${key}`,
      size: object.size,
      uploaded: object.uploaded?.toISOString?.() ?? null,
      etag: object.etag,
    };
  });

  return jsonResponse(
    {
      items,
      cursor_next: truncated ? next : null,
    },
    { cacheSeconds: 60 }
  );
};
