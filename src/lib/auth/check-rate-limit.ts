/**
 * Cliente: consulta el rate-limit API antes de mutaciones de auth.
 * No bloquea el flujo si el endpoint falla (fail-open con log en dev).
 */
export async function checkAuthRateLimit(
  action: 'login' | 'signup' | 'forgotPassword'
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/auth/rate-limit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

    if (res.status === 429) {
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryAfter?: number;
      };
      return {
        ok: false,
        error:
          data.error ||
          `Demasiados intentos. Espera ${data.retryAfter ?? 60}s e inténtalo de nuevo.`,
      };
    }

    if (!res.ok) {
      return { ok: true };
    }

    return { ok: true };
  } catch {
    // Fail-open: no romper auth si el rate-limit no responde
    return { ok: true };
  }
}
