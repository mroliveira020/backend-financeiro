#!/bin/bash

echo "🚀 Iniciando backend..."

cd "$(dirname "$0")" || exit 1

# Encerra processo na porta 5000 (se houver)
echo "🔍 Verificando processos na porta 5000..."
PIDS=$(lsof -ti:5000)
if [ -n "$PIDS" ]; then
  echo "⚠️ Encerrando processos na porta 5000 (PIDs: $PIDS)..."
  echo "$PIDS" | xargs kill -9
fi

# Cria ambiente virtual se não existir
if [ ! -d "venv" ]; then
  echo "📦 Criando ambiente virtual..."
  python3 -m venv venv || { echo "❌ Falha ao criar ambiente virtual."; exit 1; }
fi

# Ativa o ambiente virtual
source venv/bin/activate || { echo "❌ Erro ao ativar venv."; exit 1; }

# Instala dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt || { echo "❌ Falha ao instalar dependências."; exit 1; }

# Verifica se flask-cors está instalado e listado
if ! grep -q "flask-cors" requirements.txt; then
  echo "🧩 Adicionando flask-cors..."
  pip install flask-cors && echo "flask-cors" >> requirements.txt
fi

# Inicia o backend Flask
echo "🚀 Iniciando servidor Flask..."
python3 app.py & disown
echo "✅ Backend rodando em http://localhost:5000"