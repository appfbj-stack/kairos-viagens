export const metadata = { title: 'Termos de Uso' };

export default function TermosPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 prose prose-slate">
      <h1>Termos de Uso</h1>
      <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

      <h2>1. Aceitação</h2>
      <p>Ao usar o Kairós Viagens você concorda com estes Termos.</p>

      <h2>2. O serviço</h2>
      <p>
        O Kairós Viagens é um comparador independente. As ofertas são fornecidas por parceiros e podem
        mudar sem aviso. Não emitimos passagens, hospedagens ou pacotes diretamente — a reserva é concluída
        no site do parceiro.
      </p>

      <h2>3. Preços</h2>
      <p>
        Os preços são convertidos pelos próprios parceiros. Podem variar por data, disponibilidade e
        impostos. O valor final é o exibido no site do parceiro.
      </p>

      <h2>4. Limitação de responsabilidade</h2>
      <p>Não nos responsabilizamos por serviços prestados pelos parceiros.</p>

      <h2>5. Links de afiliados</h2>
      <p>
        Este site contém links de afiliados. Ao reservar pelo nosso site, podemos receber comissão
        sem custo adicional para você.
      </p>
    </article>
  );
}
