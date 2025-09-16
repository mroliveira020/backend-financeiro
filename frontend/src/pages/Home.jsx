import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchImoveis, deleteImovel, addImovel, fetchUltimaAtualizacao, fetchUltimosLancamentos } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import useEditorToken from "../hooks/useEditorToken";
import "./Home.css";

function Home() {
  const [imoveis, setImoveis] = useState([]);
  const [newImovel, setNewImovel] = useState({ nome: "", vendido: false });
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [showUltimos, setShowUltimos] = useState(false);
  const [ultimos, setUltimos] = useState([]);
  const [loadingUltimos, setLoadingUltimos] = useState(false);
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
    <div className="container py-4">
      <header className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h1 className="fs-3 fw-bold mb-1">Painel de Imóveis</h1>
          <p className="text-muted mb-0">Acompanhe os resultados e acesse os dashboards de cada operação.</p>
        </div>
        <div className="badge bg-light text-uppercase text-primary fw-semibold px-3 py-2 align-self-start align-self-md-center">
          {canEdit ? "Modo editor ativo" : "Visualização somente leitura"}
        </div>
      </header>

      {/* Formulário para adicionar novo imóvel (apenas Editor) */}
      {canEdit && (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h2 className="fs-6 fw-semibold text-uppercase text-muted">Adicionar novo imóvel</h2>
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
        <button className="btn btn-primary btn-sm" onClick={handleAddImovel} disabled={!newImovel.nome.trim()}>
          Cadastrar imóvel
        </button>
        </div>
      </div>
      )}

      {/* Lista de imóveis */}
      {imoveis.length === 0 ? (
        <p className="fs-6 text-muted">Carregando imóveis...</p>
      ) : (
        <div className="row g-4">
          {imoveis.map((imovel) => (
            <div key={imovel.id} className="col-12 col-md-6 col-lg-4 d-flex">
              <div className="card border-0 shadow-sm w-100 property-card">
                <div className="property-card__header">
                  <div className="d-flex align-items-center text-white">
                    <img
                      src="/img/dashboard.png"
                      alt="Dashboard"
                      className="property-card__icon"
                    />
                    <Link to={`/dashboard/${imovel.id}`} className="property-card__title text-white text-decoration-none">
                      {imovel.nome}
                    </Link>
                  </div>
                  <span
                    className={`property-card__status ${imovel.vendido ? "property-card__status--sold" : "property-card__status--available"}`}
                  >
                    {imovel.vendido ? "Vendido" : "Disponível"}
                  </span>
                </div>

                <div className="property-card__body">
                  <p
                    className={`property-card__amount ${Number(imovel.totalLancamentos ?? 0) >= 0 ? "property-card__amount--positive" : "property-card__amount--negative"}`}
                  >
                    {Number(imovel.totalLancamentos ?? 0).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p className="text-secondary small mb-3">Total lançado</p>

                  <div className="property-card__actions">
                    <img
                      src="/img/google-maps.png"
                      alt="Ver no mapa"
                      title="Ver no mapa"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(imovel.nome)}`, "_blank")}
                    />
                    {canEdit && (
                      <>
                        <img
                          src="/img/editar.png"
                          alt="Editar"
                          title="Editar imóvel"
                          onClick={() => console.log("Editar imóvel:", imovel.id)}
                        />
                        {imovel.totalLancamentos === 0 && (
                          <img
                            src="/img/excluir.png"
                            alt="Excluir"
                            title="Excluir imóvel"
                            onClick={() => deleteImovel(imovel.id)}
                          />
                        )}
                      </>
                    )}
                    <img
                      src={imovel.vendido ? "/img/casa_indisponivel.png" : "/img/casa_disponivel.png"}
                      alt={imovel.vendido ? "Vendido" : "Disponível"}
                      title={imovel.vendido ? "Vendido" : "Disponível"}
                    />
                  </div>

                  <div className="property-card__cta">
                    <Link
                      to={`/dashboard/${imovel.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Abrir dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé com Data de Atualização e Ação */}
      <div className="mt-5 pt-3 border-top d-flex justify-content-between align-items-center small text-muted flex-wrap gap-2">
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
