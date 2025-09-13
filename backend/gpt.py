from flask import Blueprint, request, jsonify
from ratelimit import limiter
from config import ENABLE_GPT_WRITE, GPT_TOKEN, RATE_LIMIT_GPT_WRITE
from models import adicionar_lancamento, converter_data, buscar_imovel_por_id
from db_connection import conectar
import time

gpt_bp = Blueprint("gpt", __name__)

_idem_store = {}
_IDEM_TTL_SEC = 60 * 60  # 1h
_IDEM_MAX = 5000


def _cleanup_idem_store():
    # Limpeza simples para evitar crescimento indefinido
    now = time.time()
    if len(_idem_store) > _IDEM_MAX:
        # Remove itens antigos
        keys = list(_idem_store.keys())
        for k in keys[: len(keys) // 2]:
            _idem_store.pop(k, None)
    # TTL prune
    for k, ts in list(_idem_store.items()):
        if now - ts > _IDEM_TTL_SEC:
            _idem_store.pop(k, None)


def _require_gpt_auth():
    if not ENABLE_GPT_WRITE:
        return (jsonify({"error": "Endpoint GPT desabilitado"}), 404)
    token = request.headers.get("X-GPT-TOKEN", "")
    if not GPT_TOKEN or token != GPT_TOKEN:
        return (jsonify({"error": "Token GPT inválido"}), 403)
    return None


def _exists_categoria(cat_id: int) -> bool:
    conn, cur = conectar()
    try:
        cur.execute("SELECT 1 FROM categorias WHERE id = %s", (cat_id,))
        return cur.fetchone() is not None
    finally:
        conn.close()


def _exists_situacao(sit_id: int) -> bool:
    conn, cur = conectar()
    try:
        cur.execute("SELECT 1 FROM situacao_lancamento WHERE id = %s", (sit_id,))
        return cur.fetchone() is not None
    finally:
        conn.close()


@gpt_bp.route("/gpt/lancamentos", methods=["POST"])
@limiter.limit(RATE_LIMIT_GPT_WRITE)
def gpt_criar_lancamento():
    # Auth
    auth_err = _require_gpt_auth()
    if auth_err:
        return auth_err

    # Idempotency
    idem_key = request.headers.get("Idempotency-Key", "").strip()
    if not idem_key:
        return jsonify({"error": "Idempotency-Key obrigatório"}), 400
    _cleanup_idem_store()
    if idem_key in _idem_store:
        return jsonify({"error": "Requisição duplicada"}), 409

    data = request.get_json(silent=True) or {}

    # Validações básicas
    required = ["data", "descricao", "valor", "id_imovel", "id_categoria", "id_situacao"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Campos ausentes: {', '.join(missing)}"}), 400

    try:
        data_fmt = converter_data(str(data.get("data", "")))
    except Exception:
        return jsonify({"error": "Data inválida"}), 400

    try:
        valor = float(data.get("valor"))
    except Exception:
        return jsonify({"error": "Valor inválido"}), 400

    try:
        id_imovel = int(data.get("id_imovel"))
        id_categoria = int(data.get("id_categoria"))
        id_situacao = int(data.get("id_situacao"))
    except Exception:
        return jsonify({"error": "IDs devem ser inteiros"}), 400

    # Verifica existência de chaves
    if not buscar_imovel_por_id(id_imovel):
        return jsonify({"error": "Imóvel inexistente"}), 400
    if not _exists_categoria(id_categoria):
        return jsonify({"error": "Categoria inexistente"}), 400
    if not _exists_situacao(id_situacao):
        return jsonify({"error": "Situação inexistente"}), 400

    descricao = str(data.get("descricao", "")).strip()
    if not descricao:
        return jsonify({"error": "Descrição obrigatória"}), 400

    try:
        novo = adicionar_lancamento(
            data_fmt,
            id_imovel,
            id_categoria,
            id_situacao,
            descricao,
            valor,
            True,
        )
    except Exception as e:
        return jsonify({"error": f"Falha ao inserir: {e}"}), 500

    # Marca idempotency como usada
    _idem_store[idem_key] = time.time()

    return jsonify(novo), 201

