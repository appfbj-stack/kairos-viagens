'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Destination {
  id: string; slug: string; name: string; country: string;
  state: string | null; city: string | null; iataCode: string | null;
  popular: boolean; active: boolean; heroImage: string | null; description: string | null;
}

export function DestinosAdmin({ destinations: initial }: { destinations: Destination[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Partial<Destination> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reload = async () => {
    const r = await fetch('/api/admin/destinations');
    if (r.ok) setItems((await r.json()).destinations);
  };
  const save = async () => {
    if (!editing) return;
    setBusy(true); setErr(null);
    try {
      const payload = {
        name: editing.name, country: editing.country,
        state: editing.state ?? null, city: editing.city ?? null,
        iataCode: editing.iataCode ?? null, heroImage: editing.heroImage ?? null,
        description: editing.description ?? null,
        popular: !!editing.popular, active: editing.active !== false,
      };
      const url = editing.id ? `/api/admin/destinations/${editing.id}` : '/api/admin/destinations';
      const r = await fetch(url, { method: editing.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Erro');
      setEditing(null);
      await reload();
      router.refresh();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!confirm('Excluir este destino?')) return;
    await fetch(`/api/admin/destinations/${id}`, { method: 'DELETE' });
    await reload();
  };

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Destinos</h1>
        <button onClick={() => setEditing({ active: true, popular: false, name: '', country: 'Brasil' })} className="btn-primary">+ Novo destino</button>
      </div>
      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">{err}</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="text-left p-3">Nome</th><th className="text-left p-3">Local</th><th className="text-left p-3">IATA</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhum destino.</td></tr>}
            {items.map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{d.name}{d.popular && <span className="ml-2 badge bg-amber-100 text-amber-800">Popular</span>}</td>
                <td className="p-3 text-xs text-slate-600">{d.country}{d.state ? ` · ${d.state}` : ''}</td>
                <td className="p-3 text-xs font-mono">{d.iataCode ?? '—'}</td>
                <td className="p-3"><span className={`badge ${d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{d.active ? 'ativo' : 'inativo'}</span></td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(d)} className="text-xs text-brand-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => remove(d.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editing.id ? 'Editar' : 'Novo'} destino</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="label">Nome</label><input className="input" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><label className="label">País</label><input className="input" value={editing.country ?? ''} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></div>
              <div><label className="label">Estado</label><input className="input" value={editing.state ?? ''} onChange={(e) => setEditing({ ...editing, state: e.target.value })} /></div>
              <div><label className="label">Cidade</label><input className="input" value={editing.city ?? ''} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></div>
              <div><label className="label">IATA</label><input className="input" maxLength={4} value={editing.iataCode ?? ''} onChange={(e) => setEditing({ ...editing, iataCode: e.target.value.toUpperCase() })} /></div>
              <div className="col-span-2"><label className="label">Imagem (URL)</label><input className="input" value={editing.heroImage ?? ''} onChange={(e) => setEditing({ ...editing, heroImage: e.target.value })} /></div>
              <div className="col-span-2"><label className="label">Descrição</label><textarea className="input min-h-[80px]" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><label className="label">Popular</label><label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!editing.popular} onChange={(e) => setEditing({ ...editing, popular: e.target.checked })} /> Mostrar na home</label></div>
              <div><label className="label">Ativo</label><label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Visível no site</label></div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="btn-secondary">Cancelar</button>
              <button onClick={save} disabled={busy} className="btn-primary">{busy ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
