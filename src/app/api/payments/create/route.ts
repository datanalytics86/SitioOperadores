import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

/**
 * Scaffold Transbank Webpay Plus — crear transacción.
 *
 * Activar con:
 *   TRANSBANK_COMMERCE_CODE, TRANSBANK_API_KEY, TRANSBANK_ENV
 *   NEXT_PUBLIC_PAYMENTS_ENABLED=true
 *
 * Docs: https://www.transbankdevelopers.cl/documentacion/webpay-plus
 */

const bodySchema = z.object({
  plan_id: z.string().min(1),
  return_url: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED !== 'true') {
    return NextResponse.json(
      {
        error: 'Pagos no habilitados aún. Contacta a ventas o activa NEXT_PUBLIC_PAYMENTS_ENABLED.',
        code: 'PAYMENTS_DISABLED',
      },
      { status: 503 }
    );
  }

  const ip = getClientIp(request.headers);
  const rl = await rateLimit(`pay:${ip}`, RATE_LIMITS.api);
  if (!rl.success) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const commerceCode = process.env.TRANSBANK_COMMERCE_CODE;
  const apiKey = process.env.TRANSBANK_API_KEY;
  if (!commerceCode || !apiKey) {
    return NextResponse.json(
      { error: 'Transbank no configurado en el servidor' },
      { status: 500 }
    );
  }

  // TODO: llamar a Transbank REST create transaction
  // const tbkUrl = process.env.TRANSBANK_ENV === 'production'
  //   ? 'https://webpay3g.transbank.cl/...'
  //   : 'https://webpay3gint.transbank.cl/...';

  return NextResponse.json({
    success: false,
    error: 'Integración Transbank en progreso — schema y endpoint listos.',
    next_steps: [
      'Instalar SDK o fetch REST a Webpay Plus',
      'Persistir buy_order en tabla pagos (estado pendiente)',
      'Redirigir al token URL de Transbank',
    ],
  });
}
