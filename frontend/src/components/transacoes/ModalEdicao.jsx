import React from "react";

function ModalEdicao({
  idModal,
  formEdicao,
  setFormEdicao,
  salvarEdicao,
  categorias,
  imoveis
}) {
  if (!formEdicao) return null;

  return (
    <div
      className="modal fade"
      id={idModal}
      tabIndex="-1"
      aria-labelledby={`${idModal}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${idModal}Label`}>
              Editar Lançamento
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Fechar"
            ></button>
          </div>

          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label">Data</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={formEdicao.data}
                onChange={(e) =>
                  setFormEdicao({ ...formEdicao, data: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={formEdicao.descricao}
                onChange={(e) =>
                  setFormEdicao({ ...formEdicao, descricao: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Valor</label>
              <input
                type="text"
                className="form-control form-control-sm text-end"
                value={formEdicao.valor}
                onChange={(e) =>
                  setFormEdicao({ ...formEdicao, valor: e.target.value })
                }
                onBlur={(e) => {
                  const numero = parseFloat(
                    e.target.value.replace(/\./g, "").replace(",", ".")
                  );
                  const valorFormatado = isNaN(numero)
                    ? "0,00"
                    : numero.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                  setFormEdicao({ ...formEdicao, valor: valorFormatado });
                }}
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Categoria</label>
              <select
                className="form-select form-select-sm"
                value={formEdicao.id_categoria}
                onChange={(e) =>
                  setFormEdicao({
                    ...formEdicao,
                    id_categoria: e.target.value,
                  })
                }
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
                onChange={(e) =>
                  setFormEdicao({ ...formEdicao, id_imovel: e.target.value })
                }
              >
                {imoveis.map((imovel) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label">Situação</label>
              <select
                className="form-select form-select-sm"
                value={formEdicao.id_situacao}
                onChange={(e) =>
                  setFormEdicao({
                    ...formEdicao,
                    id_situacao: e.target.value,
                  })
                }
              >
                <option value={0}>Pendente</option>
                <option value={1}>Confirmado</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary btn-sm"
              data-bs-dismiss="modal"
            >
              Cancelar
            </button>
            <button className="btn btn-success btn-sm" onClick={salvarEdicao}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalEdicao;