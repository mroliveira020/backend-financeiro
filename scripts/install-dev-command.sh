#!/usr/bin/env bash
set -euo pipefail

# Instala um comando global (symlink) para rodar o dev de qualquer diretório.
# Uso:
#   bash scripts/install-dev-command.sh                    # cria binário em diretório padrão
#   bash scripts/install-dev-command.sh --name meu-dev     # muda o nome
#   bash scripts/install-dev-command.sh --dir /custom/bin  # muda o diretório de destino

NAME="financeiro-dev"
TARGET_DIR=""
while [[ ${1:-} ]]; do
  case "$1" in
    --name)
      shift
      NAME="${1:-$NAME}"
      ;;
    --dir)
      shift
      TARGET_DIR="${1:-}"
      ;;
    *)
      echo "Argumento desconhecido: $1" >&2
      exit 2
      ;;
  esac
  shift || true
done

# Descobre diretório padrão
if [ -z "$TARGET_DIR" ]; then
  if [ -d "/usr/local/bin" ]; then
    TARGET_DIR="/usr/local/bin"
  elif [ -d "/opt/homebrew/bin" ]; then
    TARGET_DIR="/opt/homebrew/bin"
  else
    TARGET_DIR="$HOME/.local/bin"
    mkdir -p "$TARGET_DIR"
  fi
fi

ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
SRC="$ROOT_DIR/dev.sh"
TARGET="$TARGET_DIR/$NAME"

if [ ! -f "$SRC" ]; then
  echo "Arquivo não encontrado: $SRC" >&2
  exit 1
fi

chmod +x "$SRC" || true

echo "Criando symlink: $TARGET -> $SRC"
if ln -sf "$SRC" "$TARGET" 2>/dev/null; then
  echo "OK. Agora você pode rodar: $NAME"
  case ":${PATH}:" in
    *:"${TARGET_DIR}":*) ;;
    *)
      echo "Aviso: ${TARGET_DIR} não está no PATH." >&2
      echo "Adicione ao seu ~/.zshrc: export PATH=\"${TARGET_DIR}:\$PATH\"" >&2
      ;;
  esac
else
  echo "Não foi possível criar $TARGET (verifique permissões)." >&2
  echo "Crie manualmente (pode exigir sudo):" >&2
  echo "  sudo mkdir -p '${TARGET_DIR}'" >&2
  echo "  sudo ln -sf '${SRC}' '${TARGET}'" >&2
  echo "Se preferir, sem sudo: rode com --dir \"$HOME/.local/bin\" e inclua no PATH." >&2
  exit 1
fi
