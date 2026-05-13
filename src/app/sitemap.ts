import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sitio-operadores.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/vacantes`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/auth/signup?role=operador`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/auth/signup?role=empresa`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/terminos`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = await createClient();
    const { data: vacantes } = await supabase
      .from('vacantes')
      .select('id, updated_at')
      .eq('activa', true)
      .limit(5000);

    const vacanteRoutes: MetadataRoute.Sitemap = (vacantes ?? []).map((v) => ({
      url: `${SITE_URL}/vacantes/${v.id}`,
      lastModified: v.updated_at ? new Date(v.updated_at) : undefined,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...vacanteRoutes];
  } catch {
    return staticRoutes;
  }
}
