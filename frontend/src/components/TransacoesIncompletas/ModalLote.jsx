import React from "react";

const ModalLote = ({ textoLote, setTextoLote, enviarLote }) => {
  return (
    <div
      className="modal fade"
      id="modalLote"
      tabIndex="-1"
      aria-labelledby="modalLoteLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header small">
            <h5 className="modal-title" id="modalLoteLabel">
              Adicionar Transações em Lote
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body small">
            <textarea
              className="form-control form-control-sm"
              rows="10"
              placeholder={
                'Cole aqui os dados no formato:\n' +
                'Data[TAB]Descrição[TAB]Valor\n' +
                'Exemplo:\n' +
                '20/03/2025\tConta de Luz\t150,75'
              }
              value={textoLote}
              onChange={(e) => setTextoLote(e.target.value)}
            ></textarea>
          </div>

          <div className="modal-footer small">
            <button
              className="btn btn-secondary btn-sm"
              data-bs-dismiss="modal"
              type="button"
            >
              Cancelar
            </button>
            <button
              className="btn btn-success btn-sm"
              onClick={enviarLote}
              type="button"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalLote;