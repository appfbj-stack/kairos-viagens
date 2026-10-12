import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin');

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalOffers, activeOffers, totalClicks30d, topOffers, recentOffers] = await Promise.all([
    prisma.offer.count(),
    prisma.offer.count({ where: { status: 'active' } }),
    prisma.affiliateClick.count({ where: { createdAt: { gte: since } } }),
    prisma.offer.findMany({
      orderBy: { clicks: 'desc' },
      take: 5,
      select: { id: true, title: true, slug: true, clicks: true, views: true, type: true },
    }),
    prisma.offer.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true, priceCents: true, currency: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black mb-1">Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Olá, {user.name}. Resumo dos últimos 30 dias.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card label="Ofertas" value={totalOffers} />
        <Card label="Ativas" value={activeOffers} highlight />
        <Card label="Cliques 30d" value={totalClicks30d} />
        <Card label="Conversão" value={totalClicks30d > 0 ? `${((totalClicks30d / Math.max(activeOffers, 1)) * 100).toFixed(0)}%` : '0%'} />
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-bold mb-3">Top 5 mais clicadas</h2>
          {topOffers.length === 0 ? <p className="text-sm text-slate-500">Sem cliques ainda.</p> : (
            <ol className="space-y-2 text-sm">
              {topOffers.map((o, i) => (
                <li key={o.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span className="truncate"><span className="text-slate-400 mr-2">{i+1}.</span> {o.title}</span>
                  <span className="text-xs font-bold text-slate-700">{o.clicks} cliques</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="card p-5">
          <h2 className="font-bold mb-3">Atualizadas recentemente</h2>
          {recentOffers.length === 0 ? <p className="text-sm text-slate-500">Nenhuma oferta.</p> : (
            <ul className="space-y-2 text-sm">
              {recentOffers.map((o) => (
                <li key={o.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span className="truncate">{o.title}</span>
                  <span className="text-xs text-slate-500">{new Date(o.updatedAt).toLocaleDateString('pt-BR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function Card({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`card p-4 ${highlight ? 'bg-brand-50 border-brand-200' : ''}`}>
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black mt-1">{value}</div>
    </div>
  );
}
