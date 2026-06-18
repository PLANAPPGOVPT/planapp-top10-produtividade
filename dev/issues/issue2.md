# Issue 2: Distinguir votos por grupo via links parametrizados

**Contexto:** Os elementos do Grupo de Acompanhamento e do Grupo de Aconselhamento Governativo também acederão à plataforma de inquérito. Na análise dos resultados, é necessário distinguir as votações destes três grupos:
- Conselho Consultivo (já auscultado em grupos focais e entrevistas)
- Grupo de Acompanhamento
- Grupo de Aconselhamento Governativo

**Decisão:** Em vez de perguntar ao respondente na interface, usar links parametrizados. Cada grupo recebe um link diferente no email, e o parâmetro `grupo` é registado junto com o voto.

## Tarefas

1. **Schema da base de dados**
   - Adicionar coluna `grupo` (text, nullable ou com default) na tabela `"projeto-produtividade-topten".votos`.

2. **Backend — API `/api/votar.ts`**
   - Aceitar `grupo` no body do POST.
   - Inserir `grupo` junto com `sessao_id`, `medida_id`, `ordem_preferencia`.

3. **Frontend — `VotacaoApp.tsx`**
   - Ler query parameter `grupo` da URL (ex: `?grupo=grupo-acompanhamento`).
   - Guardar o grupo em `localStorage` (ou state) e enviá-lo no payload do voto.
   - Valores esperados:
     - `conselho-consultivo`
     - `grupo-acompanhamento`
     - `grupo-aconselhamento-governativo`
     - (opcional) `publico` ou `null` para acesso genérico

4. **Testar e documentar**
   - Garantir que votos antigos (sem grupo) continuam a funcionar.
   - Documentar os 3 links a usar nos emails.

## Links a usar nos emails

Cada grupo deve receber o link com o respetivo query parameter:

- **Conselho Consultivo:**
  ```
  https://<dominio>/?grupo=conselho-consultivo
  ```

- **Grupo de Acompanhamento:**
  ```
  https://<dominio>/?grupo=grupo-acompanhamento
  ```

- **Grupo de Aconselhamento Governativo:**
  ```
  https://<dominio>/?grupo=grupo-aconselhamento-governativo
  ```

- **Acesso genérico / público:** (sem parâmetro — opcional)
  ```
  https://<dominio>/
  ```

## Migration da base de dados

O comando SQL necessário está em `astro-app/migrations/001_add_grupo.sql`:

```sql
ALTER TABLE "projeto-produtividade-topten".votos
ADD COLUMN IF NOT EXISTS grupo TEXT;
```
