import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchImoveis, deleteImovel, addImovel } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import useEditorToken from "../hooks/useEditorToken";
import { hasEditorToken } from "../services/auth";

function Home() {
  const [imoveis, setImoveis] = useState([]);
  const [newImovel, setNewImovel] = useState({ nome: "", vendido: false });
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
    </div>
  );
}

export default Home;
