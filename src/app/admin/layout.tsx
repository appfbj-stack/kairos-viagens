import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export const metadata = { title: 'Painel Administrativo', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-slate-100">
      {user ? (
        <header className="bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="font-bold">Kairós <span className="text-brand-500">Admin</span></Link>
              <nav className="hidden md:flex gap-1 text-sm">
                <Link href="/admin/dashboard" className="px-2 py-1 hover:bg-slate-800 rounded">Dashboard</Link>
                <Link href="/admin/ofertas" className="px-2 py-1 hover:bg-slate-800 rounded">Ofertas</Link>
                <Link href="/admin/destinos" className="px-2 py-1 hover:bg-slate-800 rounded">Destinos</Link>
                <Link href="/admin/parceiros" className="px-2 py-1 hover:bg-slate-800 rounded">Parceiros</Link>
                <Link href="/admin/afiliados" className="px-2 py-1 hover:bg-slate-800 rounded">Afiliados</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 hidden sm:inline">{user.name}</span>
              <form action="/api/admin/auth/login" method="POST" onSubmit={(e) => { e.preventDefault(); fetch('/api/admin/auth/login', { method: 'DELETE' }).then(() => location.href = '/admin'); }}>
                <button type="button" onClick={async () => { await fetch('/api/admin/auth/login', { method: 'DELETE' }); location.href = '/admin'; }} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </header>
      ) : null}
      {children}
    </div>
  );
}
