import Link from 'next/link';

const navItems = [
  { href: '/voos', label: 'Voos' },
  { href: '/hoteis', label: 'Hotéis' },
  { href: '/pacotes', label: 'Pacotes' },
  { href: '/ofertas', label: 'Ofertas' },
  { href: '/destinos', label: 'Destinos' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black">
              K
            </div>
            <span className="text-lg font-extrabold text-slate-900">Kairós <span className="text-brand-500">Viagens</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((it) => (
              <Link key={it.href} href={it.href} className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg">
                {it.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hidden sm:inline-flex text-xs text-slate-500 hover:text-slate-900">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
