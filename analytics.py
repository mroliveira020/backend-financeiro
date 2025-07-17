from flask import Blueprint, jsonify
from db_connection import conectar

analytics_bp = Blueprint("analytics", __name__)

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