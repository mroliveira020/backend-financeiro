import React from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import DadosCadastrais from "../components/dadosCadastrais/DadosCadastrais";
import ResumoFinanceiro from "../components/ResumoFinanceiro";
import TransacoesIncompletas from "../components/TransacoesIncompletas/TransacoesIncompletas";
import TransacoesCompletas from "../components/transacoes/TransacoesCompletas";

function Dashboard() {
  const { id } = useParams();

  return (
    <div className="container mt-4">
     

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