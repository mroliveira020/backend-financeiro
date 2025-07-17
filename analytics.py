from flask import Blueprint, request, jsonify
from db_connection import conectar
import psycopg2

analytics_bp = Blueprint("analytics", __name__)

# 🔹 Rota de lançamentos para análise
@analytics_bp.route("/analise/lancamentos", methods=["GET"])
def get_lancamentos_completos_unificados():
    conn, cur = conectar()
    cur.execute("""
        SELECT 
            l.id_imovel,
            im.nome AS nome_imovel,
            c.categoria,
            c.dc,
            l.valor,
            l.data,
            l.id_situacao,
            l.descricao,
            l.ativo
        FROM lancamentos l
        JOIN imoveis im ON l.id_imovel = im.id
        JOIN categorias c ON l.id_categoria = c.id
        ORDER BY l.data
    """)
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])


# 🔹 Rota de execução SQL segura
@analytics_bp.route("/sql", methods=["POST"])
def executar_sql_seguro():
    data = request.get_json()
    query = data.get("query", "").strip()

    if not query.lower().startswith("select"):
        return jsonify({"error": "Apenas SELECT é permitido"}), 403

    conn, cur = conectar()
    try:
        cur.execute(query)
        rows = cur.fetchall()
        return jsonify([dict(row) for row in rows])
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()