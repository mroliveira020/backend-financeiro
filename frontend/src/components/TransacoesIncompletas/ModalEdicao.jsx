import React from "react";

const ModalEdicao = ({ formEdicao, setFormEdicao, salvarEdicao, categorias, imoveis }) => {
  return (
    <div className="modal fade" id="modalEdicao" tabIndex="-1" aria-labelledby="modalEdicaoLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content small"> {/* Aqui foi colocado o 'small' */}
          <div className="modal-header">
            <h5 className="modal-title" id="modalEdicaoLabel">Editar Lançamento</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Data</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="DD/MM/AAAA"
                value={formEdicao.data}
                onChange={(e) => setFormEdicao({ ...formEdicao, data: e.target.value })}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={formEdicao.descricao}
                onChange={(e) => setFormEdicao({ ...formEdicao, descricao: e.target.value })}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Valor</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={formEdicao.valor}
                onChange={(e) => setFormEdicao({ ...formEdicao, valor: e.target.value })}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Categoria</label>
              <select
                className="form-select form-select-sm"
                value={formEdicao.id_categoria}
                onChange={(e) => setFormEdicao({ ...formEdicao, id_categoria: e.target.value })}
              >
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.categoria}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Imóvel</label>
              <select
                className="form-select form-select-sm"
                value={formEdicao.id_imovel}
                onChange={(e) => setFormEdicao({ ...formEdicao, id_imovel: e.target.value })}
              >
                {imoveis.map((imovel) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Situação</label>
              <select
                className="form-select form-select-sm"
                value={formEdicao.id_situacao}
                onChange={(e) => setFormEdicao({ ...formEdicao, id_situacao: e.target.value })}
              >
                <option value="0">Pendente</option>
                <option value="1">Confirmado</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary btn-sm"
              data-bs-dismiss="modal"
              type="button"
            >
              Cancelar
            </button>

            <button
              className="btn btn-success btn-sm"
              onClick={() => {
                console.log("🔧 Salvando lançamento...", formEdicao);
                salvarEdicao();
              }}
              type="button"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalEdicao;