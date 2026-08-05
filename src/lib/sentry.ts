/**
 * Integración Sentry (lazy / opcional).
 *
 * Activar:
 * 1. npm install @sentry/nextjs
 * 2. npx @sentry/wizard@latest -i nextjs
 * 3. Setear NEXT_PUBLIC_SENTRY_DSN en Vercel
 *
 * Este módulo NO importa @sentry/nextjs en runtime hasta que exista el DSN,
 * para no romper el build sin la dependencia instalada.
 */

export function isSentryEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

/** Captura de error best-effort (no-op sin DSN / sin SDK). */
export async function captureException(
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  if (!isSentryEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[sentry-stub]', error, context);
    }
    return;
  }

  try {
    // Dynamic import evita dependencia hard en build
    // @ts-expect-error optional peer
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(error, { extra: context });
  } catch {
    console.error(error);
  }
}

export async function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): Promise<void> {
  if (!isSentryEnabled()) return;
  try {
    // @ts-expect-error optional peer
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(message, level);
  } catch {
    /* ignore */
  }
}
