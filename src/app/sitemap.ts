import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viagens.fbautomacao.space';
  const now = new Date();
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${site}/voos`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/hoteis`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/pacotes`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/ofertas`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${site}/destinos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${site}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${site}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${site}/afiliados`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
  const [offers, destinations] = await Promise.all([
    prisma.offer.findMany({
      where: { status: 'active' },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
    prisma.destination.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    }),
  ]);
  return [
    ...staticUrls,
    ...offers.map((o) => ({ url: `${site}/ofertas/${o.slug}`, lastModified: o.updatedAt, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...destinations.map((d) => ({ url: `${site}/destinos/${d.slug}`, lastModified: d.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
