import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminAfiliadosPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/admin');
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clicks = await prisma.affiliateClick.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { offer: { select: { title: true, slug: true } }, partner: { select: { name: true } } },
  });
  const total30d = await prisma.affiliateClick.count({ where: { createdAt: { gte: since } } });
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-black mb-1">Afiliados</h1>
      <p className="text-sm text-slate-500 mb-6">Últimos 100 cliques • Total 30d: {total30d}</p>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left p-3">Quando</th>
              <th className="text-left p-3">Oferta</th>
              <th className="text-left p-3">Parceiro</th>
              <th className="text-left p-3">IP</th>
              <th className="text-left p-3">Origem</th>
            </tr>
          </thead>
          <tbody>
            {clicks.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Sem cliques.</td></tr>}
            {clicks.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="p-3 text-xs text-slate-600">{new Date(c.createdAt).toLocaleString('pt-BR')}</td>
                <td className="p-3 text-sm">{c.offer.title}</td>
                <td className="p-3 text-xs">{c.partner?.name ?? '—'}</td>
                <td className="p-3 text-xs font-mono">{c.ip ?? '—'}</td>
                <td className="p-3 text-xs text-slate-500 truncate max-w-[200px]">{c.referer ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
