const DEFAULT_IMAGES_ORIGIN = 'https://lgtm-images.ryoga.dev';

type EnvWithImagesOrigin = { IMAGES_ORIGIN?: string | null | undefined };

type IntegerOptions = {
  fallback: number;
  min?: number;
  max?: number;
};

type JsonResponseOptions = {
  status?: number;
  cacheSeconds?: number;
  headers?: HeadersInit;
};

export type ImagesFunctionEnv = { R2: R2Bucket } & EnvWithImagesOrigin;

export function getImagesOrigin(env: EnvWithImagesOrigin): string {
  const candidate = typeof env.IMAGES_ORIGIN === 'string' ? env.IMAGES_ORIGIN.trim() : '';
  return candidate.length > 0 ? candidate : DEFAULT_IMAGES_ORIGIN;
}

export function readCappedInteger(
  params: URLSearchParams,
  key: string,
  { fallback, min, max }: IntegerOptions
): number {
  const raw = params.get(key);
  const parsed = raw === null ? Number.NaN : Number(raw);
  const base = Number.isFinite(parsed) ? parsed : fallback;
  let value = base;

  if (min !== undefined) {
    value = Math.max(min, value);
  }
  if (max !== undefined) {
    value = Math.min(max, value);
  }

  return value;
}

export function jsonResponse<T>(data: T, options: JsonResponseOptions = {}): Response {
  const { status = 200, cacheSeconds, headers } = options;
  const merged = new Headers(headers);
  merged.set('content-type', 'application/json; charset=utf-8');
  if (typeof cacheSeconds === 'number') {
    merged.set('Cache-Control', `public, s-maxage=${cacheSeconds}`);
  }

  return new Response(JSON.stringify(data), { status, headers: merged });
}
