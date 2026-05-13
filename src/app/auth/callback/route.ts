import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/auth/login?error=invalid_code`);
  }

  if (next && next.startsWith('/')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_user`);
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = userRow?.role ?? (user.user_metadata?.role as string | undefined);

  if (role === 'operador') {
    const { data: profile } = await supabase
      .from('operadores')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    return NextResponse.redirect(
      profile ? `${origin}/dashboard/operador` : `${origin}/auth/setup-profile?role=operador`
    );
  }

  if (role === 'empresa') {
    const { data: profile } = await supabase
      .from('empresas')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    return NextResponse.redirect(
      profile ? `${origin}/dashboard/empresa` : `${origin}/auth/setup-profile?role=empresa`
    );
  }

  return NextResponse.redirect(`${origin}/`);
}
