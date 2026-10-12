import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ParceirosAdmin } from './ParceirosAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminParceirosPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin');
  const partners = await prisma.partner.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { offers: true, clicks: true } } } });
  return (
    <ParceirosAdmin
      partners={partners.map((p) => ({
        id: p.id, name: p.name, slug: p.slug, type: p.type, status: p.status,
        affiliateId: p.affiliateId, affiliateBaseUrl: p.affiliateBaseUrl, redirectTemplate: p.redirectTemplate,
        offersCount: p._count.offers, clicksCount: p._count.clicks,
      }))}
    />
  );
}
