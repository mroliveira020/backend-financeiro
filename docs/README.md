# Financeiro — Documentação do Projeto

## Visão Geral

- Propósito: gestão financeira de imóveis com consolidação de orçamento vs. execução, cadastro de imóveis/categorias, lançamentos, edição e importação em lote.
- Stack: Backend Flask + PostgreSQL; Frontend React (Vite) + Bootstrap.
- Telas: Home (lista de imóveis) e Dashboard por imóvel (dados cadastrais, resumo financeiro, transações completas e incompletas).

## Arquitetura

- Backend
  - App Flask em `backend/app.py`: define rotas de imóveis, categorias, lançamentos, resumo financeiro e orçamentos; registra `dashboard_bp` e `analytics_bp`.
  - Blueprint Dashboard: `backend/dashboard/__init__.py` e `backend/dashboard/routes.py` — lista completos/incompletos, PATCH/DELETE, POST em lote.
  - Camada de dados: `backend/models.py` — CRUD, consultas às views e upsert de orçamentos.
  - Conexão DB: `backend/db_connection.py` — usa variáveis de ambiente do `.env` (PostgreSQL).
  - Analytics (admin): `backend/analytics.py` — rota de SELECT seguro e endpoint de lançamentos consolidados.
  - Notion helper: `backend/notion_service.py` — cliente utilitário não exposto em rotas públicas.
- Frontend
  - Rotas: `frontend/src/App.jsx` com `/` (Home) e `/dashboard/:id`.
  - Home: `frontend/src/pages/Home.jsx` — lista/adiciona imóveis; usa `frontend/src/services/api.js`.
  - Dashboard: `frontend/src/pages/Dashboard.jsx` — compõe Dados Cadastrais, Resumo Financeiro, Transações Incompletas e Completas.
  - Dados cadastrais: `frontend/src/components/dadosCadastrais/DadosCadastrais.jsx` — GET `/imoveis/:id`, exibe mapa, edição via modal.
  - Resumo financeiro: `frontend/src/components/ResumoFinanceiro.jsx` — GET `/dashboard/resumo-financeiro/:id`, calcula totais e ROI; edição de orçamentos via `ModalEditarOrcamento`.
  - Transações Incompletas: `frontend/src/components/TransacoesIncompletas/TransacoesIncompletas.jsx` — GET incompletos, PATCH/DELETE, POST lote; tabela e modais (edição e lote).
  - Transações Completas: `frontend/src/components/transacoes/TransacoesCompletas.jsx` — GET completos, PATCH/DELETE; tabela e modal.
  - Tabelas: completas em `frontend/src/components/transacoes/LancamentosTable.jsx` (ordenação/paginação); incompletas em `frontend/src/components/TransacoesIncompletas/LancamentosTable.jsx` (ordenação).
  - Cliente HTTP: centralizado em `frontend/src/services/http.js` (Axios) usando `VITE_API_URL`.

## Desenvolvimento (Quickstart)

- Requisitos: Python 3.9+, Node.js 18+, PostgreSQL acessível.
- Rodar dev (backend + frontend):
  - `bash dev.sh`
  - Opcional: `bash scripts/install-dev-command.sh` e depois `financeiro-dev`
- Variáveis:
  - Backend (`backend/.env`): `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` (padrão 5432)
    - Flags: `APP_ENV` (development|production), `READ_ONLY` (true|false), `ENABLE_SQL_ENDPOINT` (true|false), `ALLOWED_ORIGINS` (origens separadas por vírgula), `EDITOR_TOKEN` (opcional), `ADMIN_TOKEN` (opcional para `/sql`).
    - Rate limiting: `RATE_LIMIT_STORAGE_URI` (ex.: `memory://` ou `redis://...`), `RATE_LIMIT_EDIT` (ex.: `30/minute`), `RATE_LIMIT_ADMIN` (ex.: `10/minute`), `RATE_LIMIT_GLOBAL` (opcional, ex.: `300/minute`), `TRUST_PROXY` (true em produção no Render).
    - GPT Write: `ENABLE_GPT_WRITE` (true|false), `GPT_TOKEN` (token do agente), `RATE_LIMIT_GPT_WRITE` (ex.: `20/minute`).
  - Frontend: `frontend/.env` (de `.env.example`) com `VITE_API_URL` (ex.: `http://127.0.0.1:5000`)
