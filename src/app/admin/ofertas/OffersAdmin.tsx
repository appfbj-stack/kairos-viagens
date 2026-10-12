'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Offer {
  id: string; slug: string; type: string; title: string; status: string;
  subtitle?: string | null;
  description?: string | null;
  originCity?: string | null;
  originIata?: string | null;
  destinationCity?: string | null;
  destinationIata?: string | null;
  departureDate?: string | null;
  returnDate?: string | null;
  nights?: number | null;
  carrier?: string | null;
  hotelName?: string | null;
  priceCents: number; currency: string;
  priceOldCents?: number | null;
  heroImage?: string | null;
  expiresAt?: string | null;
  featured?: boolean;
  sourceUrl?: string | null;
  partner: { id: string; name: string } | null;
  destination: { id: string; name: string } | null;
  updatedAt: string;
}

const TYPES = ['FLIGHT', 'HOTEL', 'PACKAGE'] as const;
const STATUSES = ['active', 'paused', 'expired'] as const;

function brl(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(cents / 100);
}

export function OffersAdmin({
  offers: initial,
  partners,
  destinations,
}: {
  offers: Offer[];
  partners: { id: string; name: string }[];
  destinations: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [offers, setOffers] = useState(initial);
  const [editing, setEditing] = useState<Partial<Offer> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reload = async () => {
    const r = await fetch('/api/admin/offers');
    const data = await r.json();
    if (r.ok) setOffers(data.offers);
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        type: editing.type,
        title: editing.title,
        subtitle: editing.subtitle ?? null,
        description: editing.description ?? null,
        originCity: editing.originCity ?? null,
        originIata: editing.originIata ?? null,
        destinationCity: editing.destinationCity ?? null,
        destinationIata: editing.destinationIata ?? null,
        destinationId: editing.destination?.id ?? null,
        carrier: editing.carrier ?? null,
        hotelName: editing.hotelName ?? null,
        departureDate: editing.departureDate ?? null,
        returnDate: editing.returnDate ?? null,
        nights: editing.nights ?? null,
        priceCents: editing.priceCents ?? 0,
        priceOldCents: editing.priceOldCents ?? null,
        currency: editing.currency ?? 'BRL',
        heroImage: editing.heroImage ?? null,
        partnerId: editing.partner?.id ?? null,
        status: editing.status ?? 'active',
        expiresAt: editing.expiresAt ?? null,
        featured: !!editing.featured,
        sourceUrl: editing.sourceUrl ?? null,
      };
      const url = editing.id ? `/api/admin/offers/${editing.id}` : '/api/admin/offers';
      const method = editing.id ? 'PATCH' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? 'Erro ao salvar');
      setEditing(null);
      await reload();
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir esta oferta?')) return;
    await fetch(`/api/admin/offers/${id}`, { method: 'DELETE' });
    await reload();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-black">Ofertas</h1>
        <button onClick={() => setEditing({ type: 'FLIGHT', status: 'active', currency: 'BRL', priceCents: 0, featured: false, title: '' })} className="btn-primary">
          + Nova oferta
        </button>
      </div>

      {err && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2.5 rounded-lg">{err}</div>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="text-left p-3">Oferta</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Preço</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Atualizada</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {offers.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhuma oferta. Crie a primeira.</td></tr>
            )}
            {offers.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="p-3">
                  <div className="font-medium">{o.title}</div>
                  <div className="text-xs text-slate-500">{o.partner?.name ?? '—'}</div>
                </td>
                <td className="p-3 text-xs">{o.type}</td>
                <td className="p-3 font-bold">{brl(o.priceCents)}</td>
                <td className="p-3">
                  <span className={`badge ${o.status === 'active' ? 'bg-emerald-50 text-emerald-700' : o.status === 'paused' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-slate-500">{new Date(o.updatedAt).toLocaleDateString('pt-BR')}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(o as any)} className="text-xs text-brand-600 hover:underline mr-3">Editar</button>
                  <button onClick={() => remove(o.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">{editing.id ? 'Editar' : 'Nova'} oferta</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Título" required>
                <input className="input" value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </Field>
              <Field label="Tipo">
                <select className="input" value={editing.type ?? 'FLIGHT'} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Subtítulo">
                <input className="input" value={editing.subtitle ?? ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
              </Field>
              <Field label="Cidade de Origem">
                <input className="input" value={editing.originCity ?? ''} onChange={(e) => setEditing({ ...editing, originCity: e.target.value })} />
              </Field>
              <Field label="Cidade de Destino">
                <input className="input" value={editing.destinationCity ?? ''} onChange={(e) => setEditing({ ...editing, destinationCity: e.target.value })} />
              </Field>
              <Field label="IATA Origem">
                <input className="input" maxLength={4} value={editing.originIata ?? ''} onChange={(e) => setEditing({ ...editing, originIata: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="IATA Destino">
                <input className="input" maxLength={4} value={editing.destinationIata ?? ''} onChange={(e) => setEditing({ ...editing, destinationIata: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Companhia">
                <input className="input" value={editing.carrier ?? ''} onChange={(e) => setEditing({ ...editing, carrier: e.target.value })} />
              </Field>
              <Field label="Hotel">
                <input className="input" value={editing.hotelName ?? ''} onChange={(e) => setEditing({ ...editing, hotelName: e.target.value })} />
              </Field>
              <Field label="Preço (centavos)">
                <input type="number" className="input" value={editing.priceCents ?? 0} onChange={(e) => setEditing({ ...editing, priceCents: parseInt(e.target.value, 10) || 0 })} />
              </Field>
              <Field label="Preço antigo (centavos)">
                <input type="number" className="input" value={editing.priceOldCents ?? ''} onChange={(e) => setEditing({ ...editing, priceOldCents: e.target.value ? parseInt(e.target.value, 10) : null })} />
              </Field>
              <Field label="Status">
                <select className="input" value={editing.status ?? 'active'} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Em destaque">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
                  Mostrar na home
                </label>
              </Field>
              <Field label="Data de ida (YYYY-MM-DD)">
                <input className="input" placeholder="2026-12-25" value={editing.departureDate?.slice(0, 10) ?? ''} onChange={(e) => setEditing({ ...editing, departureDate: e.target.value })} />
              </Field>
              <Field label="Data de volta (YYYY-MM-DD)">
                <input className="input" placeholder="2027-01-05" value={editing.returnDate?.slice(0, 10) ?? ''} onChange={(e) => setEditing({ ...editing, returnDate: e.target.value })} />
              </Field>
              <Field label="Noites">
                <input type="number" className="input" value={editing.nights ?? ''} onChange={(e) => setEditing({ ...editing, nights: e.target.value ? parseInt(e.target.value, 10) : null })} />
              </Field>
              <Field label="Imagem de capa (URL)">
                <input className="input" value={editing.heroImage ?? ''} onChange={(e) => setEditing({ ...editing, heroImage: e.target.value })} />
              </Field>
              <Field label="URL de destino (afiliado)">
                <input className="input" value={editing.sourceUrl ?? ''} onChange={(e) => setEditing({ ...editing, sourceUrl: e.target.value })} />
              </Field>
              <Field label="Validade (YYYY-MM-DD)">
                <input className="input" value={editing.expiresAt?.slice(0, 10) ?? ''} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })} />
              </Field>
              <Field label="Parceiro">
                <select className="input" value={editing.partner?.id ?? ''} onChange={(e) => setEditing({ ...editing, partner: partners.find((p) => p.id === e.target.value) ?? null })}>
                  <option value="">— Nenhum —</option>
                  {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Destino">
                <select className="input" value={editing.destination?.id ?? ''} onChange={(e) => setEditing({ ...editing, destination: destinations.find((d) => d.id === e.target.value) ?? null })}>
                  <option value="">— Nenhum —</option>
                  {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="Descrição" full>
                <textarea className="input min-h-[100px]" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
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

function Field({ label, children, full }: { label: string; required?: boolean; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
