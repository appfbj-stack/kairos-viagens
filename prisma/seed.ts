import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL ?? 'admin@kairosviagens.com').toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? 'Troque@Senha123';
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name: 'Administrador',
        role: 'super_admin',
      },
    });
    console.log(`✓ Admin criado: ${email}`);
  } else {
    console.log(`= Admin já existe: ${email}`);
  }

  // Partners (stubs de demonstração)
  const partnersData = [
    { name: 'Catálogo Local', type: 'flight', status: 'demo', description: 'Ofertas cadastradas manualmente no painel.' },
    { name: 'Skyscanner', type: 'flight', status: 'test', description: 'Conector preparado — pendente de credenciais e aprovação comercial.' },
    { name: 'Booking.com', type: 'hotel', status: 'test', description: 'Conector preparado — pendente de parceria comercial.' },
    { name: 'Amadeus for Developers', type: 'flight', status: 'test', description: 'Conector preparado — pendente de API key.' },
    { name: 'Expedia Group', type: 'package', status: 'test', description: 'Conector preparado — pendente de parceria.' },
  ];
  for (const p of partnersData) {
    const slug = p.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.partner.upsert({
      where: { slug },
      update: {},
      create: { ...p, slug, status: p.status as any },
    });
  }
  console.log(`✓ Partners: ${partnersData.length}`);

  // Destinos
  const destinationsData = [
    { name: 'Rio de Janeiro', country: 'Brasil', state: 'RJ', city: 'Rio de Janeiro', iataCode: 'GIG', popular: true, description: 'Cidade Maravilhosa. Praias, Cristo Redentor e muita cultura.' },
    { name: 'São Paulo', country: 'Brasil', state: 'SP', city: 'São Paulo', iataCode: 'GRU', popular: true, description: 'Maior metrópole do país. Gastronomia, museus e vida noturna.' },
    { name: 'Salvador', country: 'Brasil', state: 'BA', city: 'Salvador', iataCode: 'SSA', popular: true, description: 'Capital da Bahia. Pelourinho, acarajé e axé.' },
    { name: 'Florianópolis', country: 'Brasil', state: 'SC', city: 'Florianópolis', iataCode: 'FLN', popular: true, description: 'Ilha da Magia. 42 praias e trilhas.' },
    { name: 'Maceió', country: 'Brasil', state: 'AL', city: 'Maceió', iataCode: 'MCZ', popular: false, description: 'Praias paradisíacas do Nordeste.' },
    { name: 'Lisboa', country: 'Portugal', city: 'Lisboa', iataCode: 'LIS', popular: true, description: 'Capital portuguesa. Pastéis, fado e vista para o Tejo.' },
    { name: 'Buenos Aires', country: 'Argentina', city: 'Buenos Aires', iataCode: 'EZE', popular: true, description: 'Tango, carne e arquitetura europeia.' },
  ];
  for (const d of destinationsData) {
    const slug = `${d.name}-${d.state ?? d.country}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await prisma.destination.upsert({
      where: { slug },
      update: {},
      create: { ...d, slug, active: true } as any,
    });
  }
  console.log(`✓ Destinations: ${destinationsData.length}`);

  // Algumas ofertas demo
  const local = await prisma.partner.findFirst({ where: { slug: 'catalogo-local' } });
  const rj = await prisma.destination.findFirst({ where: { slug: { contains: 'rio-de-janeiro' } } });
  const sp = await prisma.destination.findFirst({ where: { slug: { contains: 'sao-paulo' } } });
  const sa = await prisma.destination.findFirst({ where: { slug: { contains: 'salvador' } } });

  const offersData = [
    {
      type: 'FLIGHT', title: 'Voo São Paulo → Rio de Janeiro', subtitle: 'Voo direto • Ida e volta',
      originCity: 'São Paulo', originIata: 'GRU', destinationCity: 'Rio de Janeiro', destinationIata: 'GIG',
      destinationId: rj?.id, carrier: 'LATAM', priceCents: 39900, priceOldCents: 59900, featured: true,
      departureDate: new Date(Date.now() + 30 * 86400000), returnDate: new Date(Date.now() + 37 * 86400000),
      sourceUrl: 'https://exemplo.com.br/oferta/sp-rj',
    },
    {
      type: 'FLIGHT', title: 'Voo São Paulo → Salvador', subtitle: 'Com escala • Ida e volta',
      originCity: 'São Paulo', originIata: 'GRU', destinationCity: 'Salvador', destinationIata: 'SSA',
      destinationId: sa?.id, carrier: 'GOL', priceCents: 64900, priceOldCents: 89900, featured: true,
      departureDate: new Date(Date.now() + 45 * 86400000), returnDate: new Date(Date.now() + 52 * 86400000),
      sourceUrl: 'https://exemplo.com.br/oferta/sp-sa',
    },
    {
      type: 'HOTEL', title: 'Hotel Copacabana Palace', subtitle: '5 estrelas • Rio de Janeiro',
      destinationCity: 'Rio de Janeiro', destinationId: rj?.id, hotelName: 'Copacabana Palace',
      priceCents: 120000, priceOldCents: 180000, featured: true,
      nights: 3, sourceUrl: 'https://exemplo.com.br/hotel/copacabana',
    },
    {
      type: 'HOTEL', title: 'Pousada Tropical', subtitle: 'Beira-mar • Maceió',
      destinationCity: 'Maceió', hotelName: 'Pousada Tropical',
      priceCents: 35000, featured: true, nights: 5, sourceUrl: 'https://exemplo.com.br/hotel/maceio',
    },
    {
      type: 'PACKAGE', title: 'Pacote Rio + Pão de Açúcar', subtitle: 'Voo + hotel 3 noites',
      originCity: 'São Paulo', originIata: 'GRU', destinationCity: 'Rio de Janeiro', destinationIata: 'GIG',
      destinationId: rj?.id, priceCents: 149900, priceOldCents: 199900, featured: true,
      nights: 3, sourceUrl: 'https://exemplo.com.br/pacote/rio',
    },
  ];
  for (const o of offersData) {
    const baseSlug = o.title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.offer.findUnique({ where: { slug } })) slug = `${baseSlug}-${n++}`;
    await prisma.offer.create({
      data: { ...o, slug, status: 'active', partnerId: local?.id, currency: 'BRL' } as any,
    });
  }
  console.log(`✓ Offers demo: ${offersData.length}`);
  console.log('Seed concluído.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
