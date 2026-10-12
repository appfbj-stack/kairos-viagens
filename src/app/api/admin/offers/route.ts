import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/format';
import { z } from 'zod';

export const runtime = 'nodejs';

const offerSchema = z.object({
  type: z.enum(['FLIGHT', 'HOTEL', 'PACKAGE']),
  title: z.string().min(3),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  originCity: z.string().optional().nullable(),
  originIata: z.string().optional().nullable(),
  destinationCity: z.string().optional().nullable(),
  destinationIata: z.string().optional().nullable(),
  destinationId: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  hotelName: z.string().optional().nullable(),
  departureDate: z.string().optional().nullable(),
  returnDate: z.string().optional().nullable(),
  nights: z.coerce.number().int().min(0).optional().nullable(),
  priceCents: z.coerce.number().int().min(0),
  priceOldCents: z.coerce.number().int().min(0).optional().nullable(),
  currency: z.string().default('BRL'),
  heroImage: z.string().url().optional().nullable(),
  galleryJson: z.string().optional().nullable(),
  partnerId: z.string().optional().nullable(),
  status: z.enum(['active', 'paused', 'expired']).default('active'),
  expiresAt: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  featured: z.coerce.boolean().default(false),
  sourceUrl: z.string().url().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const q = searchParams.get('q');
  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (q) where.title = { contains: q, mode: 'insensitive' };
  const offers = await prisma.offer.findMany({
    where,
    take: 200,
    orderBy: [{ updatedAt: 'desc' }],
    include: { partner: true, destination: true },
  });
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const body = await req.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }
  const data = parsed.data;
  const baseSlug = slugify(data.title);
  let slug = baseSlug || `offer-${Date.now()}`;
  let n = 1;
  while (await prisma.offer.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }
  const offer = await prisma.offer.create({
    data: {
      ...data,
      slug,
      departureDate: data.departureDate ? new Date(data.departureDate) : null,
      returnDate: data.returnDate ? new Date(data.returnDate) : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      priceOldCents: data.priceOldCents ?? null,
    },
  });
  return NextResponse.json({ offer });
}
