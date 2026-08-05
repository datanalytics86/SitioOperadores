import { NextResponse, type NextRequest } from 'next/server';
import {
  RATE_LIMITS,
  getClientIp,
  rateLimit,
} from '@/lib/rate-limit';

/**
 * Endpoint ligero para rate-limit de formularios de auth (client-side).
 * Los Server Actions de FASE 2 lo usarán de forma nativa; este route
 * permite endurecer login/signup/forgot sin reescribir todo el flujo aún.
 *
 * POST { action: 'login' | 'signup' | 'forgotPassword' }
 */
export async function POST(request: NextRequest) {
  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const action = body.action as keyof typeof RATE_LIMITS | undefined;
  if (!action || !(action in RATE_LIMITS)) {
    return NextResponse.json({ error: 'action inválida' }, { status: 400 });
  }

  const ip = getClientIp(request.headers);
  const preset = RATE_LIMITS[action];
  const result = await rateLimit(`${action}:${ip}`, preset);

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return NextResponse.json(
      {
        success: false,
        error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(result.limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  return NextResponse.json({
    success: true,
    remaining: result.remaining,
    limit: result.limit,
  });
}
