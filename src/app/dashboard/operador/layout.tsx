import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { canAccessPath, dashboardPathForRole } from '@/lib/auth/roles';

/**
 * Defense-in-depth: además del middleware, el layout de servidor
 * revalida rol antes de renderizar el dashboard operador.
 */
export default async function OperadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/dashboard/operador');
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = userRow?.role ?? null;

  if (!canAccessPath('/dashboard/operador', role)) {
    redirect(dashboardPathForRole(role));
  }

  return <>{children}</>;
}
