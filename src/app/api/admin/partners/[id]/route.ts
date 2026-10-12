import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(['flight', 'hotel', 'package']).optional(),
  description: z.string().nullable().optional(),
  logoUrl: z.string().url().nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  affiliateId: z.string().nullable().optional(),
  affiliateBaseUrl: z.string().url().nullable().optional(),
  redirectTemplate: z.string().nullable().optional(),
  status: z.enum(['test', 'demo', 'production', 'disabled']).optional(),
  notes: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  const partner = await prisma.partner.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json({ partner });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  await prisma.partner.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
