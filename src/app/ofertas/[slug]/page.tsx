export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatBRL, parseDate } from '@/lib/format';
import { AffiliateLink } from '@/components/AffiliateLink';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const offer = await prisma.offer.findUnique({ where: { slug: params.slug } });
  if (!offer) return { title: 'Oferta não encontrada' };
  return {
    title: offer.title,
    description: offer.subtitle ?? `${offer.title} a partir de ${formatBRL(offer.priceCents, offer.currency)}`,
    openGraph: {
      title: offer.title,
      description: offer.subtitle ?? undefined,
      images: offer.heroImage ? [offer.heroImage] : undefined,
    },
  };
}

export const revalidate = 300;

export default async function OfferPage({ params }: { params: { slug: string } }) {
  const offer = await prisma.offer.findUnique({
    where: { slug: params.slug },
    include: { partner: true, destination: true },
  });
  if (!offer || offer.status !== 'active' || (offer.expiresAt && offer.expiresAt < new Date())) {
    notFound();
  }

  // increment view counter (best-effort)
  prisma.offer.update({ where: { id: offer.id }, data: { views: { increment: 1 } } }).catch(() => null);

  const gallery: string[] = offer.galleryJson ? JSON.parse(offer.galleryJson) : [];
  const dep = parseDate(offer.departureDate);
  const ret = parseDate(offer.returnDate);

  return (
    <article className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <nav className="text-xs text-slate-500 mb-3">
        <a href="/" className="hover:text-brand-600">Início</a>
        <span className="mx-1.5">/</span>
        <a href="/ofertas" className="hover:text-brand-600">Ofertas</a>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500 to-brand-700 mb-4 relative">
            {offer.heroImage ? (
              <img src={offer.heroImage} alt={offer.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-7xl">
                {offer.type === 'FLIGHT' ? '✈' : offer.type === 'HOTEL' ? '🏨' : '🎒'}
              </div>
            )}
          </div>
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {gallery.slice(0, 4).map((src, i) => (
                <img key={i} src={src} alt="" className="aspect-square object-cover rounded-xl" />
              ))}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{offer.title}</h1>
          {offer.subtitle && <p className="text-slate-600 mt-1">{offer.subtitle}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge bg-slate-100 text-slate-700">
              {offer.type === 'FLIGHT' ? 'Voo' : offer.type === 'HOTEL' ? 'Hotel' : 'Pacote'}
            </span>
            {offer.carrier && <span className="badge bg-slate-100 text-slate-700">{offer.carrier}</span>}
            {offer.hotelName && <span className="badge bg-slate-100 text-slate-700">{offer.hotelName}</span>}
            {offer.featured && <span className="badge bg-amber-100 text-amber-800">Destaque</span>}
          </div>

          {offer.description && (
            <section className="prose prose-slate max-w-none mt-6">
              <h2 className="text-lg font-bold">Detalhes</h2>
              <p className="text-sm text-slate-700 whitespace-pre-line">{offer.description}</p>
            </section>
          )}

          <section className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {(offer.originCity || offer.destinationCity) && (
              <div className="card p-3">
                <div className="text-xs text-slate-500">Rota</div>
                <div className="font-semibold">
                  {offer.originCity || '—'} {offer.destinationCity ? '→ ' + offer.destinationCity : ''}
                </div>
              </div>
            )}
            {dep && (
              <div className="card p-3">
                <div className="text-xs text-slate-500">Ida</div>
                <div className="font-semibold">{dep.toLocaleDateString('pt-BR')}</div>
              </div>
            )}
            {ret && (
              <div className="card p-3">
                <div className="text-xs text-slate-500">Volta</div>
                <div className="font-semibold">{ret.toLocaleDateString('pt-BR')}</div>
              </div>
            )}
            {offer.nights && (
              <div className="card p-3">
                <div className="text-xs text-slate-500">Noites</div>
                <div className="font-semibold">{offer.nights}</div>
              </div>
            )}
          </section>

          <p className="mt-6 text-xs text-slate-500">
            Atualizado em {offer.updatedAt.toLocaleDateString('pt-BR')}.
            {offer.partner && <> Fonte: <span className="font-semibold">{offer.partner.name}</span>.</>}
          </p>
        </div>

        <aside className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            {offer.priceOldCents && offer.priceOldCents > offer.priceCents && (
              <div className="text-sm text-slate-400 line-through">
                De {formatBRL(offer.priceOldCents, offer.currency)}
              </div>
            )}
            <div className="text-3xl font-black text-slate-900">
              {formatBRL(offer.priceCents, offer.currency)}
            </div>
            <div className="text-xs text-slate-500 mt-1">por pessoa, ida e volta</div>

            <AffiliateLink offerId={offer.id} className="btn-primary w-full mt-4">
              Ver no parceiro →
            </AffiliateLink>

            {offer.expiresAt && offer.expiresAt > new Date() && (
              <p className="text-xs text-slate-500 mt-3 text-center">
                Oferta válida até {offer.expiresAt.toLocaleDateString('pt-BR')}
              </p>
            )}

            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
              Ao clicar, você será redirecionado ao site do parceiro. A reserva é concluída lá.
              Podemos receber comissão pela indicação sem custo adicional para você.
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
