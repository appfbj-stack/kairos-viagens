import { prisma } from '@/lib/prisma';
import { SearchBox } from '@/components/SearchBox';
import { OfferCard } from '@/components/OfferCard';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pacotes' };
export const revalidate = 300;

export default async function PacotesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const { destino } = searchParams;
  const where: any = { status: 'active', type: 'PACKAGE' };
  if (destino) {
    where.OR = [
      { destinationCity: { contains: destino, mode: 'insensitive' } },
      { title: { contains: destino, mode: 'insensitive' } },
    ];
  }
  const offers = await prisma.offer.findMany({
    where,
    take: 60,
    orderBy: [{ featured: 'desc' }, { priceCents: 'asc' }],
    include: { partner: true, destination: true },
  });
  const now = new Date();
  const valid = offers.filter((o) => !o.expiresAt || o.expiresAt > now);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <h1 className="text-3xl sm:text-4xl font-black mb-1">Pacotes</h1>
          <p className="text-white/80 text-sm">Voo + hospedagem combinados pelos parceiros.</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 -mt-6 relative z-10">
        <SearchBox defaultType="pacotes" />
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h2 className="text-lg font-bold mb-4">
          {valid.length} {valid.length === 1 ? 'pacote encontrado' : 'pacotes encontrados'}
        </h2>
        {valid.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">Nenhum pacote no momento.</div>
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
