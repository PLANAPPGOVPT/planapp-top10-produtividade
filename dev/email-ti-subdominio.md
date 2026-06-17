Para: TI Planapp / Equipa Infra
Assunto: Pedido de registo DNS para staging — novo serviço de votação

Olá,

Estamos a lançar uma app de consulta pública (votação top 10 medidas para a produtividade) e precisamos apenas do **registo DNS**:

1. **Registo DNS**
   - Subdomínio: `produtividade-staging.planapp.gov.pt`
   - Apontar para: `20.82.4.235` (VM nginx reverse proxy staging)
   - Tipo: A record
   - TTL: 300 (ou conforme política interna)

**Nota:** A configuração NGINX e certificado SSL serão geridos pela nossa equipa diretamente na VM reverse proxy.

**Contexto técnico:**
- A app corre num contentor Docker na VM ESPAP (interna: `172.30.26.11`)
- Expõe `127.0.0.1:3002` na VM ESPAP
- A VM staging EMCGC (`20.82.4.235`) atua como reverse proxy via NGINX, fazendo proxy pass para `172.30.26.11:3002`
- Não usa autenticação — utilizadores não autenticados votam anonimamente
- DB: PostgreSQL `support-schemas` acessível a partir da VM ESPAP

**Ficheiros no repositório:**
- Repo: `PLANAPPGOVPT/planapp-top10-produtividade`
- Docker compose: `astro-app/docker-compose.staging.yml`
- nginx config: `astro-app/vm/nginx/staging.conf`

Podem confirmar quando o registo DNS estiver ativo?

Obrigado,
Hugo