- Portas: API `http://127.0.0.1:5000`, Vite `http://127.0.0.1:5173`

## Ambientes e Serviços

- GPT Backend (existente): API dedicada ao agente GPT — pode manter `/sql` ativo; recomenda-se DB usuário read-only.
- Site Backend: API para o site público — deve restringir CORS, desativar `/sql` e aplicar política de edição.
- Frontend: site estático (Vite) consumindo o Site Backend.

### Integração GPT — Inclusão de Transações (Pagamentos)

- Objetivo: permitir que o agente GPT insira pagamentos como lançamentos na API, com segurança e validação.
- Proposta de endpoint (a ser implementado): `POST /gpt/lancamentos`
  - Auth: header `X-GPT-TOKEN: <token>` (variável `GPT_TOKEN` no backend) e rate limit dedicado.
  - Idempotência: header `Idempotency-Key: <uuid>` para evitar duplicatas.
  - Body JSON:
    - `data` ("DD/MM/AAAA" ou "YYYY-MM-DD"), `descricao` (string), `valor` (number),
    - `id_imovel` (int), `id_categoria` (int), `id_situacao` (int, ex.: 1=efetivado).
  - Respostas:
    - 201 `{ id, ... }` ao criar; 400 validação; 401/403 auth; 409 idempotência; 429 limite.
- Confirmações pelo agente (recomendado):
  - Antes de enviar, o agente deve confirmar imóvel, categoria, data, valor e descrição.
  - Para descobrir IDs, usar `GET /imoveis` e `GET /categorias` (ou endpoints de busca futuros).
- Exemplo cURL (conceitual):
  - `curl -X POST "$API/gpt/lancamentos" -H "Content-Type: application/json" -H "X-GPT-TOKEN: $GPT_TOKEN" -H "Idempotency-Key: $UUID" -d '{"data":"2025-03-01","descricao":"Pagamento luz","valor":123.45,"id_imovel":5,"id_categoria":12,"id_situacao":1}'`

## Deploy (Render)

- Backend (Flask):
  - Serviço Web Python com root `backend`, `pip install -r requirements.txt` e `gunicorn app:app`.
  - Variáveis: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `FLASK_ENV=production`.
  - Recomendações: restringir CORS por domínio, desabilitar `/sql` em produção ou exigir token.
- Frontend (Static Site):
  - Root `frontend`, build `npm ci && npm run build`, publish `dist`.
  - `VITE_API_URL` deve apontar para a URL pública do backend.
- Blueprint opcional: `render.yaml` na raiz com os 2 serviços.

### Perfis de Deploy

- GPT Backend
  - `ENABLE_SQL_ENDPOINT=true`, `READ_ONLY=true`, `ALLOWED_ORIGINS=*`
  - Usuário de banco somente leitura
- Site Backend
  - `ENABLE_SQL_ENDPOINT=false`, `READ_ONLY=true` (1ª versão), `ALLOWED_ORIGINS=https://seu-dominio`
  - `EDITOR_TOKEN` se optar por Fase 1 (token de editor)

### Considerações de Segurança

- Produção deve rodar em modo leitura se o site for público (sem login). Use uma flag de ambiente e oculte botões de edição no front.
- Desative `/sql` e `/analise/*` em produção; se precisar, proteja com token de serviço e CORS separado.
- Restringir CORS ao domínio do frontend; remova `*`.
- Não commitar `.env`; configure variáveis no painel do Render.
- Remova `debug` e prints ruidosos; trate erros sem expor stack traces.

### Notas de Teste (Rate Limit)

- Em alguns ambientes de desenvolvimento automatizados, não foi possível validar 429 programaticamente devido a limitações de dependências. Em uso local (VS Code/dev.sh) o limiter foi configurado e funciona.
- Para testar manualmente 429 no seu ambiente:
  - Defina em `backend/.env`: `RATE_LIMIT_ADMIN=1/minute` e `RATE_LIMIT_STORAGE_URI=memory://`
  - Reinicie: `bash dev.sh`
  - Rode duas vezes: `curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:5000/sql -H "Content-Type: application/json" -d '{"query":"select 1"}'`
  - Esperado: primeira chamada 200 (ou 400 dependendo do DB), segunda 429 (Too Many Requests).

### Editor Token (Fase 1)

