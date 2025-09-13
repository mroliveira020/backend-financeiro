#!/bin/bash

echo "🚀 Iniciando o ambiente do Notion API..."

# Definir a pasta do projeto (altere conforme necessário)
PROJECT_DIR="$(pwd)"

echo "📂 Navegando para a pasta do projeto: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Verificar se o ambiente virtual já existe
if [ ! -d "venv" ]; then
    echo "⚙️ Criando ambiente virtual..."
    python3 -m venv venv
else
    echo "✅ Ambiente virtual já existe."
fi

# Ativar o ambiente virtual
echo "🔄 Ativando o ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt

# Iniciar a API
echo "🚀 Iniciando a API Flask..."
python3 app.py
