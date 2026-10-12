import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/format';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(['flight', 'hotel', 'package']),
  description: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  affiliateId: z.string().optional().nullable(),
  affiliateBaseUrl: z.string().url().optional().nullable(),
  redirectTemplate: z.string().optional().nullable(),
  status: z.enum(['test', 'demo', 'production', 'disabled']).default('test'),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const partners = await prisma.partner.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ partners });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  const data = parsed.data;
  const baseSlug = slugify(data.name);
  let slug = baseSlug || `partner-${Date.now()}`;
  let n = 1;
  while (await prisma.partner.findUnique({ where: { slug } })) slug = `${baseSlug}-${n++}`;
  const partner = await prisma.partner.create({ data: { ...data, slug } });
  return NextResponse.json({ partner });
}