- Geração: crie um token forte (32+ chars) e defina `EDITOR_TOKEN` no backend.
- Uso: o front oferece um campo “Entrar como Editor”. Ao informar o token, ações de escrita habilitam `Authorization: Bearer <token>`.
- Distribuição: pode ser enviado por e‑mail a editores autorizados. Boas práticas:
  - Enviar individualmente, com orientação de sigilo; evitar encaminhamentos.
  - Rotacionar periodicamente (ex.: mensal) ou ao suspeitar vazamento.
  - Tokens por ambiente (dev/staging/prod) e revogação trocando a env var.
  - Evitar logs com o token e nunca commitar em Git.

## Endpoints Principais (UI)

- Imóveis
  - GET `/imoveis` — lista (com total de lançamentos por imóvel) — `backend/app.py:33`.
  - POST `/imoveis` — cria — `backend/app.py:37`.
  - GET `/imoveis/:id` — detalha — `backend/app.py:42`.
  - PATCH `/imoveis/:id` — atualiza campos diversos — `backend/app.py:49`.
  - DELETE `/imoveis/:id` — remove — `backend/app.py:83`.
- Categorias
  - GET/POST/DELETE `/categorias` — `backend/app.py:91`, `backend/app.py:95`, `backend/app.py:100`.
- Lançamentos (Dashboard)
  - GET `/dashboard/lancamentos/completos/:id_imovel` — `backend/dashboard/routes.py:26`.
  - GET `/dashboard/lancamentos/incompletos/:id_imovel` — `backend/dashboard/routes.py:13`.
  - PATCH `/dashboard/lancamentos/:id_lancamento` — `backend/dashboard/routes.py:81`.
  - DELETE `/dashboard/lancamentos/:id_lancamento` — `backend/dashboard/routes.py:60`.
  - POST `/dashboard/lancamentos/lote` — insere lista — `backend/dashboard/routes.py:39`.
- Resumo e Orçamentos
  - GET `/dashboard/resumo-financeiro/:id_imovel` — `backend/app.py:129`.
  - GET/POST `/orcamentos/:id_imovel` — `backend/app.py:152`, `backend/app.py:157`.
- Analytics (auxiliar)
  - POST `/sql` — SELECT-only — `backend/analytics.py`.

## Banco de Dados (inferido)

- Tabelas principais: `imoveis`, `categorias`, `lancamentos`, `grupos`, `orcamentos`.
- Views necessárias:
  - `vw_lancamentos_completos(id_imovel, id_lancamento, data, descricao, valor, id_categoria, nome_categoria, id_situacao, nome_situacao, ...)`.
  - `vw_lancamentos_incompletos(id_imovel, id_lancamento, data, descricao, valor, id_categoria, id_situacao, ...)`.
  - `vw_orcamento_execucao(id_imovel, id_grupo, grupo, valor_efetivado, valor_em_contratacao, valor_total, orcamento)`.

## Decisões e Comportamentos

- Datas: Frontend exibe/edita em `DD/MM/AAAA`; backend converte para ISO `AAAA-MM-DD` com `converter_data()` e, no lote, faz split manual.
- Formatação de valores: UI exibe BRL; ao salvar, converte string `1.234,56` para float com `.` decimal.
- CORS: globalmente aberto no app; no blueprint do dashboard, restrito a `http://localhost:5173`.
- Home ajusta alias Postgres minúsculo para `totalLancamentos` na UI.

## Observações / Problemas Identificados

- POST `/lancamentos` inconsistente: `backend/app.py:112` chama `adicionar_lancamentos_em_lote(...)` passando campos avulsos; a função espera lista de objetos. Corrigir para inserção única ou remover se não for usada.
- Incompletos sem filtro (por design): a listagem de “incompletos” é global para permitir categorização de lançamentos de vários imóveis até zerar a fila. O path contém `:id_imovel`, mas o parâmetro não é aplicado como filtro na consulta atual (`backend/models.py:248`). Documentado e aceito no fluxo atual; opcionalmente, adicionar filtro via query param em futura evolução.
- Datas em lote: padronização para ISO feita via `converter_data()` em `backend/models.py`.
- CORS divergente: blueprint aceita `http://localhost:5173`, mas o frontend pode rodar em `http://127.0.0.1:5173`; hoje encobre devido ao CORS global `*`, mas em produção precisa alinhar origem.
- URLs base no frontend: centralizadas em `VITE_API_URL` via cliente Axios.
- Log ruidoso: `print(app.url_map)` em `backend/app.py:187`; condicionar ao modo debug.
- Endpoint `/analytics/sql`: mesmo com filtro de SELECT, expõe consulta arbitrária; restringir/retirar em produção.
- Use `dev.sh` na raiz para subir backend e frontend em dev; o script garante `.env` do front e instala dependências quando necessário.

