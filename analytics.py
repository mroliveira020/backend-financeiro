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
            s.nome AS situacao
        FROM lancamentos l
        JOIN imoveis im ON l.id_imovel = im.id
        JOIN categorias c ON l.id_categoria = c.id
        JOIN situacoes s ON l.id_situacao = s.id
        WHERE l.ativo = 1
        ORDER BY l.data DESC
    """)
    rows = cur.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])