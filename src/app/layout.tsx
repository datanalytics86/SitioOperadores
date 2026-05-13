import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OperadoresFaena.cl — Empleos para Operadores de Maquinaria Pesada en Chile',
  description: 'La plataforma #1 en Chile para operadores de maquinaria pesada y camiones. CAEX, cargadores frontales, retroexcavadoras y más. Encuentra empleo o publica tu vacante.',
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
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#111111" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="OperadoresFaena" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
