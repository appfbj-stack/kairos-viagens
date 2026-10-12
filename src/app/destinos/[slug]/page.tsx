import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { OfferCard } from '@/components/OfferCard';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dest = await prisma.destination.findUnique({ where: { slug: params.slug } });
  if (!dest) return { title: 'Destino não encontrado' };
  return {
    title: `${dest.name} — Voos e hotéis`,
    description: dest.description ?? `Encontre voos, hotéis e pacotes para ${dest.name}.`,
  };
}

export const revalidate = 600;

export default async function DestinoPage({ params }: { params: { slug: string } }) {
  const dest = await prisma.destination.findUnique({ where: { slug: params.slug } });
  if (!dest || !dest.active) notFound();
  const offers = await prisma.offer.findMany({
    where: { status: 'active', destinationId: dest.id },
    take: 24,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    include: { partner: true, destination: true },
  });
  const valid = offers.filter((o) => !o.expiresAt || o.expiresAt > new Date());

  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 to-brand-500 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <p className="text-sm text-white/70">{dest.country}{dest.state ? ` · ${dest.state}` : ''}</p>
          <h1 className="text-4xl sm:text-5xl font-black mt-1">{dest.name}</h1>
          {dest.description && <p className="mt-2 text-white/90 max-w-2xl">{dest.description}</p>}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold mb-4">Ofertas para {dest.name}</h2>
        {valid.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">Sem ofertas no momento.</div>
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
