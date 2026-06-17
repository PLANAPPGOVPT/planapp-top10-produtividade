Para: TI Planapp
Assunto: Pedido de subdomínio e config NGINX para novo serviço de votação

Olá,

Estamos a lançar uma app de consulta pública (votação top 10 medidas para a produtividade) e precisamos de:

1. **Registo DNS**
   - Subdomínio: `produtividade-staging.planapp.gov.pt`
   - Apontar para: `20.82.4.235` (VM staging existente, mesma do prisma-staging)
   - Tipo: A record

2. **Certificado SSL/Let's Encrypt**
   - Adicionar `produtividade-staging.planapp.gov.pt` ao certificado existente
   - Ou criar novo se necessário

3. **Configuração NGINX na VM**
   - Copiar `astro-app/vm/nginx/staging.conf` para:
     `/etc/nginx/sites-available/produtividade-staging.planapp.gov.pt.conf`
   - Criar symlink:
     `ln -sf /etc/nginx/sites-available/produtividade-staging.planapp.gov.pt.conf /etc/nginx/sites-enabled/`
   - Reload nginx: `sudo nginx -t && sudo systemctl reload nginx`

**Contexto técnico:**
- A app corre num contentor Docker na mesma VM staging (`pla-we-nrpd-prisma-vm001`)
- Expõe `127.0.0.1:3002` (mesmo pattern do prisma-staging)
- Não usa autenticação — utilizadores não autenticados votam anonimamente
- DB: PostgreSQL `support-schemas` no mesmo host que o staging

**Ficheiros no repositório:**
- Repo: `PLANAPPGOVPT/planapp-top10-produtividade`
- nginx config: `astro-app/vm/nginx/staging.conf`
- Docker compose: `astro-app/docker-compose.staging.yml`

Obrigado,
Hugo
