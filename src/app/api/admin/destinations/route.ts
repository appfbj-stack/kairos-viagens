import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { slugify } from '@/lib/format';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(2),
  country: z.string().min(2),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  heroImage: z.string().url().optional().nullable(),
  iataCode: z.string().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  popular: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const destinations = await prisma.destination.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ destinations });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.issues }, { status: 400 });
  const data = parsed.data;
  const baseSlug = slugify(`${data.name}-${data.state ?? data.country}`);
  let slug = baseSlug || `dest-${Date.now()}`;
  let n = 1;
  while (await prisma.destination.findUnique({ where: { slug } })) slug = `${baseSlug}-${n++}`;
  const destination = await prisma.destination.create({ data: { ...data, slug } });
  return NextResponse.json({ destination });
}
