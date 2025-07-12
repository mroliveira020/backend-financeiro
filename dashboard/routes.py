from flask import request, jsonify
from flask_cors import cross_origin
from . import dashboard_bp
from models import (
    listar_lancamentos_incompletos_view,
    listar_lancamentos_completos_view,
    adicionar_lancamentos_em_lote
)

# ==========================================================
# 🔹 Lista de lançamentos incompletos para um imóvel
# ==========================================================
@dashboard_bp.route('/dashboard/lancamentos/incompletos/<int:id_imovel>', methods=['GET'])
@cross_origin(origins='http://localhost:5173')
def get_lancamentos_incompletos(id_imovel):
    try:
        resultados = listar_lancamentos_incompletos_view(id_imovel)
        return jsonify(resultados), 200
    except Exception as e:
        print(f"Erro ao listar incompletos: {e}")
        return jsonify({"error": "Erro ao buscar lançamentos incompletos"}), 500

# ==========================================================
# 🔹 Lista de lançamentos completos para um imóvel
# ==========================================================
@dashboard_bp.route('/dashboard/lancamentos/completos/<int:id_imovel>', methods=['GET'])
@cross_origin(origins='http://localhost:5173')
def get_lancamentos_completos(id_imovel):
    try:
        resultados = listar_lancamentos_completos_view(id_imovel)
        return jsonify(resultados), 200
    except Exception as e:
        print(f"Erro ao listar completos: {e}")
        return jsonify({"error": "Erro ao buscar lançamentos completos"}), 500

# ==========================================================
# 🔹 Adicionar lançamentos em lote
# ==========================================================
@dashboard_bp.route('/dashboard/lancamentos/lote', methods=['POST'])
@cross_origin(origins='http://localhost:5173')
def adicionar_lote_lancamentos():
    novos = request.get_json()

    if not novos or not isinstance(novos, list):
        return jsonify({"error": "Nenhum lançamento recebido ou formato incorreto!"}), 400

    try:
        resultado = adicionar_lancamentos_em_lote(novos)
        return jsonify({
            "message": "Lançamentos adicionados com sucesso!",
            "total": resultado
        }), 201
    except Exception as e:
        print(f"Erro ao adicionar lançamentos em lote: {e}")
        return jsonify({"error": "Erro ao adicionar lançamentos"}), 500

# ==========================================================
# 🔹 Excluir lançamento (completo ou incompleto)
# ==========================================================
@dashboard_bp.route('/dashboard/lancamentos/<int:id_lancamento>', methods=['DELETE', 'OPTIONS'])
@cross_origin(origins='http://localhost:5173')
def excluir_lancamento_incompleto(id_lancamento):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        # Importação aqui para evitar conflito circular
        from models import excluir_lancamento

        excluir_lancamento(id_lancamento)
        return jsonify({
            "message": f"Lançamento {id_lancamento} excluído com sucesso!"
        }), 200
    except Exception as e:
        print(f"Erro ao excluir lançamento: {e}")
        return jsonify({"error": "Erro ao excluir lançamento"}), 500

# ==========================================================
# 🔹 Alterar lançamento (completo ou incompleto)
# ==========================================================
@dashboard_bp.route('/dashboard/lancamentos/<int:id_lancamento>', methods=['PATCH', 'OPTIONS'])
@cross_origin(origins='http://localhost:5173')
def alterar_lancamento_incompleto(id_lancamento):
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.get_json()

    if not data:
        return jsonify({"error": "Dados não recebidos para atualização"}), 400

    try:
        # Importação aqui para evitar conflito circular
        from models import alterar_lancamento

        alterar_lancamento(id_lancamento, data)
        return jsonify({"message": "Lançamento atualizado com sucesso!"}), 200
    except Exception as e:
        print(f"Erro ao alterar lançamento: {e}")
        return jsonify({"error": "Erro ao atualizar lançamento"}), 500