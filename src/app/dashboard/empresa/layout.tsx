import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { canAccessPath, dashboardPathForRole } from '@/lib/auth/roles';

/**
 * Defense-in-depth: además del middleware, el layout de servidor
 * revalida rol antes de renderizar el dashboard empresa.
 */
export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/dashboard/empresa');
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = userRow?.role ?? null;

  if (!canAccessPath('/dashboard/empresa', role)) {
    redirect(dashboardPathForRole(role));
  }

  return <>{children}</>;
}
