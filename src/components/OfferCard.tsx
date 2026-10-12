import Link from 'next/link';
import { formatBRL } from '@/lib/format';
import { AffiliateLink } from './AffiliateLink';

export interface OfferCardData {
  id: string;
  slug: string;
  type: 'FLIGHT' | 'HOTEL' | 'PACKAGE';
  title: string;
  subtitle?: string | null;
  originCity?: string | null;
  destinationCity?: string | null;
  heroImage?: string | null;
  priceCents: number;
  priceOldCents?: number | null;
  currency: string;
  partnerName?: string | null;
  sourceUrl?: string | null;
}

export function OfferCard({ offer }: { offer: OfferCardData }) {
  const typeLabel = offer.type === 'FLIGHT' ? 'Voo' : offer.type === 'HOTEL' ? 'Hotel' : 'Pacote';
  const route = offer.type === 'FLIGHT' ? 'voos' : offer.type === 'HOTEL' ? 'hoteis' : 'pacotes';
  const hasDiscount = offer.priceOldCents && offer.priceOldCents > offer.priceCents;
  const discountPct = hasDiscount
    ? Math.round(((offer.priceOldCents! - offer.priceCents) / offer.priceOldCents!) * 100)
    : 0;

  return (
    <article className="card overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="relative aspect-[16/9] bg-gradient-to-br from-brand-500 to-brand-700 overflow-hidden">
        {offer.heroImage ? (
          <img src={offer.heroImage} alt={offer.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/80 text-5xl font-black">
            {offer.type === 'FLIGHT' ? '✈' : offer.type === 'HOTEL' ? '🏨' : '🎒'}
          </div>
        )}
        <span className="absolute top-2 left-2 badge bg-white/90 text-slate-800">{typeLabel}</span>
        {hasDiscount && (
          <span className="absolute top-2 right-2 badge bg-red-500 text-white">-{discountPct}%</span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base leading-tight line-clamp-2 mb-1">
          <Link href={`/ofertas/${offer.slug}`} className="hover:text-brand-600">
            {offer.title}
          </Link>
        </h3>
        {offer.subtitle && <p className="text-sm text-slate-500 line-clamp-1 mb-2">{offer.subtitle}</p>}
        {(offer.originCity || offer.destinationCity) && (
          <p className="text-xs text-slate-600 mb-2">
            {offer.originCity && <span>{offer.originCity}</span>}
            {offer.originCity && offer.destinationCity && <span className="mx-1.5">→</span>}
            {offer.destinationCity && <span className="font-semibold">{offer.destinationCity}</span>}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between">
          <div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through">
                {formatBRL(offer.priceOldCents!, offer.currency)}
              </div>
            )}
            <div className="text-lg font-extrabold text-slate-900">
              {formatBRL(offer.priceCents, offer.currency)}
            </div>
          </div>
          <AffiliateLink offerId={offer.id} className="btn-primary text-xs px-3 py-1.5">
            Ver oferta
          </AffiliateLink>
        </div>
        {offer.partnerName && <p className="text-[10px] text-slate-400 mt-2">via {offer.partnerName}</p>}
      </div>
    </article>
  );
}
