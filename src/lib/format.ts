// ── Helpers de formatação e utilitários ──────────────────────────────────────

export function formatBRL(cents: number, currency = 'BRL'): string {
  if (currency !== 'BRL') {
    const value = cents / 100;
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${currency} ${value.toFixed(0)}`;
    }
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function safeRedirectUrl(url: string, fallback = '/'): string {
  if (!isValidUrl(url)) return fallback;
  // Bloqueia protocolos perigosos (javascript:, data:, vbscript:)
  if (/^(javascript|data|vbscript):/i.test(url)) return fallback;
  return url;
}

export function parseDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
