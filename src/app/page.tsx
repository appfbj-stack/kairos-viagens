import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SearchBox } from '@/components/SearchBox';
import { OfferCard } from '@/components/OfferCard';

export const revalidate = 300;

export default async function HomePage() {
  const [featured, popularDestinations] = await Promise.all([
    prisma.offer.findMany({
      where: { status: 'active', featured: true },
      take: 6,
      orderBy: { publishedAt: 'desc' },
      include: { partner: true, destination: true },
    }),
    prisma.destination.findMany({
      where: { active: true, popular: true },
      take: 8,
      orderBy: { name: 'asc' },
    }),
  ]);

  const now = new Date();
  const validFeatured = featured.filter((o) => !o.expiresAt || o.expiresAt > now);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              Encontre a próxima viagem dos seus sonhos
            </h1>
            <p className="mt-3 text-base sm:text-lg text-white/90">
              Compare voos, hotéis e pacotes. Economize tempo e dinheiro em um só lugar.
            </p>
          </div>
          <SearchBox />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Ofertas em destaque</h2>
            <p className="text-sm text-slate-500 mt-1">Selecionadas a dedo pra você economizar.</p>
          </div>
          <Link href="/ofertas" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            Ver todas →
          </Link>
        </div>
        {validFeatured.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            Em breve novas ofertas. Cadastre a primeira no{' '}
            <Link href="/admin" className="text-brand-600 font-semibold">painel admin</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {validFeatured.map((o) => (
              <OfferCard
                key={o.id}
                offer={{
                  id: o.id,
                  slug: o.slug,
                  type: o.type,
                  title: o.title,
                  subtitle: o.subtitle,
                  originCity: o.originCity,
                  destinationCity: o.destinationCity,
                  heroImage: o.heroImage,
                  priceCents: o.priceCents,
                  priceOldCents: o.priceOldCents,
                  currency: o.currency,
                  partnerName: o.partner?.name,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-5">Destinos populares</h2>
          {popularDestinations.length === 0 ? (
            <p className="text-slate-500 text-sm">Cadastre destinos no painel para aparecerem aqui.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {popularDestinations.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinos/${d.slug}`}
                  className="card p-4 hover:shadow-md transition group"
                >
                  <div className="text-3xl mb-1">📍</div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-600">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.country}{d.state ? ` · ${d.state}` : ''}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-5">Por que usar a Kairós Viagens?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🔎', title: 'Pesquisa inteligente', desc: 'Comparamos várias fontes em segundos.' },
            { icon: '💸', title: 'Preços em real', desc: 'Valores claros em BRL quando fornecidos.' },
            { icon: '🛡️', title: 'Reserva segura', desc: 'A reserva é concluída direto no site do parceiro.' },
          ].map((f) => (
            <div key={f.title} className="card p-5">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-bold mt-2">{f.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
