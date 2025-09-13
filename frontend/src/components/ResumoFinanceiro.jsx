import React, { useEffect, useState } from "react";
import api from "../services/http";
import ModalEditarOrcamento from "./ModalEditarOrcamento";
import useEditorToken from "../hooks/useEditorToken";

function ResumoFinanceiro() {
  const [resumo, setResumo] = useState([]);
  const [mostrarModalOrcamento, setMostrarModalOrcamento] = useState(false);
  const [mostrarSegundaTabela, setMostrarSegundaTabela] = useState(false);
  const editorToken = useEditorToken();
  const canEdit = !!editorToken;

  const id_imovel = window.location.pathname.split("/").pop();

  useEffect(() => {
    carregarResumo();
  }, [id_imovel]);

  const carregarResumo = async () => {
    try {
      const { data } = await api.get(`/dashboard/resumo-financeiro/${id_imovel}`);
      setResumo(data);
    } catch (error) {
      console.error("Erro ao buscar resumo financeiro", error);
      // Considerar uma mensagem de erro na UI para o usuário
    }
  };

  // Funções auxiliares
  const calcularEfetivadoMaisContratacao = (item) => {
    return (item.valor_efetivado || 0) + (item.valor_em_contratacao || 0);
  };

  const calcularTotalEstimado = (item) => {
    const orcamento = item.orcamento || 0;
    const efetivadoMaisContratacao = calcularEfetivadoMaisContratacao(item);
    return Math.max(orcamento, efetivadoMaisContratacao);
  };

  const calcularSaldoAInvestir = (item) => {
     // Saldo individual = Total Estimado para o item - Valor Efetivado do item
    return calcularTotalEstimado(item) - (item.valor_efetivado || 0);
  };


  // Filtra os dados para as tabelas
  const primeiraTabela = resumo.filter(item => ![6, 7, 8, 9].includes(item.id_grupo));
  const terceiraTabela = resumo.filter(item => [6, 7, 8, 9].includes(item.id_grupo));

  // Calcula os totais para a primeira tabela, INCLUINDO o novo total de Saldo a Investir
  const calcularTotais = (dados) => {
    return {
      orcamento: dados.reduce((acc, item) => acc + (item.orcamento || 0), 0),
      valor_efetivado: dados.reduce((acc, item) => acc + (item.valor_efetivado || 0), 0),
      valor_em_contratacao: dados.reduce((acc, item) => acc + (item.valor_em_contratacao || 0), 0),
      efetivado_mais_contratacao: dados.reduce((acc, item) => {
        const soma = (item.valor_efetivado || 0) + (item.valor_em_contratacao || 0);
        return acc + soma;
      }, 0),
      valor_total_estimado: dados.reduce((acc, item) => {
        const efetivadoMaisContratacao = (item.valor_efetivado || 0) + (item.valor_em_contratacao || 0);
        const maiorValor = Math.max(item.orcamento || 0, efetivadoMaisContratacao);
        return acc + maiorValor;
      }, 0),
      // NOVO CÁLCULO: Soma dos saldos individuais a investir de cada item
      saldo_a_investir_total: dados.reduce((acc, item) => {
          const saldoIndividual = calcularSaldoAInvestir(item); // Reutiliza a função de cálculo individual
          return acc + saldoIndividual;
      }, 0)
    };
  };

  const totaisPrimeira = calcularTotais(primeiraTabela);

  // Busca dos grupos necessários para o Fechamento
  const grupo6 = terceiraTabela.find(item => item.id_grupo === 6); // Financiamento a Quitar
  const grupo7 = terceiraTabela.find(item => item.id_grupo === 7); // Corretor
  const grupo8 = terceiraTabela.find(item => item.id_grupo === 8); // Valor de Venda
  const grupo9 = terceiraTabela.find(item => item.id_grupo === 9); // IR Ganho de Capital

  const totalEstimadoGrupo6 = grupo6 ? calcularTotalEstimado(grupo6) : 0; // B2
  const totalEstimadoGrupo7 = grupo7 ? calcularTotalEstimado(grupo7) : 0; // B6
  const totalEstimadoGrupo8 = grupo8 ? calcularTotalEstimado(grupo8) : 0; // B5
  const totalEstimadoGrupo9 = grupo9 ? calcularTotalEstimado(grupo9) : 0; // B8

  const investimentoTotal = totaisPrimeira.valor_total_estimado; // B1
  const custoDoImovel = investimentoTotal + totalEstimadoGrupo6; // B3

  const valorDeVenda = totalEstimadoGrupo8; // B5
  const corretor = totalEstimadoGrupo7; // B6

  // Cálculo do Ganho de Capital antes do IR
  const ganhoCapitalBase = valorDeVenda - custoDoImovel - corretor;

  // Cálculo do IR Ganho de Capital: Máximo entre o orçado (grupo 9) e o cálculo baseado no ganho real
  const irGanhoDeCapital = Math.max(
    totalEstimadoGrupo9,
    ganhoCapitalBase > 0 ? ganhoCapitalBase * 0.15 : 0 // usa taxa fixa de 15%
  );
  
  const resultadoLiquido = valorDeVenda - custoDoImovel - corretor - irGanhoDeCapital;

  // ROI = Resultado Líquido / Investimento Total (apenas a parte investida, não o custo total)
  const roi = investimentoTotal > 0 ? (resultadoLiquido / investimentoTotal) : 0;

   // Nota: A variável 'imovel' usada no cálculo do IR Ganho de Capital não está sendo buscada neste componente.
   // Ela é usada no componente DadosCadastrais. Para usar 'imovel.ganho_capital' aqui, você precisaria:
   // 1. Buscar os dados do imóvel também neste componente ResumoFinanceiro, OU
   // 2. Passar os dados do imóvel (ou apenas 'imovel.ganho_capital') como prop de Dashboard para ResumoFinanceiro.
   // Por enquanto, estou assumindo 0.15 (15%) se 'imovel' não existir aqui. Se você já busca 'imovel' e está apenas omitindo no contexto fornecido, ignore esta nota.

  return (
    <div className="col-12 mb-3">
      <div className="card p-3 shadow-sm position-relative">

        {/* Botões do cabeçalho */}
        <div className="position-absolute top-0 end-0 p-2 d-flex gap-2">
          <span
            className="fs-5 text-secondary"
            onClick={() => setMostrarSegundaTabela(!mostrarSegundaTabela)}
            title={mostrarSegundaTabela ? "Recolher Detalhamento" : "Expandir Detalhamento"}
            style={{ cursor: "pointer" }} // Adiciona style para indicar que é clicável
          >
            {mostrarSegundaTabela ? "🔽" : "▶️"}
          </span>

          {canEdit && (
            <span
              className="fs-4 text-primary"
              onClick={() => setMostrarModalOrcamento(true)}
              title="Atualizar Orçamento"
              style={{ cursor: "pointer" }}
            >
              ✏️
            </span>
          )}
        </div>

        <h2 className="fs-6 fw-bold mb-3">Resumo Financeiro</h2>

{/* Primeira Tabela */}
<div className="table-responsive mb-4">
  <table className="table table-sm table-striped align-middle small">
    <thead>
      <tr>
        <th>Grupo</th>
        <th className="text-end">Orçamento</th>
        <th className="text-end">Efetivado</th>
        <th className="text-end">Em Contratação</th>
        <th className="text-end">Efetivado + Em Contratação</th>
        {/* NOVO CÁLCULO AQUI: Saldo a Investir individual */}
        <th className="text-end">Saldo a Investir</th>
        <th className="text-end">Total Estimado</th>
      </tr>
    </thead>
    <tbody>
      {primeiraTabela.map(item => (
        <tr key={item.id_grupo}>
          <td>{item.grupo}</td>
          <td className="text-end">
            {Number(item.orcamento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
          <td className="text-end">
            {Number(item.valor_efetivado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
          <td className="text-end">
            {Number(item.valor_em_contratacao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
          <td className="text-end">
            {calcularEfetivadoMaisContratacao(item).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
          {/* EXIBE o Saldo a Investir individual */}
          <td className="text-end">
            {calcularSaldoAInvestir(item).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
          <td className="text-end">
            {calcularTotalEstimado(item).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </td>
        </tr>
      ))}
      <tr className="fw-bold">
        <td>Total</td>
        <td className="text-end">
          {totaisPrimeira.orcamento.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
        <td className="text-end">
          {totaisPrimeira.valor_efetivado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
        <td className="text-end">
          {totaisPrimeira.valor_em_contratacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
        <td className="text-end">
          {totaisPrimeira.efetivado_mais_contratacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
        {/* EXIBE o NOVO total de Saldo a Investir (soma dos individuais) */}
        <td className="text-end">
          {totaisPrimeira.saldo_a_investir_total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
        <td className="text-end">
          {totaisPrimeira.valor_total_estimado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </td>
      </tr>
    </tbody>
  </table>
</div>

        {/* Segunda Tabela (Fechamento) */}
        {/* Note: Esta tabela usa totais Estimados dos grupos específicos, não os totais da primeira tabela */}
        <div className="mb-4" style={{ maxWidth: "400px" }}>
          <h3 className="fs-6 fw-bold mb-2">Fechamento</h3>
          <table className="table table-sm align-middle small mb-0">
            <tbody>
              <tr>
                <td>Investimento Total</td>
                <td className="text-end">
                  {investimentoTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
              <tr>
                <td>Financiamento a Quitar</td>
                <td className="text-end">
                  {totalEstimadoGrupo6.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
              <tr className="fw-bold">
                <td>Custo do Imóvel</td>
                <td className="text-end">
                  {custoDoImovel.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>

              <tr>
                <td colSpan="2"> </td>{/* Linha em branco para separação */}
              </tr>

              <tr>
                <td>Valor de Venda</td>
                <td className="text-end">
                  {valorDeVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
              <tr>
                <td>Corretor</td>
                <td className="text-end">
                  {corretor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
               <tr>
                <td>IR Ganho de Capital</td>
                <td className="text-end">
                  {irGanhoDeCapital.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
              <tr className="fw-bold">
                <td>Resultado Líquido</td>
                <td className="text-end">
                  {resultadoLiquido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
              <tr className="fw-bold">
                <td>ROI</td>
                <td className="text-end">
                  {(roi * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terceira Tabela (detalhamento expandido dos grupos de fechamento) */}
        {mostrarSegundaTabela && (
          <div className="table-responsive">
            <h3 className="fs-6 fw-bold mb-2">Detalhamento Fechamento</h3>
            <table className="table table-sm table-striped align-middle small">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th className="text-end">Orçamento</th>
                  <th className="text-end">Efetivado</th>
                  <th className="text-end">Em Contratação</th>
                  <th className="text-end">Efetivado + Em Contratação</th>
                  <th className="text-end">Total Estimado</th>
                </tr>
              </thead>
              <tbody>
                {terceiraTabela.map(item => (
                  <tr key={item.id_grupo}>
                    <td>{item.grupo}</td>
                    <td className="text-end">
                      {Number(item.orcamento).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="text-end">
                      {Number(item.valor_efetivado).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="text-end">
                      {Number(item.valor_em_contratacao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="text-end">
                      {calcularEfetivadoMaisContratacao(item).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="text-end">
                      {calcularTotalEstimado(item).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Edição do Orçamento */}
        {mostrarModalOrcamento && (
          <ModalEditarOrcamento
            id_imovel={id_imovel}
            onClose={() => setMostrarModalOrcamento(false)}
            onSave={() => {
              setMostrarModalOrcamento(false);
              carregarResumo(); // Recarrega os dados após salvar
            }}
          />
        )}

      </div>
    </div>
  );
}

export default ResumoFinanceiro;
