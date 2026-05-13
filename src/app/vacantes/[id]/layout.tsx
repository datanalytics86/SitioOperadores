import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sitio-operadores.vercel.app';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('vacantes')
      .select('titulo, descripcion, equipo_requerido, region, ciudad, empresas(nombre)')
      .eq('id', id)
      .maybeSingle();

    if (!data) {
      return {
        title: 'Vacante no encontrada — OperadoresFaena.cl',
        description: 'Esta vacante ya no está disponible.',
      };
    }

    const empresaNombre = (data as any).empresas?.nombre;
    const title = `${data.titulo} — ${empresaNombre ?? 'Empresa'} | OperadoresFaena.cl`;
    const description =
      `${data.descripcion?.slice(0, 155) ?? data.titulo}` +
      ` Operador de ${data.equipo_requerido} en ${data.ciudad}, ${data.region}.`;
    const url = `${SITE_URL}/vacantes/${id}`;

    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        siteName: 'OperadoresFaena.cl',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Vacante — OperadoresFaena.cl',
      description: 'Empleos para operadores de maquinaria pesada en Chile.',
    };
  }
}

export default function VacanteLayout({ children }: Props) {
  return children;
}
