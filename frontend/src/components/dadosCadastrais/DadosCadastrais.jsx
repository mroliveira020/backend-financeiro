import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/http";
import ModalSelecionarImovel from "./ModalSelecionarImovel";
import ModalEditarImovel from "./ModalEditarImovel";
import useEditorToken from "../../hooks/useEditorToken";

function DadosCadastrais() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [imovel, setImovel] = useState(null);
  const [expandir, setExpandir] = useState(false);
  const [mostrarModalImoveis, setMostrarModalImoveis] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const editorToken = useEditorToken();
  const canEdit = !!editorToken;

  useEffect(() => {
    fetchImovel();
  }, [id]);

  const fetchImovel = async () => {
    try {
      const { data } = await api.get(`/imoveis/${id}`);
      setImovel(data);
    } catch (error) {
      console.error("Erro ao buscar dados do imóvel", error);
    }
  };

  const trocarImovel = (novoId) => {
    setMostrarModalImoveis(false);
    navigate(`/dashboard/${novoId}`);
  };

  const renderMapa = () => {
    if (imovel.latitude && imovel.longitude) {
      const mapaUrl = `https://maps.google.com/maps?q=${imovel.latitude},${imovel.longitude}&z=15&output=embed`;
      return (
        <iframe
          title="Mapa do Imóvel"
          src={mapaUrl}
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: "8px" }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      );
    } else {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#888",
          }}
        >
          Localização não informada
        </div>
      );
    }
  };

  // Garantir que temos números antes de formatar
  const formatarPorcentagem = (valor) => {
    if (valor === null || valor === undefined || isNaN(valor)) {
      return "0,00%";
    }
    return (parseFloat(valor) * 100).toFixed(2).replace('.', ',') + "%";
  };

  const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || isNaN(parseFloat(valor))) {
      return "R$ 0,00";
    }
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (!imovel) {
    return (
      <div className="col-12 mb-3">
        <div className="card p-3 shadow-sm">Carregando dados do imóvel...</div>
      </div>
    );
  }

  return (
    <div className="col-12 mb-3">
      <div className="card p-3 shadow-sm position-relative">

        {/* Ícone de troca de imóvel */}
        <div className="position-absolute top-0 end-0 p-2">
          <span
            className="fs-4 text-primary cursor-pointer"
            onClick={() => setMostrarModalImoveis(true)}
            title="Trocar de imóvel"
            style={{ cursor: "pointer" }}
          >
            🏠 ➡️
          </span>
        </div>

        {/* Linha principal com mapa e nome */}
        <div className="d-flex align-items-center">
          <div
            className="flex-grow-0"
            style={{
              width: "25%",
              height: "170px",
              background: "#ddd",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {renderMapa()}
          </div>

          <div
            className="ms-3 flex-grow-1 d-flex justify-content-center align-items-center"
            style={{
              height: "120px",
            }}
          >
            <h2
              className="fw-bold mb-0"
              style={{ fontSize: "1.8rem", textAlign: "center" }}
            >
              {imovel.nome}
            </h2>
          </div>
        </div>

        {/* Botão expandir/recolher */}
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-sm btn-link p-0 d-flex align-items-center"
            onClick={() => setExpandir(!expandir)}
          >
            {expandir ? (
              <>
                ▲ <span className="ms-1">Ocultar detalhes</span>
              </>
            ) : (
              <>
                ▼ <span className="ms-1">Mostrar detalhes</span>
              </>
            )}
          </button>
        </div>

        {/* Detalhes adicionais */}
        {expandir && (
          <div className="mt-2 small">
            <p><strong>Endereço:</strong> {imovel.endereco || "Não informado"}</p>
            <p><strong>Ocupante:</strong> {imovel.nome_ocupante || "Não informado"}</p>
            <p><strong>CPF Ocupante:</strong> {imovel.cpf_ocupante || "Não informado"}</p>
            <p><strong>Latitude:</strong> {imovel.latitude || "Não informado"}</p>
            <p><strong>Longitude:</strong> {imovel.longitude || "Não informado"}</p>
            <p><strong>Vendido:</strong> {imovel.vendido ? "Sim" : "Não"}</p>
            <p><strong>Corretagem:</strong> {formatarPorcentagem(imovel.corretagem)}</p>
            <p><strong>Ganho Capital:</strong> {formatarPorcentagem(imovel.ganho_capital)}</p>
            <p><strong>Valor de Venda:</strong> {formatarMoeda(imovel.valor_venda)}</p>

            {canEdit && (
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={() => setMostrarModalEditar(true)}
              >
                Editar Dados
              </button>
            )}
          </div>
        )}

        {/* Modal de seleção de imóveis */}
        {mostrarModalImoveis && (
          <ModalSelecionarImovel
            onClose={() => setMostrarModalImoveis(false)}
            onSelectImovel={trocarImovel}
          />
        )}

        {/* Modal de edição de dados */}
        {mostrarModalEditar && (
          <ModalEditarImovel
            imovel={imovel}
            onClose={() => setMostrarModalEditar(false)}
            onSave={() => {
              setMostrarModalEditar(false);
              fetchImovel();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default DadosCadastrais;
