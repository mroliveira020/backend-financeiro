import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchImoveis,
  deleteImovel,
  addImovel,
  fetchUltimaAtualizacao,
  fetchUltimosLancamentos,
  fetchGastosMensais,
  fetchCategorias,
} from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import useEditorToken from "../hooks/useEditorToken";
import "./Home.css";
import GastosMensaisChart from "../components/GastosMensaisChart";

const GRAFICO_PREF_KEY = "financeiro:gastos-pref";
const DEFAULT_CHART_PREF = { meses: 6, excluir: [8, 15, 18] };

function Home() {
  const [imoveis, setImoveis] = useState([]);
  const [loadingImoveis, setLoadingImoveis] = useState(true);
  const [erroImoveis, setErroImoveis] = useState(false);
  const [newImovel, setNewImovel] = useState({ nome: "", vendido: false });
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [showUltimos, setShowUltimos] = useState(false);
  const [ultimos, setUltimos] = useState([]);
  const [loadingUltimos, setLoadingUltimos] = useState(false);
  const [gastosMensais, setGastosMensais] = useState([]);
  const [loadingGastos, setLoadingGastos] = useState(true);
  const [erroGastos, setErroGastos] = useState(false);
  const [chartPref, setChartPref] = useState(() => ({
    meses: DEFAULT_CHART_PREF.meses,
    excluir: [...DEFAULT_CHART_PREF.excluir],
  }));
  const [prefReady, setPrefReady] = useState(false);
  const [showConfigChart, setShowConfigChart] = useState(false);
  const [configDraft, setConfigDraft] = useState(() => ({
    meses: DEFAULT_CHART_PREF.meses,
    excluir: [...DEFAULT_CHART_PREF.excluir],
  }));
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(false);
  const [categoriasErro, setCategoriasErro] = useState(false);
  const editorToken = useEditorToken();
  const canEdit = !!editorToken;

  useEffect(() => {
    let storedPref = {
      meses: DEFAULT_CHART_PREF.meses,
      excluir: [...DEFAULT_CHART_PREF.excluir],
    };
    const raw = localStorage.getItem(GRAFICO_PREF_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const meses = Number(parsed?.meses);
        const mesesValidos = Number.isFinite(meses)
          ? Math.max(1, Math.min(24, meses))
          : DEFAULT_CHART_PREF.meses;
        let excluir = parsed?.excluir;
        if (Array.isArray(excluir)) {
          excluir = excluir
            .map((item) => {
              const num = Number(item);
              return Number.isFinite(num) ? num : null;
            })
            .filter((item) => item !== null);
        } else {
          excluir = DEFAULT_CHART_PREF.excluir;
        }
        storedPref = {
          meses: mesesValidos,
          excluir: Array.from(new Set(excluir)),
        };
      } catch (error) {
        storedPref = {
          meses: DEFAULT_CHART_PREF.meses,
          excluir: [...DEFAULT_CHART_PREF.excluir],
        };
      }
    }
    setChartPref(storedPref);
    setConfigDraft(storedPref);
    setPrefReady(true);
  }, []);

  useEffect(() => {
    setLoadingImoveis(true);
    setErroImoveis(false);
    fetchImoveis()
      .then((data) => {
        const imoveisCorrigidos = data.map((imovel) => ({
          ...imovel,
          totalLancamentos: imovel.totallancamentos,
        }));
        setImoveis(imoveisCorrigidos);
      })
      .catch(() => {
        setErroImoveis(true);
        setImoveis([]);
      })
      .finally(() => setLoadingImoveis(false));

    fetchUltimaAtualizacao()
      .then((res) => setUltimaAtualizacao(res?.data || null))
      .catch(() => setUltimaAtualizacao(null));
  }, []);

  useEffect(() => {
    if (!prefReady) {
      return;
    }

    setLoadingGastos(true);
    setErroGastos(false);

    fetchGastosMensais(chartPref.meses, chartPref.excluir || [])
      .then((dados) => {
        setGastosMensais(dados || []);
        setErroGastos(false);
      })
      .catch(() => {
        setGastosMensais([]);
        setErroGastos(true);
      })
      .finally(() => setLoadingGastos(false));
  }, [prefReady, chartPref.meses, (chartPref.excluir || []).join(',')]);

  useEffect(() => {
    if (!prefReady) return;
    localStorage.setItem(GRAFICO_PREF_KEY, JSON.stringify(chartPref));
  }, [chartPref, prefReady]);

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

  const carregarCategorias = async () => {
    setCategoriasLoading(true);
    setCategoriasErro(false);
    try {
      const lista = await fetchCategorias();
      const ordenadas = (lista || [])
        .map((item) => ({ id: item.id, nome: item.categoria }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      setCategoriasDisponiveis(ordenadas);
    } catch (error) {
      console.error("Erro ao carregar categorias: ", error);
      setCategoriasErro(true);
    } finally {
      setCategoriasLoading(false);
    }
  };

  const handleToggleConfig = () => {
    const next = !showConfigChart;
    if (!showConfigChart) {
      setConfigDraft({
        meses: chartPref.meses,
        excluir: [...(chartPref.excluir || [])],
      });
      if (!categoriasDisponiveis.length && !categoriasLoading) {
        carregarCategorias();
      }
    }
    setShowConfigChart(next);
  };

  const toggleCategoriaExcluida = (idCategoria) => {
    setConfigDraft((prev) => {
      const atual = prev.excluir || [];
      const existe = atual.includes(idCategoria);
      const atualizado = existe
        ? atual.filter((item) => item !== idCategoria)
        : [...atual, idCategoria];
      return { ...prev, excluir: atualizado };
    });
  };

  const incluirTodasCategorias = () => {
    setConfigDraft((prev) => ({ ...prev, excluir: [] }));
  };

  const restaurarPadraoCategorias = () => {
    setConfigDraft({
      meses: DEFAULT_CHART_PREF.meses,
      excluir: [...DEFAULT_CHART_PREF.excluir],
    });
  };

  const handleAplicarConfiguracao = (event) => {
    event.preventDefault();
    const mesesBrutos = configDraft.meses;
    let mesesNormalizados = DEFAULT_CHART_PREF.meses;
    if (mesesBrutos !== "" && mesesBrutos !== null) {
      const mesesNumero = Number(mesesBrutos);
      if (Number.isFinite(mesesNumero)) {
        mesesNormalizados = Math.max(1, Math.min(24, mesesNumero));
      }
    }

    const excluir = Array.from(
      new Set((configDraft.excluir || []).map((item) => Number(item)).filter((item) => Number.isFinite(item)))
    );

    setChartPref({ meses: mesesNormalizados, excluir });
    setShowConfigChart(false);
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

      {/* Gráfico de desembolsos mensais */}
      <section className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
            <div>
              <h2 className="fs-5 fw-semibold mb-0">Desembolsos mensais</h2>
              <small className="text-muted">
                Valores confirmados (situação 1) nos últimos {chartPref.meses} meses.
              </small>
            </div>
            <button
              type="button"
              className="btn btn-light btn-sm border-0 text-secondary d-flex align-items-center gap-1"
              onClick={handleToggleConfig}
            >
              <span aria-hidden="true">⚙️</span>
              <span>Configurar</span>
            </button>
          </div>

          {showConfigChart && (
            <div className="border rounded bg-light-subtle p-3 mb-3">
              <form className="d-flex flex-column gap-3" onSubmit={handleAplicarConfiguracao}>
                <div className="row g-3">
                  <div className="col-sm-4 col-12">
                    <label className="form-label small text-muted text-uppercase">Meses de histórico</label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      className="form-control form-control-sm"
                      value={configDraft.meses === "" ? "" : configDraft.meses}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setConfigDraft((prev) => ({
                          ...prev,
                          meses: valor === "" ? "" : Number(valor),
                        }));
                      }}
                    />
                    <small className="text-muted">Digite entre 1 e 24 meses.</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-muted text-uppercase">Categorias a ocultar</label>
                    {categoriasLoading ? (
                      <p className="text-muted small mb-0">Carregando categorias...</p>
                    ) : categoriasErro ? (
                      <p className="text-danger small mb-0">Não foi possível carregar as categorias.</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {categoriasDisponiveis.map((categoria) => (
                          <label key={categoria.id} className="form-check form-check-inline small mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input me-1"
                              checked={(configDraft.excluir || []).includes(categoria.id)}
                              onChange={() => toggleCategoriaExcluida(categoria.id)}
                            />
                            <span className="form-check-label">{categoria.nome}</span>
                          </label>
                        ))}
                        {!categoriasDisponiveis.length && !categoriasLoading && !categoriasErro && (
                          <span className="text-muted small">Nenhuma categoria disponível.</span>
                        )}
                      </div>
                    )}
                    <div className="d-flex gap-3 mt-2">
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        onClick={incluirTodasCategorias}
                      >
                        Incluir todas
                      </button>
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0"
                        onClick={restaurarPadraoCategorias}
                      >
                        Restaurar padrão
                      </button>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowConfigChart(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Aplicar
                  </button>
                </div>
              </form>
            </div>
          )}
          {loadingGastos ? (
            <div className="text-center text-muted py-4">Carregando gráfico...</div>
          ) : erroGastos ? (
            <div className="text-center text-muted py-4">
              <p className="mb-1">Não foi possível carregar os dados.</p>
              <small>Tente novamente mais tarde.</small>
            </div>
          ) : (
            <GastosMensaisChart dados={gastosMensais} />
          )}
        </div>
      </section>

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
      {loadingImoveis ? (
        <p className="fs-6 text-muted">Carregando imóveis...</p>
      ) : erroImoveis ? (
        <div className="alert alert-warning" role="alert">
          Não foi possível carregar a lista de imóveis. Verifique sua conexão ou tente novamente mais tarde.
        </div>
      ) : imoveis.length === 0 ? (
        <p className="fs-6 text-muted">Nenhum imóvel cadastrado ainda.</p>
      ) : (
        <div className="row g-4">
          {imoveis.map((imovel) => (
            <div key={imovel.id} className="col-12 col-md-6 col-lg-4 d-flex">
              <div className="card border-0 shadow-sm w-100 property-card">
                <div className="property-card__header">
                  <div className="d-flex align-items-center text-body">
                    <img
                      src="/img/dashboard.png"
                      alt="Dashboard"
                      className="property-card__icon"
                    />
                    <Link to={`/dashboard/${imovel.id}`} className="property-card__title text-decoration-none">
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
