# Kairós Viagens

Plataforma de pesquisa e descoberta de viagens (voos, hotéis e pacotes) com integração a parceiros via links de afiliados.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Prisma** + **PostgreSQL** (DB dedicado no `kairos-shared-pg`)
- **JWT** em cookie httpOnly (autenticação do painel)
- **PWA** (manifest + service worker)
- **Cloudflare** para DNS/proxy quando aplicável

## Estrutura

```
src/
├── app/                    # Rotas App Router
│   ├── page.tsx           # Home pública
│   ├── voos/ hoteis/ pacotes/ ofertas/ destinos/  # Páginas públicas
│   ├── admin/             # Painel (login + CRUD)
│   ├── api/
│   │   ├── affiliate/click/[id]   # Tracking + redirect
│   │   ├── admin/auth/             # Login/logout/me
│   │   ├── admin/offers/ destinations/ partners/  # CRUD admin
│   │   └── health/                 # Health check
│   ├── privacidade/ termos/ afiliados/  # Páginas legais
│   ├── robots.ts  sitemap.ts
│   └── manifest.json  sw.js   # PWA
├── components/             # Navbar, Footer, SearchBox, OfferCard, AffiliateLink
├── lib/                    # prisma, auth, providers, format
└── middleware.ts           # rate limit
prisma/
├── schema.prisma
└── seed.ts                 # Admin + partners/destinos/ofertas demo
```

## Setup local

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.example .env
# edite DATABASE_URL e JWT_SECRET

# 3. Banco (precisa do Postgres rodando)
npx prisma migrate dev
npx tsx prisma/seed.ts

# 4. Rodar
npm run dev
```

## Deploy (Dokploy)

1. **Criar DB no `kairos-shared-pg`:**
   ```sql
   CREATE DATABASE kairos_viagens_db;
   CREATE USER kairos_viagens WITH PASSWORD '<senha>';
   GRANT ALL PRIVILEGES ON DATABASE kairos_viagens_db TO kairos_viagens;
   ```

2. **Criar projeto no Dokploy** apontando pra este repo.

3. **Env vars (no Dokploy):**
   - `DB_PASSWORD` (senha do user)
   - `JWT_SECRET` (`openssl rand -base64 48`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`

4. **Build:** `docker compose build`
5. **Start:** `docker compose up -d`
6. **Migrate + seed (one-shot):**
   ```bash
   docker compose run --rm migrate
   ```

7. **Caddy (já configurado):**
   ```
   viagens.fbautomacao.space {
     reverse_proxy 127.0.0.1:3055
   }
   api.viagens.fbautomacao.space {
     reverse_proxy 127.0.0.1:3055
   }
   ```

8. **Cloudflare DNS:** CNAME `viagens` → VPS.

## Conectores (status atual)

| Provider | Status | Notas |
|---|---|---|
| Catálogo Local | `demo` | Ofertas cadastradas no painel. Sempre disponível. |
| Skyscanner | `test` | Precisa aprovação comercial + credenciais. |
| Booking.com | `test` | Precisa parceria comercial. |
| Amadeus | `test` | Free tier limitado — avaliar. |
| Expedia | `test` | Precisa parceria. |

**Não há credenciais reais configuradas.** Todos os conectores de parceiros externos são stubs. As ofertas no ar vêm do Catálogo Local.

## Credenciais e aprovações pendentes

Para ativar os parceiros reais:
- Skyscanner: cadastro em https://developers.skyscanner.net + aprovação
- Booking.com: cadastro em https://join.booking.com + link de afiliado
- Amadeus: API key em https://developers.amadeus.com (free tier)
- Expedia: cadastro em https://developer.expediagroup.com

## Segurança & LGPD

- HTTPS obrigatório
- JWT em cookie httpOnly
- Variáveis de ambiente para segredos
- Validação com Zod em todas as APIs
- Rate limit no middleware (120 req/min por IP)
- Health check em `/api/health`
- Política de Privacidade + Termos + Divulgação de Afiliados

## Custos recorrentes

- VPS Dokploy: já contratado (sem custo adicional)
- Cloudflare DNS: free tier
- Domínio: já contratado
- Sem custos externos enquanto os conectores de parceiros estão em modo `test`

## Próximas melhorias

- Conector real Skyscanner/Amadeus
- Alertas de preço por e-mail
- Sistema de favoritos com auth
- Cache de busca com TTL
- Internacionalização (es/en)

## Testes manuais sugeridos

- `/api/health` retorna 200
- Login admin funciona
- Cadastrar oferta, parceiro e destino
- Clicar numa oferta redireciona e registra o clique
- Buscar voos/hotéis/pacotes retorna resultados
- `/sitemap.xml` e `/robots.txt` retornam corretamente
