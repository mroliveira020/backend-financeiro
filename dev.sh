#!/usr/bin/env bash
set -euo pipefail

# Dev helper: inicia backend Flask e frontend Vite.
# - Backend: usa backend/start.sh (gera venv, instala deps, sobe na :5000)
# - Frontend: instala deps se necessário e roda Vite no :5173 por padrão

# Resolve caminho real do script (funciona com symlink em /usr/local/bin)
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
while [ -L "$SCRIPT_PATH" ]; do
  LINK="$(readlink "$SCRIPT_PATH")"
  if [[ "$LINK" = /* ]]; then
    SCRIPT_PATH="$LINK"
  else
    SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
    SCRIPT_PATH="$SCRIPT_DIR/$LINK"
  fi
done
ROOT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
cd "$ROOT_DIR"

# Configurações (podem ser sobrescritas via env)
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
FRONTEND_HOST="${FRONTEND_HOST:-127.0.0.1}"

echo "==> Iniciando backend (Flask :5000)"
bash backend/start.sh

echo "==> Preparando frontend (Vite :${FRONTEND_PORT})"
pushd frontend > /dev/null

# Garante .env do frontend
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "--> Criando .env a partir de .env.example"
  cp .env.example .env
fi

# Instala dependências se necessário
if [ ! -d node_modules ]; then
  echo "--> Instalando dependências do frontend (npm install)"
  npm install
fi

# Libera porta desejada do Vite, se ocupada
EXISTING_VITE_PIDS=$(lsof -ti:"${FRONTEND_PORT}" || true)
if [ -n "${EXISTING_VITE_PIDS}" ]; then
  echo "--> Encerrando processos na porta ${FRONTEND_PORT} (${EXISTING_VITE_PIDS})"
  # shellcheck disable=SC2046
  kill -9 $(echo "${EXISTING_VITE_PIDS}") || true
fi

# Ao sair, tenta encerrar o backend também
trap 'echo "\n==> Encerrando serviços"; (lsof -ti:5000 | xargs -n 1 kill -9 2>/dev/null || true); (lsof -ti:"${FRONTEND_PORT}" | xargs -n 1 kill -9 2>/dev/null || true)' EXIT

echo "--> Iniciando Vite em ${FRONTEND_HOST}:${FRONTEND_PORT} (npm run dev)"
npm run dev -- --strictPort --host "${FRONTEND_HOST}" --port "${FRONTEND_PORT}"

popd > /dev/null
