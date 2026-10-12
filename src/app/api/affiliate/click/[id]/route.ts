import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeRedirectUrl } from '@/lib/format';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const offer = await prisma.offer.findUnique({ where: { id }, include: { partner: true } });
  if (!offer) return NextResponse.json({ error: 'Oferta não encontrada' }, { status: 404 });
  if (offer.status !== 'active' || (offer.expiresAt && offer.expiresAt < new Date())) {
    return NextResponse.json({ error: 'Oferta expirada' }, { status: 410 });
  }
  const target = buildAffiliateUrl(offer.sourceUrl, offer.partner, offer.id);
  if (!target) return NextResponse.json({ error: 'Link de afiliado indisponível' }, { status: 502 });

  await logClick(req, offer.id, offer.partnerId);
  await prisma.offer.update({ where: { id: offer.id }, data: { clicks: { increment: 1 } } }).catch(() => null);

  return NextResponse.redirect(target, { status: 302 });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // usado para tracking sem redirect (disparado pelo front)
  const offer = await prisma.offer.findUnique({ where: { id: params.id } });
  if (!offer) return NextResponse.json({ error: 'Oferta não encontrada' }, { status: 404 });
  await logClick(req, offer.id, offer.partnerId);
  await prisma.offer.update({ where: { id: offer.id }, data: { clicks: { increment: 1 } } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

function buildAffiliateUrl(sourceUrl: string | null, partner: any, offerId: string) {
  // 1) Template customizado do parceiro
  if (partner?.redirectTemplate) {
    const tpl = partner.redirectTemplate as string;
    return safeRedirectUrl(
      tpl
        .replace('${targetUrl}', encodeURIComponent(sourceUrl ?? ''))
        .replace('${affiliateId}', encodeURIComponent(partner.affiliateId ?? ''))
        .replace('${offerId}', encodeURIComponent(offerId)),
      '/',
    );
  }
  // 2) Base URL do parceiro + parâmetros
  if (partner?.affiliateBaseUrl && sourceUrl) {
    const base = partner.affiliateBaseUrl as string;
    const sep = base.includes('?') ? '&' : '?';
    const aff = partner.affiliateId ? `aff=${encodeURIComponent(partner.affiliateId)}&` : '';
    return safeRedirectUrl(`${base}${sep}${aff}dest=${encodeURIComponent(sourceUrl)}`, '/');
  }
  // 3) Fallback: sourceUrl direto (deve estar cadastrado e validado)
  return sourceUrl ? safeRedirectUrl(sourceUrl, '/') : null;
}

async function logClick(req: NextRequest, offerId: string, partnerId: string | null) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
  const userAgent = req.headers.get('user-agent') ?? null;
  const referer = req.headers.get('referer') ?? null;
  await prisma.affiliateClick.create({
    data: { offerId, partnerId, ip, userAgent, referer, redirected: true },
  }).catch(() => null);
}
