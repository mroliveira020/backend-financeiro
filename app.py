from flask import Flask, request, jsonify
from flask_cors import CORS
from dashboard import dashboard_bp
from models import (
    listar_imoveis,
    adicionar_imovel,
    atualizar_imovel,
    deletar_imovel,
    buscar_imovel_por_id,
    listar_categorias,
    adicionar_categoria,
    deletar_categoria,
    listar_lancamentos,
    #adicionar_lancamento,
    adicionar_lancamentos_em_lote,
    listar_resumo_financeiro,
    listar_orcamentos_por_imovel,
    atualizar_inserir_orcamentos
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# =====================================================
# 🔹 ROTAS IMÓVEIS
# =====================================================

@app.route("/imoveis", methods=["GET"])
def get_imoveis():
    return jsonify(listar_imoveis())

@app.route("/imoveis", methods=["POST"])
def add_imovel():
    data = request.json
    return jsonify(adicionar_imovel(data["nome"], data["vendido"]))

@app.route("/imoveis/<int:imovel_id>", methods=["GET"])
def get_imovel_by_id(imovel_id):
    imovel = buscar_imovel_por_id(imovel_id)
    if not imovel:
        return jsonify({"error": "Imóvel não encontrado"}), 404
    return jsonify(imovel)

@app.route("/imoveis/<int:imovel_id>", methods=["PATCH"])
def update_imovel(imovel_id):
    data = request.json
    imovel = buscar_imovel_por_id(imovel_id)
    if not imovel:
        return jsonify({"error": "Imóvel não encontrado"}), 404

    nome = data.get("nome", imovel["nome"])
    vendido = data.get("vendido", imovel["vendido"])
    endereco = data.get("endereco", imovel["endereco"])
    nome_ocupante = data.get("nome_ocupante", imovel["nome_ocupante"])
    cpf_ocupante = data.get("cpf_ocupante", imovel["cpf_ocupante"])
    latitude = data.get("latitude", imovel["latitude"])
    longitude = data.get("longitude", imovel["longitude"])
    corretagem = data.get("corretagem", imovel.get("corretagem", 0))
    ganho_capital = data.get("ganho_capital", imovel.get("ganho_capital", 0))
    valor_venda = data.get("valor_venda", imovel.get("valor_venda", 0))

    imovel_atualizado = atualizar_imovel(
        imovel_id,
        nome,
        vendido,
        endereco,
        nome_ocupante,
        cpf_ocupante,
        latitude,
        longitude,
        corretagem,
        ganho_capital,
        valor_venda
    )

    return jsonify(imovel_atualizado)

@app.route("/imoveis/<int:imovel_id>", methods=["DELETE"])
def delete_imovel(imovel_id):
    return jsonify(deletar_imovel(imovel_id))

# =====================================================
# 🔹 ROTAS CATEGORIAS
# =====================================================

@app.route("/categorias", methods=["GET"])
def get_categorias():
    return jsonify(listar_categorias())

@app.route("/categorias", methods=["POST"])
def add_categoria():
    data = request.json
    return jsonify(adicionar_categoria(data["categoria"], data["dc"]))

@app.route("/categorias/<int:categoria_id>", methods=["DELETE"])
def delete_categoria(categoria_id):
    return jsonify(deletar_categoria(categoria_id))

# =====================================================
# 🔹 ROTAS LANÇAMENTOS
# =====================================================

@app.route("/lancamentos", methods=["GET"])
def get_lancamentos():
    return jsonify(listar_lancamentos())

@app.route("/lancamentos", methods=["POST"])
def add_lancamento():
    data = request.json
    return jsonify(adicionar_lancamentos_em_lote(
        data["data"],
        data["id_imovel"],
        data["id_categoria"],
        data["id_situacao"],
        data["descricao"],
        data["valor"],
        data["ativo"]
    ))

# =====================================================
# 🔹 ROTAS RESUMO FINANCEIRO
# =====================================================

@app.route("/dashboard/resumo-financeiro/<int:id_imovel>", methods=["GET"])
def get_resumo_financeiro(id_imovel):
    try:
        dados = listar_resumo_financeiro(id_imovel)
        return jsonify(dados)
    except Exception as e:
        print(f"Erro ao buscar resumo financeiro: {e}")
        return jsonify({"error": "Erro ao buscar resumo financeiro"}), 500

# 🔹 ROTA ALTERNATIVA (opcional)
@app.route("/dashboard/orcamento_execucao/<int:id_imovel>", methods=["GET"])
def get_orcamento_execucao(id_imovel):
    try:
        dados = listar_resumo_financeiro(id_imovel)
        return jsonify(dados)
    except Exception as e:
        print(f"Erro ao buscar orçamento execução: {e}")
        return jsonify({"error": "Erro ao buscar orçamento execução"}), 500

# =====================================================
# 🔹 ROTAS ORÇAMENTOS
# =====================================================

@app.route("/orcamentos/<int:id_imovel>", methods=["GET"])
def get_orcamentos_por_imovel(id_imovel):
    orcamentos = listar_orcamentos_por_imovel(id_imovel)
    return jsonify(orcamentos), 200

@app.route("/orcamentos/<int:id_imovel>", methods=["POST"])
def post_orcamentos_por_imovel(id_imovel):
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({"error": "Formato inválido! Esperado uma lista de orçamentos."}), 400

    resultado = atualizar_inserir_orcamentos(id_imovel, data)
    return jsonify(resultado), 200

# =====================================================
# 🔹 BLUEPRINT DASHBOARD
# =====================================================

app.register_blueprint(dashboard_bp)

print(app.url_map)

# =====================================================
# 🔹 INICIAR A API
# =====================================================

if __name__ == "__main__":
    app.run(debug=True)