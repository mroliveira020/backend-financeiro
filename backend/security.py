from functools import wraps
from flask import request, jsonify
from config import READ_ONLY, EDITOR_TOKEN


def requires_editor_token(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if READ_ONLY:
            return jsonify({"error": "Somente leitura"}), 405
        token = request.headers.get("Authorization", "")
        if not token.startswith("Bearer "):
            return jsonify({"error": "Token ausente"}), 401
        provided = token.split(" ", 1)[1].strip()
        if not EDITOR_TOKEN or provided != EDITOR_TOKEN:
            return jsonify({"error": "Token inválido"}), 403
        return fn(*args, **kwargs)
    return wrapper

