Para: TI Planapp / Equipa Infra
Assunto: Pedido de registo DNS para staging — novo serviço de votação

Olá,

Estamos a lançar uma app de consulta pública (votação top 10 medidas para a produtividade) e precisamos apenas do **registo DNS**:

1. **Registo DNS**
   - Subdomínio: `produtividade-staging.planapp.gov.pt`
   - Apontar para: `20.82.4.235` (VM staging existente, mesma do prisma-staging)
   - Tipo: A record
   - TTL: 300 (ou conforme política interna)

**Nota:** A configuração NGINX e certificado SSL serão geridos pela nossa equipa diretamente na VM.

**Contexto técnico:**
- A app corre num contentor Docker na mesma VM staging (`pla-we-nrpd-prisma-vm001`)
- Expõe `127.0.0.1:3002` (mesmo pattern do prisma-staging)
- Não usa autenticação — utilizadores não autenticados votam anonimamente
- DB: PostgreSQL `support-schemas` no mesmo host que o staging

**Ficheiros no repositório:**
- Repo: `PLANAPPGOVPT/planapp-top10-produtividade`
- Docker compose: `astro-app/docker-compose.staging.yml`
- nginx config: `astro-app/vm/nginx/staging.conf`

Podem confirmar quando o registo DNS estiver ativo?

Obrigado,
Hugo
