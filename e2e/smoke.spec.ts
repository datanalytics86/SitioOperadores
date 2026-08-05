import { test, expect } from '@playwright/test';

/**
 * Smoke tests críticos (sin Supabase real).
 * Con NEXT_PUBLIC_USE_MOCKS=true la landing muestra contenido demo.
 */

test.describe('Landing y navegación pública', () => {
  test('home carga y muestra hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Operadores/i);
    await expect(page.getByText(/Faena\.cl/i).first()).toBeVisible();
  });

  test('listado de vacantes es accesible', async ({ page }) => {
    await page.goto('/vacantes');
    await expect(page.getByRole('heading', { name: /Empleos para Operadores/i })).toBeVisible();
  });

  test('páginas legales', async ({ page }) => {
    await page.goto('/privacidad');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await page.goto('/terminos');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('Auth UX', () => {
  test('login renderiza formulario', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/correo/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('signup valida password mínima en UI', async ({ page }) => {
    await page.goto('/auth/signup?role=operador');
    await expect(page.getByText(/mínimo 8|mayúscula|minúscula/i).first()).toBeVisible();
  });

  test('dashboard redirige a login sin sesión', async ({ page }) => {
    await page.goto('/dashboard/operador');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('forgot password form', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    await expect(page.getByLabel(/correo/i)).toBeVisible();
  });
});

test.describe('SEO técnico', () => {
  test('robots.txt', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toMatch(/sitemap/i);
  });
});
