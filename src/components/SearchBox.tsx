'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Type = 'voos' | 'hoteis' | 'pacotes';

export function SearchBox({ defaultType = 'voos' as Type }: { defaultType?: Type }) {
  const router = useRouter();
  const [type, setType] = useState<Type>(defaultType);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set('origem', origin);
    if (destination) params.set('destino', destination);
    if (departure) params.set('ida', departure);
    if (returnDate) params.set('volta', returnDate);
    params.set('adultos', String(adults));
    router.push(`/${type}?${params.toString()}`);
  };

  const tabs: { key: Type; label: string }[] = [
    { key: 'voos', label: 'Voos' },
    { key: 'hoteis', label: 'Hotéis' },
    { key: 'pacotes', label: 'Pacotes' },
  ];

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6">
      <div className="flex gap-1 mb-4 border-b border-slate-200 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${
              type === t.key
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="label">Origem</label>
          <input
            type="text"
            placeholder={type === 'voos' ? 'São Paulo (GRU)' : '—'}
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Destino</label>
          <input
            type="text"
            placeholder={type === 'hoteis' ? 'Cidade ou hotel' : 'Rio de Janeiro (GIG)'}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Ida</label>
          <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)} className="input" />
        </div>
        {type !== 'hoteis' && (
          <div>
            <label className="label">Volta</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="input" />
          </div>
        )}
        <div className={type === 'hoteis' ? '' : ''}>
          <label className="label">Pessoas</label>
          <select value={adults} onChange={(e) => setAdults(parseInt(e.target.value, 10))} className="input">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'pessoa' : 'pessoas'}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="submit" className="btn-primary">
          Buscar {type}
        </button>
      </div>
    </form>
  );
}
