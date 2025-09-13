#!/bin/bash

echo "🚀 Iniciando Frontend React com Vite..."

cd "$(dirname "$0")" || exit 1

# Força reinstalação se parâmetro --force for usado
if [ "$1" == "--force" ]; then
  echo "🧹 Limpando instalações anteriores..."
  rm -rf node_modules dist .vite package-lock.json
fi

# Verifica se o node está instalado
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não está instalado. Instale o Node.js para continuar."
  exit 1
fi

# Instala dependências se necessário
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install || { echo "❌ Erro ao instalar pacotes com npm."; exit 1; }
else
  echo "✅ Dependências já instaladas (pulando npm install)."
fi

# Libera possíveis portas travadas (5173–5180)
echo "🔍 Verificando processos nas portas 5173–5180..."
for port in $(seq 5173 5180); do
  PIDS=$(lsof -ti:$port)
  if [ -n "$PIDS" ]; then
    echo "⚠️ Encerrando processo na porta $port (PIDs: $PIDS)..."
    echo "$PIDS" | xargs kill -9
  fi
done

# Inicia o Vite
echo "🚀 Iniciando servidor Vite..."
npm run dev