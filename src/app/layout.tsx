import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viagens.fbautomacao.space';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Kairós Viagens — Pesquise voos, hotéis e pacotes', template: '%s · Kairós Viagens' },
  description:
    'Compare voos, hotéis e pacotes em um só lugar. Kairós Viagens reúne as melhores ofertas de parceiros confiáveis para você viajar pagando menos.',
  keywords: ['viagens', 'voos baratos', 'hotéis', 'pacotes turísticos', 'passagens aéreas', 'promoções'],
  authors: [{ name: 'Kairós Viagens' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Kairós Viagens',
    title: 'Kairós Viagens — Pesquise voos, hotéis e pacotes',
    description: 'Compare ofertas e viaje pagando menos.',
  },
  twitter: { card: 'summary_large_image', title: 'Kairós Viagens', description: 'Compare ofertas de viagens em um só lugar.' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1d4ed8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
