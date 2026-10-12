import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';

const updateSchema = z.object({
  type: z.enum(['FLIGHT', 'HOTEL', 'PACKAGE']).optional(),
  title: z.string().min(3).optional(),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  originCity: z.string().nullable().optional(),
  originIata: z.string().nullable().optional(),
  destinationCity: z.string().nullable().optional(),
  destinationIata: z.string().nullable().optional(),
  destinationId: z.string().nullable().optional(),
  carrier: z.string().nullable().optional(),
  hotelName: z.string().nullable().optional(),
  departureDate: z.string().nullable().optional(),
  returnDate: z.string().nullable().optional(),
  nights: z.coerce.number().int().min(0).nullable().optional(),
  priceCents: z.coerce.number().int().min(0).optional(),
  priceOldCents: z.coerce.number().int().min(0).nullable().optional(),
  currency: z.string().optional(),
  heroImage: z.string().url().nullable().optional(),
  galleryJson: z.string().nullable().optional(),
  partnerId: z.string().nullable().optional(),
  status: z.enum(['active', 'paused', 'expired']).optional(),
  expiresAt: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
  featured: z.coerce.boolean().optional(),
  sourceUrl: z.string().url().nullable().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const offer = await prisma.offer.findUnique({
    where: { id: params.id },
    include: { partner: true, destination: true },
  });
  if (!offer) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json({ offer });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  }
  const data: any = { ...parsed.data };
  if (data.departureDate !== undefined) data.departureDate = data.departureDate ? new Date(data.departureDate) : null;
  if (data.returnDate !== undefined) data.returnDate = data.returnDate ? new Date(data.returnDate) : null;
  if (data.expiresAt !== undefined) data.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  const offer = await prisma.offer.update({ where: { id: params.id }, data });
  // histórico de preço
  if (parsed.data.priceCents !== undefined) {
    await prisma.offerPriceHistory.create({
      data: { offerId: offer.id, priceCents: offer.priceCents, currency: offer.currency },
    }).catch(() => null);
  }
  return NextResponse.json({ offer });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  await prisma.offer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