## Rotas Em Uso (UI atual)

Com base nas páginas Home e Dashboard, as rotas efetivamente utilizadas pelo frontend são:

- Imóveis: `GET /imoveis`, `GET /imoveis/:id`, `POST /imoveis`, `PATCH /imoveis/:id`, `DELETE /imoveis/:id`.
- Categorias: `GET /categorias` (para popular selects).
- Dashboard/Lançamentos: `GET /dashboard/lancamentos/incompletos/:id_imovel`, `GET /dashboard/lancamentos/completos/:id_imovel`, `PATCH /dashboard/lancamentos/:id_lancamento`, `DELETE /dashboard/lancamentos/:id_lancamento`, `POST /dashboard/lancamentos/lote`.
- Resumo/Orçamentos: `GET /dashboard/resumo-financeiro/:id_imovel`, `GET /orcamentos/:id_imovel`, `POST /orcamentos/:id_imovel`.

## Rotas Não Utilizadas pela UI (atual)

- `GET /lancamentos` e `POST /lancamentos` (endpoints genéricos; a UI usa as rotas do blueprint do dashboard).
- `POST /categorias` e `DELETE /categorias` (não há telas de gestão de categorias na UI atual).
- `GET /dashboard/orcamento_execucao/:id_imovel` (alias alternativo do resumo não referenciado no front).
- `GET /openapi.json` (útil para documentação, não consumido pela UI).

Sugestão: manter, documentar como “suporte/administrativo” ou desabilitar em produção se não forem necessários. A rota `POST /lancamentos` está inconsistente com a função de lote e merece correção ou remoção.

## Endpoints para ChatGPT (sem frontend)

Existem rotas pensadas para consumo programático (ex.: integrações e consultas ad‑hoc), sem página de frontend associada:

- `GET /analise/lancamentos` — retorna lançamentos com joins (para análises).
- `POST /sql` — executor de SELECT “seguro”.

Como funciona a “orfanização”: são endpoints expostos pela API que não possuem rotas React correspondentes. Eles podem ser usados por automações (ChatGPT, scripts, notebooks). O risco é ficarem com o mesmo CORS/permissão das rotas da UI e escaparem de políticas de segurança.

Melhorias propostas para esses endpoints:

- Restringir a disponibilidade por ambiente: habilitar apenas em dev/staging via `FLASK_ENV`/flag.
- Autenticação: exigir token de serviço (header) ou IP allowlist. Evitar exposição pública.
- `/sql`: além de permitir apenas SELECT, validar palavras‑chave, bloquear `;`, `--`, funções perigosas, e limitar linhas/tempo. Em produção, preferir desativar.
- CORS dedicado: origem restrita e distinta da UI para consumo por ferramentas específicas.
- Observabilidade: log estruturado e auditoria de queries executadas (com truncamento de payload).

## Plano de Ação

O plano priorizado está em `docs/PLANO_DE_ACAO.md`.

## Referências de Código (linhas relevantes)

- `backend/app.py:112`
- `backend/models.py:248`
- `backend/models.py:186`
- `backend/dashboard/__init__.py:6`
- `backend/app.py:187`
- `frontend/src/components/transacoes/TransacoesCompletas.jsx:22`
- `frontend/src/components/TransacoesIncompletas/TransacoesIncompletas.jsx:25`

## Notas de Implementação

- As views do banco são parte central da lógica agregada (resumo e listas); certifique-se de tê-las criadas no banco usado pelo `.env`.
- O front mistura `localhost` e `127.0.0.1`; alinhar a origem do navegador com a configuração de CORS para evitar problemas quando CORS global for restringido.
- A inserção em lote assume datas no formato `DD/MM/AAAA`; se o Excel eventualmente exportar ISO (`YYYY-MM-DD`), detecte e trate para não reverter erroneamente.
