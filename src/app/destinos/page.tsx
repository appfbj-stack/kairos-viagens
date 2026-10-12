export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Destinos',
  description: 'Descubra destinos nacionais e internacionais para sua prÃ³xima viagem.',
};
export const revalidate = 600;

export default async function DestinosPage() {
  const destinations = await prisma.destination.findMany({
    where: { active: true },
    orderBy: [{ popular: 'desc' }, { name: 'asc' }],
  });

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Destinos</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Explore destinos nacionais e internacionais.</p>
      {destinations.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">Nenhum destino cadastrado.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {destinations.map((d) => (
            <Link
              key={d.id}
              href={`/destinos/${d.slug}`}
              className="card overflow-hidden hover:shadow-md transition group"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-brand-500 to-accent-500 relative">
                {d.heroImage ? (
                  <img src={d.heroImage} alt={d.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-5xl">ðŸ“</div>
                )}
                {d.popular && (
                  <span className="absolute top-2 right-2 badge bg-amber-500 text-white">Popular</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold group-hover:text-brand-600">{d.name}</h3>
                <p className="text-xs text-slate-500">
                  {d.country}{d.state ? ` Â· ${d.state}` : ''}
                  {d.iataCode ? ` (${d.iataCode})` : ''}
                </p>
                {d.description && (
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{d.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

