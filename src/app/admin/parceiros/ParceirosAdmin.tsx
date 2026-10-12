'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Partner {
  id: string; name: string; slug: string; type: string; status: string;
  affiliateId: string | null; affiliateBaseUrl: string | null; redirectTemplate: string | null;
  offersCount: number; clicksCount: number;
}

const TYPES = ['flight', 'hotel', 'package'];
const STATUSES = ['test', 'demo', 'production', 'disabled'];

export function ParceirosAdmin({ partners: initial }: { partners: Partner[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Partial<Partner> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reload = async () => {
    const r = await fetch('/api/admin/partners');
    if (r.ok) setItems((await r.json()).partners);
  };
  const save = async () => {
    if (!editing) return;
    setBusy(true); setErr(null);
    try {
      const payload = {
        name: editing.name, type: editing.type,
        affiliateId: editing.affiliateId ?? null,
        affiliateBaseUrl: editing.affiliateBaseUrl ?? null,
        redirectTemplate: editing.redirectTemplate ?? null,
        status: editing.status ?? 'test',
      };
      const url = editing.id ? `/api/admin/partners/${editing.id}` : '/api/admin/partners';
      const r = await fetch(url, { method: editing.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? 'Erro');
      setEditing(null);
      await reload();
      router.refresh();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };
  const remove = async (id: string) => {
    if (!confirm('Excluir parceiro? Suas ofertas ficarão sem parceiro.')) return;
    await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' });
    await reload();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Parceiros</h1>
        <button onClick={() => setEditing({ name: '', type: 'flight', status: 'test' })} className="btn-primary">+ Novo parceiro</button>
      </div>
      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">{err}</div>}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ofertas</th>
              <th className="text-right p-3">Cliques</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhum parceiro.</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-xs">{p.type}</td>
                <td className="p-3">
                  <span className={`badge ${p.status === 'production' ? 'bg-emerald-50 text-emerald-700' : p.status === 'demo' ? 'bg-blue-50 text-blue-700' : p.status === 'test' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 text-right">{p.offersCount}</td>
                <td className="p-3 text-right">{p.clicksCount}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-xs text-brand-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => remove(p.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editing.id ? 'Editar' : 'Novo'} parceiro</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="label">Nome</label><input className="input" value={editing.name ?? ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><label className="label">Tipo</label><select className="input" value={editing.type ?? 'flight'} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="label">Status</label><select className="input" value={editing.status ?? 'test'} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="label">Affiliate ID</label><input className="input" value={editing.affiliateId ?? ''} onChange={(e) => setEditing({ ...editing, affiliateId: e.target.value })} /></div>
              <div><label className="label">Base URL</label><input className="input" value={editing.affiliateBaseUrl ?? ''} onChange={(e) => setEditing({ ...editing, affiliateBaseUrl: e.target.value })} /></div>
              <div className="col-span-2"><label className="label">Template de redirect (use ${targetUrl}, ${affiliateId}, ${offerId})</label><input className="input font-mono text-xs" value={editing.redirectTemplate ?? ''} onChange={(e) => setEditing({ ...editing, redirectTemplate: e.target.value })} /></div>
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
