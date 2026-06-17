# CI/CD da app Next.js em prisma-staging.planapp.gov.pt e prisma.planapp.gov.pt

## Workflows activos

- `.github/workflows/ci.yml`
  - valida lint e build em `pull_request` e `push` para `master`
- `.github/workflows/build-image.yml`
  - constrói e publica a imagem arm64 no GHCR
- `.github/workflows/deploy-staging.yml`
  - faz deploy manual para `prisma-staging.planapp.gov.pt`
- `.github/workflows/deploy-prod.yml`
  - faz deploy manual para `prisma.planapp.gov.pt`

## Estratégia

1. CI valida o código primeiro.
2. `build-image.yml` publica uma tag imutável no GHCR.
3. `deploy-staging.yml` promove essa tag para staging.
4. `deploy-prod.yml` promove exactamente a mesma tag para produção.

## Environments GitHub necessários

### staging
Secrets esperados:
- `AZURE_PRISMA_POSTGRES_DATABASE_URL`
- `AZURE_EMCGC_DATAMART_DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_TRUST_HOST`
- `AUTH_URL`
- `AUTH_AZURE_AD_ID`
- `AUTH_AZURE_AD_SECRET`
- `AUTH_AZURE_AD_TENANT`
- `GRAPH_AZURE_HUGO_TENANT_ID`
- `GRAPH_AZURE_HUGO_CLIENT_ID`
- `GRAPH_AZURE_HUGO_SECRET_ID`
- `GRAPH_AZURE_EMAIL_TEST`
- `EMAIL_PROVIDER`
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_CONTAINER_NAME`
- `AZURE_INFERENCE_ENDPOINT`
- `AZURE_INFERENCE_CREDENTIAL`

Valores esperados:
- `AUTH_URL=https://prisma-staging.planapp.gov.pt`
- `AUTH_TRUST_HOST=true`

### production
Secrets esperados:
- os mesmos de staging

Valores esperados:
- `AUTH_URL=https://prisma.planapp.gov.pt`
- `AUTH_TRUST_HOST=true`

O environment `production` não requer aprovação manual; a promoção para produção é controlada pela escolha explícita da `image_tag` no workflow.

## Nginx gerido pelo repositório

- `vm/nginx/staging.conf` -> `prisma-staging.planapp.gov.pt` -> `127.0.0.1:3002`
- `vm/nginx/production.conf` -> `prisma.planapp.gov.pt` -> `127.0.0.1:3000`

Os workflows copiam estes ficheiros para:
- `/etc/nginx/sites-available/prisma-staging.planapp.gov.pt.conf`
- `/etc/nginx/sites-available/prisma.planapp.gov.pt.conf`

No staging, o workflow remove o symlink legado:
- `/etc/nginx/sites-enabled/walking-skeleton-staging.conf`

## Docker Compose

- `docker-compose.staging.yml` publica o contentor `prisma-staging` em `127.0.0.1:3002`
- `docker-compose.prod.yml` publica o contentor `prisma-prod` em `127.0.0.1:3000`

Ambos usam a mesma imagem GHCR e variam apenas na configuração por environment.

## Fluxo operacional recomendado

1. Abrir PR e deixar `ci.yml` passar.
2. Fazer merge em `master`.
3. Correr `build-image.yml` com uma tag explícita, por exemplo `v2026.04.27-1`.
4. Correr `deploy-staging.yml` com a mesma tag.
5. Validar:
   - página inicial
   - login Microsoft Entra
   - `/api/health`
6. Correr `deploy-prod.yml` com a mesma tag.

## Rollback

Se um deploy falhar ou a versão for má:
1. identificar a última tag boa
2. relançar o workflow de deploy correspondente com essa tag

## Notas importantes

- staging e produção usam a mesma base de dados, pelo que a validação em staging deve ser cuidadosa
- produção nunca deve usar `latest`
- o workflow legado `.github/workflows/deploy-dev.yml` foi descontinuado
