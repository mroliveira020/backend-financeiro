import React, { useState } from "react";

function LancamentosTable({ lancamentos, onEdit, onDelete, tipo = "completo" }) {
  const [sortConfig, setSortConfig] = useState({ key: "data", direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const getSituacaoIcone = (id_situacao) => {
    return id_situacao === 1 ? "✅" : "🕒";
  };

  const formatarDescricao = (descricao) => {
    return descricao.length > 10 ? descricao.slice(0, 10) + "..." : descricao;
  };

  const getSortableValue = (item, key) => {
    if (key === "data") {
      const [dia, mes, ano] = item.data.split("/");
      return new Date(`${ano}-${mes}-${dia}`);
    }
    if (key === "valor") {
      return parseFloat(item.valor) || 0;
    }
    return item[key]?.toString().toLowerCase();
  };

  const sortedLancamentos = [...lancamentos].sort((a, b) => {
    const aVal = getSortableValue(a, sortConfig.key);
    const bVal = getSortableValue(b, sortConfig.key);

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedLancamentos.length / itemsPerPage);
  const paginatedLancamentos = sortedLancamentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <table className="table table-sm align-middle small">
        <thead>
          <tr>
            <th
              className="cursor-pointer"
              onClick={() => handleSort("data")}
            >
              Data {sortConfig.key === "data" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            <th
              className="cursor-pointer"
              onClick={() => handleSort("descricao")}
            >
              Descrição {sortConfig.key === "descricao" && (sortConfig.direction === "asc" ? "▲" : "▼")}
            </th>
            {tipo === "completo" && (
              <th
                className="cursor-pointer"
                onClick={() => handleSort("nome_categoria")}
              >
                Categoria {sortConfig.key === "nome_categoria" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
            )}
            {tipo === "completo" && (
              <th
                className="cursor-pointer text-end"
                onClick={() => handleSort("valor")}
              >
                Valor {sortConfig.key === "valor" && (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
            )}
            <th className="text-end" style={{ width: "120px" }}></th>
          </tr>
        </thead>

        <tbody>
          {paginatedLancamentos.length === 0 ? (
            <tr>
              <td colSpan={tipo === "completo" ? 5 : 4} className="text-center">
                Nenhuma transação encontrada.
              </td>
            </tr>
          ) : (
            paginatedLancamentos.map((lancamento) => (
              <tr key={lancamento.id_lancamento}>
                <td>{lancamento.data}</td>
                <td>
                  <span
                    title={lancamento.descricao}
                    style={{ cursor: "help" }}
                  >
                    {formatarDescricao(lancamento.descricao)}
                  </span>
                </td>

                {tipo === "completo" && (
                  <td>{lancamento.nome_categoria}</td>
                )}

                {tipo === "completo" && (
                  <td className="text-end">
                    {Number(lancamento.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                )}

                <td className="text-end">
                  <span
                    className="me-2"
                    title={lancamento.nome_situacao}
                    style={{ cursor: "default" }}
                  >
                    {getSituacaoIcone(lancamento.id_situacao)}
                  </span>

                  <button
                    className="btn btn-link btn-sm p-0 me-2"
                    onClick={() => onEdit(lancamento)}
                    title="Editar"
                  >
                    ✏️
                  </button>

                  <button
                    className="btn btn-link btn-sm p-0"
                    onClick={() => onDelete(lancamento.id_lancamento)}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">
          Página {currentPage} de {totalPages}
        </small>

        <div>
          <button
            className="btn btn-outline-secondary btn-sm me-2"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ◀ Anterior
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Próxima ▶
          </button>
        </div>
      </div>
    </>
  );
}

export default LancamentosTable;