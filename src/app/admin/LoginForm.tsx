'use client';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Falha no login');
      location.href = '/admin/dashboard';
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label">E-mail</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" autoComplete="username" />
      </div>
      <div>
        <label className="label">Senha</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" autoComplete="current-password" />
      </div>
      {err && <div className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">{err}</div>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
