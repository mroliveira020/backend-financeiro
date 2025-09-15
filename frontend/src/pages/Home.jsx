import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchImoveis, deleteImovel, addImovel, fetchUltimaAtualizacao, fetchUltimosLancamentos } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import useEditorToken from "../hooks/useEditorToken";
import { hasEditorToken } from "../services/auth";

function Home() {
  const [imoveis, setImoveis] = useState([]);
  const [newImovel, setNewImovel] = useState({ nome: "", vendido: false });
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [showUltimos, setShowUltimos] = useState(false);
  const [ultimos, setUltimos] = useState([]);
  const [loadingUltimos, setLoadingUltimos] = useState(false);
  const navigate = useNavigate();
  const editorToken = useEditorToken();
  const canEdit = !!editorToken;

  useEffect(() => {
    fetchImoveis().then((data) => {
      const imoveisCorrigidos = data.map((imovel) => ({
        ...imovel,
        totalLancamentos: imovel.totallancamentos,
      }));
      setImoveis(imoveisCorrigidos);
    });
    // Carrega data de atualização
    fetchUltimaAtualizacao()
      .then((res) => setUltimaAtualizacao(res?.data || null))
      .catch(() => setUltimaAtualizacao(null));
  }, []);

  const handleAddImovel = async () => {
    if (!newImovel.nome.trim()) return;

    try {
      const novoImovel = await addImovel(newImovel);
      setImoveis((prevImoveis) => [...prevImoveis, { ...novoImovel, totalLancamentos: 0 }]);
      setNewImovel({ nome: "", vendido: false }); // Limpa o formulário após cadastro
    } catch (error) {
      console.error("Erro ao cadastrar imóvel:", error);
    }
  };

  return (
    <div className="container mt-3">
      <h1 className="fs-4 fw-bold mb-3">Lista de Imóveis</h1>

      {/* Formulário para adicionar novo imóvel (apenas Editor) */}
      {canEdit && (
      <div className="card mb-3 p-2">
        <h2 className="fs-6 fw-semibold">Adicionar Novo Imóvel</h2>
        <input
          type="text"
          placeholder="Nome do imóvel"
          value={newImovel.nome}
          onChange={(e) => setNewImovel({ ...newImovel, nome: e.target.value })}
          className="form-control form-control-sm mb-2"
        />
        <select
          className="form-select form-select-sm mb-2"
          value={newImovel.vendido}
          onChange={(e) => setNewImovel({ ...newImovel, vendido: JSON.parse(e.target.value) })}
        >
          <option value="false">Disponível</option>
          <option value="true">Vendido</option>
        </select>
        <button className="btn btn-success btn-sm" onClick={handleAddImovel} disabled={!newImovel.nome.trim()}>
          Cadastrar
        </button>
      </div>
      )}

      {/* Lista de imóveis */}
      {imoveis.length === 0 ? (
        <p className="fs-6 text-muted">Carregando imóveis...</p>
      ) : (
        <div className="row">
          {imoveis.map((imovel) => (
            <div key={imovel.id} className="col-md-4 mb-2">
              <div className="card shadow-sm p-2 position-relative">
                {/* Ícones no canto superior direito */}
                <div className="position-absolute top-0 end-0 p-2 d-flex align-items-center gap-2 z-3">
                  <img
                    src="/img/google-maps.png"
                    alt="Google Maps"
                    width="22"
                    height="22"
                  />
                  {canEdit && (
                    <>
                      <img
                        src="/img/editar.png"
                        alt="Editar"
                        width="22"
                        height="22"
                        className="cursor-pointer"
                        onClick={() => console.log("Editar imóvel:", imovel.id)}
                      />
                      {imovel.totalLancamentos === 0 && (
                        <img
                          src="/img/excluir.png"
                          alt="Excluir"
                          width="22"
                          height="22"
                          className="cursor-pointer"
                          onClick={() => deleteImovel(imovel.id)}
                        />
                      )}
                    </>
                  )}

                  <img
                    src={imovel.vendido ? "/img/casa_indisponivel.png" : "/img/casa_disponivel.png"}
                    alt={imovel.vendido ? "Vendido" : "Disponível"}
                    width="25"
                    height="25"
                  />
                </div>

                {/* Ícone do Dashboard antes do nome */}
                <div className="d-flex align-items-center">
                  <img
                    src="/img/dashboard.png"
                    alt="Dashboard"
                    width="24"
                    height="24"
                    className="cursor-pointer me-2"
                    onClick={() => navigate(`/dashboard/${imovel.id}`)}
                  />
                  <h2 className="fs-6 fw-bold mb-1 mb-0">
                    <Link to={`/dashboard/${imovel.id}`} className="text-decoration-none">
                      {imovel.nome}
                    </Link>
                  </h2>
                </div>

                <p className="text-muted fs-7 mb-1">
                  Total Lançado: {Number(imovel.totalLancamentos ?? 0).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>

                {/* Tornar o card inteiro clicável com Bootstrap stretched-link */}
                <Link
                  to={`/dashboard/${imovel.id}`}
                  className="stretched-link"
                  aria-label={`Abrir dashboard do imóvel ${imovel.nome}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé com Data de Atualização e Ação */}
      <div className="mt-4 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
        <span>
          Data de atualização: <strong>{ultimaAtualizacao || "—"}</strong>
        </span>
        <button
          type="button"
          className="btn btn-link btn-sm p-0"
          onClick={async () => {
            setShowUltimos(true);
            setLoadingUltimos(true);
            try {
              const itens = await fetchUltimosLancamentos(10);
              setUltimos(itens || []);
            } catch (e) {
              setUltimos([]);
            } finally {
              setLoadingUltimos(false);
            }
          }}
        >
          Ver últimos 10 lançamentos
        </button>
      </div>

      {/* Modal simples para últimos lançamentos */}
      {showUltimos && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
          onClick={() => setShowUltimos(false)}
        >
          <div
            className="card shadow position-absolute p-3"
            style={{ maxWidth: 700, width: "95%", top: "10%", left: "50%", transform: "translateX(-50%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="fs-6 fw-semibold mb-0">Últimos 10 lançamentos</h2>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowUltimos(false)}>Fechar</button>
            </div>
            {loadingUltimos ? (
              <p className="text-muted mb-0">Carregando...</p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: 400, overflowY: "auto" }}>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Descrição</th>
                      <th className="text-end">Valor</th>
                      <th>Imóvel</th>
                      <th>Categoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ultimos || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.data}</td>
                        <td>{item.descricao}</td>
                        <td className="text-end">
                          {Number(item.valor ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                        <td>{item.imovel}</td>
                        <td>{item.categoria}</td>
                      </tr>
                    ))}
                    {(!ultimos || ultimos.length === 0) && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">Nenhum lançamento encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
