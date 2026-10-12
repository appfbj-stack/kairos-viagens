// ── Provider abstraction (Flight, Hotel, Package) ─────────────────────────────
// Cada provedor implementa searchOffers() e retorna uma lista normalizada.
// Sem credenciais, todos retornam [] ou dados do banco local (modo demo).

export type ProviderType = 'flight' | 'hotel' | 'package';
export type ProviderStatus = 'test' | 'demo' | 'production' | 'disabled';

export interface SearchInput {
  type: ProviderType;
  originCity?: string;
  originIata?: string;
  destinationCity?: string;
  destinationIata?: string;
  destinationSlug?: string;
  departureDate?: string;     // YYYY-MM-DD
  returnDate?: string;
  adults?: number;
  children?: number;
  nights?: number;
}

export interface NormalizedOffer {
  externalId: string;
  partnerSlug: string;
  partnerName: string;
  type: ProviderType;
  title: string;
  subtitle?: string;
  originCity?: string;
  originIata?: string;
  destinationCity?: string;
  destinationIata?: string;
  carrier?: string;
  hotelName?: string;
  departureDate?: string;
  returnDate?: string;
  nights?: number;
  priceCents: number;
  currency: string;
  priceOldCents?: number;
  sourceUrl: string;
  fetchedAt: string;
}

export interface Provider {
  slug: string;
  name: string;
  type: ProviderType;
  status: ProviderStatus;
  searchOffers(input: SearchInput): Promise<NormalizedOffer[]>;
}

// ── Provider: Local (catálogo do banco) — sempre funciona em modo demo ─────
import { prisma } from './prisma';

const localProvider: Provider = {
  slug: 'local',
  name: 'Catálogo Local',
  type: 'flight',
  status: 'demo',
  async searchOffers(input: SearchInput): Promise<NormalizedOffer[]> {
    const where: any = { status: 'active' };
    if (input.type) where.type = input.type.toUpperCase();
    if (input.destinationSlug) where.destination = { slug: input.destinationSlug };
    if (input.destinationCity) {
      where.OR = [
        { destinationCity: { contains: input.destinationCity, mode: 'insensitive' } },
        { title: { contains: input.destinationCity, mode: 'insensitive' } },
      ];
    }
    if (input.originCity) {
      where.OR = [
        ...(where.OR ?? []),
        { originCity: { contains: input.originCity, mode: 'insensitive' } },
      ];
    }
    const offers = await prisma.offer.findMany({
      where,
      take: 50,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
      include: { partner: true, destination: true },
    });
    return offers
      .filter((o) => !o.expiresAt || o.expiresAt > new Date())
      .map<NormalizedOffer>((o) => ({
        externalId: o.id,
        partnerSlug: o.partner?.slug ?? 'local',
        partnerName: o.partner?.name ?? 'Catálogo Local',
        type: o.type.toLowerCase() as ProviderType,
        title: o.title,
        subtitle: o.subtitle ?? undefined,
        originCity: o.originCity ?? undefined,
        originIata: o.originIata ?? undefined,
        destinationCity: o.destinationCity ?? o.destination?.city ?? undefined,
        destinationIata: o.destinationIata ?? o.destination?.iataCode ?? undefined,
        carrier: o.carrier ?? undefined,
        hotelName: o.hotelName ?? undefined,
        departureDate: o.departureDate?.toISOString().slice(0, 10),
        returnDate: o.returnDate?.toISOString().slice(0, 10),
        nights: o.nights ?? undefined,
        priceCents: o.priceCents,
        currency: o.currency,
        priceOldCents: o.priceOldCents ?? undefined,
        sourceUrl: o.sourceUrl ?? '',
        fetchedAt: o.updatedAt.toISOString(),
      }));
  },
};

// ── Stubs dos parceiros reais (sem credenciais) ──────────────────────────────
function makeStub(slug: string, name: string, type: ProviderType, status: ProviderStatus = 'test'): Provider {
  return {
    slug, name, type, status,
    async searchOffers(_input: SearchInput) { return []; },
  };
}

export const providers: Record<string, Provider> = {
  local: localProvider,
  // Stubs preparados — implementar quando credenciais forem fornecidas:
  // https://developers.skyscanner.net/ requer aprovação
  // https://developers.booking.com/ requer parceria comercial
  // https://developers.amadeus.com/ tem free tier limitado
  skyscanner: makeStub('skyscanner', 'Skyscanner', 'flight', 'test'),
  booking: makeStub('booking', 'Booking.com', 'hotel', 'test'),
  amadeus: makeStub('amadeus', 'Amadeus', 'flight', 'test'),
  expedia: makeStub('expedia', 'Expedia', 'package', 'test'),
};

export async function searchAll(input: SearchInput): Promise<NormalizedOffer[]> {
  const active = Object.values(providers).filter(
    (p) => p.status !== 'disabled' && (p.type === input.type || p.type === 'package'),
  );
  const results = await Promise.all(active.map((p) => p.searchOffers(input).catch(() => [])));
  const merged = results.flat();
  merged.sort((a, b) => a.priceCents - b.priceCents);
  return merged;
}
