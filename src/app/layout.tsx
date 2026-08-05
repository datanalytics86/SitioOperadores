import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

export const metadata: Metadata = {
  title: 'OperadoresFaena.cl — Empleos para Operadores de Maquinaria Pesada en Chile',
  description:
    'La plataforma #1 en Chile para operadores de maquinaria pesada y camiones. CAEX, cargadores frontales, retroexcavadoras y más. Encuentra empleo o publica tu vacante.',
  metadataBase: new URL('https://operadoresfaena.cl'),
  openGraph: {
    title: 'OperadoresFaena.cl',
    description: 'Conecta operadores calificados con empresas que los necesitan en Chile.',
    url: 'https://operadoresfaena.cl',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`scroll-smooth ${inter.variable} ${bebasNeue.variable}`}
    >
      <head>
        <meta name="theme-color" content="#111111" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OperadoresFaena" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
