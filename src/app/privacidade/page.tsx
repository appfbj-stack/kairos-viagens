export const metadata = { title: 'Política de Privacidade' };

export default function PrivacidadePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 prose prose-slate">
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <h2>1. Dados que coletamos</h2>
      <p>
        Coletamos o mínimo necessário para operar o site: dados de navegação (endereço IP, user agent, páginas
        visitadas) e, se você salvar uma pesquisa ou alerta, o e-mail informado.
      </p>

      <h2>2. Como usamos</h2>
      <p>
        Usamos os dados para: (a) exibir ofertas de parceiros; (b) mensurar desempenho do site; (c) responder
        solicitações quando você opta por alertas de preço.
      </p>

      <h2>3. Compartilhamento</h2>
      <p>
        Ao clicar em uma oferta, você é redirecionado ao site do parceiro. Nesse momento, o site do parceiro
        pode coletar dados diretamente sob a política dele. Não vendemos seus dados.
      </p>

      <h2>4. Cookies</h2>
      <p>Usamos cookies essenciais para sessão do painel administrativo e preferências. Não usamos
        cookies de rastreamento publicitário.</p>

      <h2>5. Direitos do titular (LGPD)</h2>
      <p>Você pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail
        <code>privacidade@kairosviagens.com</code>.</p>

      <h2>6. Retenção</h2>
      <p>Logs de pesquisa são mantidos por até 12 meses, salvo obrigação legal diversa.</p>
    </article>
  );
}
