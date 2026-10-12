import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalOffers, activeOffers, totalClicks30d, totalSearches30d, topOffers, byType, byStatus] =
    await Promise.all([
      prisma.offer.count(),
      prisma.offer.count({ where: { status: 'active' } }),
      prisma.affiliateClick.count({ where: { createdAt: { gte: since } } }),
      prisma.searchLog.count({ where: { createdAt: { gte: since } } }),
      prisma.offer.findMany({
        orderBy: { clicks: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, clicks: true, views: true, type: true },
      }),
      prisma.offer.groupBy({ by: ['type'], _count: { _all: true } }),
      prisma.offer.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

  return NextResponse.json({
    totalOffers,
    activeOffers,
    totalClicks30d,
    totalSearches30d,
    topOffers,
    byType: byType.map((g) => ({ type: g.type, count: g._count._all })),
    byStatus: byStatus.map((g) => ({ status: g.status, count: g._count._all })),
  });
}
