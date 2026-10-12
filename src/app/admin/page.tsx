import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect('/admin/dashboard');
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="card p-6 w-full max-w-sm">
        <h1 className="text-xl font-black text-slate-900 mb-1">Painel Kairós Viagens</h1>
        <p className="text-xs text-slate-500 mb-4">Acesso restrito ao administrador.</p>
        <LoginForm />
      </div>
    </div>
  );
}
