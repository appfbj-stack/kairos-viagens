'use client';

import { useState } from 'react';

export function AffiliateLink({
  offerId,
  className = 'btn-primary',
  children,
  newTab = true,
}: {
  offerId: string;
  className?: string;
  children: React.ReactNode;
  newTab?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const href = `/api/affiliate/click/${offerId}`;

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // deixa abrir em nova aba pelo browser
    e.preventDefault();
    setLoading(true);
    // Dispara o tracking via fetch (não bloqueante) e abre o link
    fetch(href, { method: 'POST', keepalive: true }).catch(() => {});
    setTimeout(() => {
      window.open(href, newTab ? '_blank' : '_self', 'noopener,noreferrer');
      setLoading(false);
    }, 50);
  };

  return (
    <a
      href={href}
      onClick={onClick}
      className={className}
      target={newTab ? '_blank' : undefined}
      rel="noopener noreferrer sponsored"
    >
      {loading ? 'Carregando…' : children}
    </a>
  );
}
