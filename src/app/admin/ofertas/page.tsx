import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatBRL } from '@/lib/format';
import { OffersAdmin } from './OffersAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminOfertasPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin');
  const [offers, partners, destinations] = await Promise.all([
    prisma.offer.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 100,
      include: { partner: true, destination: true },
    }),
    prisma.partner.findMany({ orderBy: { name: 'asc' } }),
    prisma.destination.findMany({ orderBy: { name: 'asc' } }),
  ]);
  return (
    <OffersAdmin
      offers={offers.map((o) => ({
        id: o.id, slug: o.slug, type: o.type, title: o.title, status: o.status,
        priceCents: o.priceCents, currency: o.currency,
        partner: o.partner ? { id: o.partner.id, name: o.partner.name } : null,
        destination: o.destination ? { id: o.destination.id, name: o.destination.name } : null,
        updatedAt: o.updatedAt.toISOString(),
      }))}
      partners={partners.map((p) => ({ id: p.id, name: p.name }))}
      destinations={destinations.map((d) => ({ id: d.id, name: d.name }))}
    />
  );
}
