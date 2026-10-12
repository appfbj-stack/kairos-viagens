import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-bold mb-3">Kairós Viagens</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Comparador independente de passagens, hotéis e pacotes. As ofertas são fornecidas por
              parceiros e podem mudar sem aviso.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3">Explorar</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/voos" className="hover:text-brand-600">Voos</Link></li>
              <li><Link href="/hoteis" className="hover:text-brand-600">Hotéis</Link></li>
              <li><Link href="/pacotes" className="hover:text-brand-600">Pacotes</Link></li>
              <li><Link href="/ofertas" className="hover:text-brand-600">Ofertas</Link></li>
              <li><Link href="/destinos" className="hover:text-brand-600">Destinos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Suporte</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li><Link href="/privacidade" className="hover:text-brand-600">Política de Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-brand-600">Termos de Uso</Link></li>
              <li><Link href="/afiliados" className="hover:text-brand-600">Divulgação de Afiliados</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Aviso</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Este site contém links de afiliados. Ao reservar pelo nosso site, podemos receber comissão
              sem custo adicional para você.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} Kairós Viagens. Todos os direitos reservados.</p>
          <p>Preços em BRL quando fornecidos pelo parceiro.</p>
        </div>
      </div>
    </footer>
  );
}
