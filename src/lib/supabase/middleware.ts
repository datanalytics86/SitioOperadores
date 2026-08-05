import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  ROLE_COOKIE,
  ROLE_COOKIE_MAX_AGE,
  canAccessPath,
  dashboardPathForRole,
  isAuthRequiredPath,
} from '@/lib/auth/roles';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-build-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Limpiar cookie de rol si no hay sesión
  if (!user) {
    if (request.cookies.get(ROLE_COOKIE)) {
      response.cookies.set(ROLE_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    }

    if (isAuthRequiredPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }

    return response;
  }

  // Resolver rol (cookie cache → DB)
  let role = request.cookies.get(ROLE_COOKIE)?.value ?? null;

  const needsFreshRole =
    !role ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth/setup-profile') ||
    pathname.startsWith('/auth/callback');

  if (needsFreshRole) {
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    role = userRow?.role ?? (user.user_metadata?.role as string | undefined) ?? null;

    if (role) {
      response.cookies.set(ROLE_COOKIE, role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ROLE_COOKIE_MAX_AGE,
        path: '/',
      });
    }
  }

  // Autorización por rol en dashboards
  if (pathname.startsWith('/dashboard') && !canAccessPath(pathname, role)) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPathForRole(role);
    return NextResponse.redirect(url);
  }

  // Usuario autenticado no debería ver login/signup (salvo reset)
  if (
    pathname === '/auth/login' ||
    pathname === '/auth/signup' ||
    pathname.startsWith('/auth/signup')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPathForRole(role);
    return NextResponse.redirect(url);
  }

  return response;
}
