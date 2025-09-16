import React from "react";
import { Link, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import DadosCadastrais from "../components/dadosCadastrais/DadosCadastrais";
import ResumoFinanceiro from "../components/ResumoFinanceiro";
import TransacoesIncompletas from "../components/TransacoesIncompletas/TransacoesIncompletas";
import TransacoesCompletas from "../components/transacoes/TransacoesCompletas";

function Dashboard() {
  const { id } = useParams();

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">Dashboard</h1>
        <Link to="/" className="btn btn-outline-secondary">
          ← Voltar para a Home
        </Link>
      </div>

      {/* PRIMEIRA SEÇÃO - DADOS CADASTRAIS E RESUMO FINANCEIRO */}
      <div className="row mb-4">
        <div className="col-12 mb-3">
          <DadosCadastrais />
        </div>
        <div className="col-12">
          <ResumoFinanceiro />
        </div>
      </div>

      {/* SEGUNDA SEÇÃO - NÃO MEXI! */}
      <div className="row mt-4">
        <TransacoesIncompletas />
        <TransacoesCompletas />
      </div>
    </div>
  );
}

export default Dashboard;
