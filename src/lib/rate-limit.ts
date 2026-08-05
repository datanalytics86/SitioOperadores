/**
 * Rate limiting básico con interfaz compatible con Upstash Redis.
 *
 * - Desarrollo / single-instance: Map en memoria (se reinicia con el proceso).
 * - Producción multi-instance: setear UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *   y este módulo usará el backend HTTP de Upstash si está disponible.
 *
 * Uso típico en Server Actions / Route Handlers:
 *   const rl = await rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
 *   if (!rl.success) throw new Error('Demasiados intentos. Espera un minuto.');
 */

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // epoch ms
};

export type RateLimitOptions = {
  /** Máximo de requests en la ventana */
  limit?: number;
  /** Ventana en milisegundos */
  windowMs?: number;
};

type Bucket = { count: number; resetAt: number };

const memoryStore = new Map<string, Bucket>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, reset: resetAt };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  if (existing.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: existing.resetAt,
    };
  }

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    reset: existing.resetAt,
  };
}

async function upstashLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  // Sliding window simple con INCR + EXPIRE (best-effort)
  const redisKey = `rl:${key}`;
  const windowSec = Math.ceil(windowMs / 1000);

  try {
    const incrRes = await fetch(`${url}/incr/${encodeURIComponent(redisKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!incrRes.ok) return null;
    const incrJson = (await incrRes.json()) as { result: number };
    const count = incrJson.result;

    if (count === 1) {
      await fetch(
        `${url}/expire/${encodeURIComponent(redisKey)}/${windowSec}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }
      );
    }

    const reset = Date.now() + windowMs;
    if (count > limit) {
      return { success: false, limit, remaining: 0, reset };
    }
    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } catch {
    return null;
  }
}

/** Presets para endpoints sensibles */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60_000 },
  signup: { limit: 3, windowMs: 60_000 },
  forgotPassword: { limit: 3, windowMs: 60_000 },
  postular: { limit: 10, windowMs: 60_000 },
  api: { limit: 60, windowMs: 60_000 },
} as const;

export async function rateLimit(
  key: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const limit = options.limit ?? 10;
  const windowMs = options.windowMs ?? 60_000;

  const remote = await upstashLimit(key, limit, windowMs);
  if (remote) return remote;

  return memoryLimit(key, limit, windowMs);
}

/**
 * Extrae IP del request (Vercel / proxies). Fallback a 'unknown'.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
