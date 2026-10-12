import { NextRequest, NextResponse } from 'next/server';

// Rate limit simples in-memory (suficiente para MVP; em produção usar Redis/Upstash)
const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 120;

function clientKey(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
    const key = `${clientKey(req)}:${pathname.startsWith('/api/admin') ? 'admin' : 'public'}`;
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || b.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      b.count++;
      if (b.count > MAX_REQ) {
        return NextResponse.json({ error: 'Muitas requisições. Tente em instantes.' }, { status: 429 });
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
