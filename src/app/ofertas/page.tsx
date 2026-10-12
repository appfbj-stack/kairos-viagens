import { prisma } from '@/lib/prisma';
import { OfferCard } from '@/components/OfferCard';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Todas as ofertas',
  description: 'Catálogo completo de passagens, hotéis e pacotes com preços em real.',
};
export const revalidate = 300;

const TYPES = [
  { value: '', label: 'Todos' },
  { value: 'FLIGHT', label: 'Voos' },
  { value: 'HOTEL', label: 'Hotéis' },
  { value: 'PACKAGE', label: 'Pacotes' },
];

export default async function OfertasPage({ searchParams }: { searchParams: Record<string, string> }) {
  const { tipo, precoMax } = searchParams;
  const where: any = { status: 'active' };
  if (tipo) where.type = tipo;
  if (precoMax) where.priceCents = { lte: parseInt(precoMax, 10) * 100 };

  const offers = await prisma.offer.findMany({
    where,
    take: 100,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    include: { partner: true, destination: true },
  });
  const now = new Date();
  const valid = offers.filter((o) => !o.expiresAt || o.expiresAt > now);

  return (
    <>
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Todas as ofertas</h1>
          <p className="text-sm text-slate-500 mt-1">
            {valid.length} {valid.length === 1 ? 'oferta disponível' : 'ofertas disponíveis'}.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {TYPES.map((t) => {
            const active = (tipo || '') === t.value;
            const params = new URLSearchParams();
            if (t.value) params.set('tipo', t.value);
            if (precoMax) params.set('precoMax', precoMax);
            const qs = params.toString();
            return (
              <Link
                key={t.value}
                href={qs ? `/ofertas?${qs}` : '/ofertas'}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  active ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
        {valid.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">Nenhuma oferta no momento.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {valid.map((o) => (
              <OfferCard
                key={o.id}
                offer={{
                  id: o.id, slug: o.slug, type: o.type, title: o.title, subtitle: o.subtitle,
                  originCity: o.originCity, destinationCity: o.destinationCity, heroImage: o.heroImage,
                  priceCents: o.priceCents, priceOldCents: o.priceOldCents, currency: o.currency,
                  partnerName: o.partner?.name,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
